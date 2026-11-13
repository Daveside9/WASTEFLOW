from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import WasteListing, TradeEvent, WasteReport, Notification
from .serializers import (
    WasteListingSerializer, CreateListingSerializer,
    WasteReportSerializer, NotificationSerializer,
)


def _notify(for_role, notif_type, title, body, listing=None, recipient=None):
    Notification.objects.create(
        for_role=for_role, notif_type=notif_type,
        title=title, body=body, listing=listing, recipient=recipient,
    )


# ── Listings ──────────────────────────────────────────────────────────────────

class ListingListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        return CreateListingSerializer if self.request.method == 'POST' else WasteListingSerializer

    def get_queryset(self):
        user = self.request.user
        qs   = WasteListing.objects.select_related('sourcer', 'weigher', 'buyer').prefetch_related('timeline')
        # Buyers only see verified+ listings
        if user.role == 'buyer':
            qs = qs.exclude(status='available')
        return qs

    def perform_create(self, serializer):
        listing = serializer.save()
        _notify('weigher', 'new_listing',
                '🚨 New Waste Needs Verification',
                f'{listing.sourcer.full_name} posted {listing.estimated_weight} kg of '
                f'{listing.waste_type} in {listing.location_area}.',
                listing=listing)
        _notify('seller', 'system',
                '✅ Listing Posted',
                f'Your {listing.estimated_weight} kg of {listing.waste_type} has been listed.',
                listing=listing, recipient=listing.sourcer)


class ListingDetailView(generics.RetrieveAPIView):
    queryset           = WasteListing.objects.select_related('sourcer', 'weigher', 'buyer').prefetch_related('timeline')
    serializer_class   = WasteListingSerializer
    permission_classes = [permissions.IsAuthenticated]


# ── Listing actions ───────────────────────────────────────────────────────────

class ListingActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, action):
        try:
            listing = WasteListing.objects.select_related('sourcer', 'weigher', 'buyer').get(pk=pk)
        except WasteListing.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        user = request.user

        # ── WEIGHER: verify ──
        if action == 'verify':
            if user.role != 'weigher':
                return Response({'detail': 'Only weighers can verify.'}, status=403)
            verified_weight    = float(request.data.get('verified_weight', 0))
            condition          = request.data.get('condition', 'clean')
            notes              = request.data.get('notes', '')
            listing.weigher    = user
            listing.verified_weight    = verified_weight
            listing.verified_total     = verified_weight * float(listing.price_per_kg)
            listing.verified_condition = condition
            listing.weigher_notes      = notes
            listing.verified_at        = timezone.now()
            listing.status             = 'verified'
            listing.save()
            TradeEvent.objects.create(listing=listing, event_type='weight_verified', actor=user,
                note=f'Verified {verified_weight}kg ({condition}) — ₦{listing.verified_total:,.0f}')
            _notify('buyer', 'verified', '✅ Verified Waste Available',
                    f'{verified_weight}kg of {listing.waste_type} from {listing.sourcer.full_name} is ready.',
                    listing=listing)
            _notify('seller', 'verified', '⚖️ Listing Verified',
                    f'{user.full_name} verified your listing at {verified_weight}kg.',
                    listing=listing, recipient=listing.sourcer)

        # ── BUYER: express interest ──
        elif action == 'interest':
            if user.role != 'buyer':
                return Response({'detail': 'Only buyers can express interest.'}, status=403)
            if listing.status != 'verified':
                return Response({'detail': 'Listing must be verified first.'}, status=400)
            listing.buyer  = user
            listing.status = 'reserved'
            listing.save()
            TradeEvent.objects.create(listing=listing, event_type='interest_expressed', actor=user)
            _notify('seller', 'interest', '👀 Buyer Interested',
                    f'{user.full_name} expressed interest in your {listing.estimated_weight}kg listing.',
                    listing=listing, recipient=listing.sourcer)

        # ── BUYER: schedule meeting ──
        elif action == 'schedule':
            if user != listing.buyer:
                return Response({'detail': 'Not your reservation.'}, status=403)
            meeting_point = request.data.get('meeting_point', '')
            meeting_time  = request.data.get('meeting_time')
            listing.meeting_point = meeting_point
            listing.meeting_time  = meeting_time
            listing.save()
            TradeEvent.objects.create(listing=listing, event_type='meeting_scheduled', actor=user,
                note=f'{meeting_point} @ {meeting_time}')
            _notify('seller', 'meeting', '📍 Meeting Scheduled',
                    f'Buyer set a meeting at {meeting_point} on {meeting_time}.',
                    listing=listing, recipient=listing.sourcer)

        # ── BUYER: confirm inspection ──
        elif action == 'inspect':
            if user != listing.buyer:
                return Response({'detail': 'Not your reservation.'}, status=403)
            agreed_weight      = float(request.data.get('agreed_weight', listing.estimated_weight))
            listing.agreed_weight = agreed_weight
            listing.agreed_total  = agreed_weight * float(listing.price_per_kg)
            listing.status        = 'payment_pending'
            listing.save()
            TradeEvent.objects.create(listing=listing, event_type='weight_agreed', actor=user,
                note=f'Agreed {agreed_weight}kg — ₦{listing.agreed_total:,.0f}')
            _notify('seller', 'payment', '✅ Weight Agreed',
                    f'Buyer confirmed {agreed_weight}kg. Awaiting payment.',
                    listing=listing, recipient=listing.sourcer)

        # ── BUYER: pay in-app ──
        elif action == 'pay':
            if user != listing.buyer:
                return Response({'detail': 'Not your reservation.'}, status=403)
            if listing.status not in ('payment_pending', 'inspecting'):
                return Response({'detail': 'Not awaiting payment.'}, status=400)
            method = request.data.get('method', 'Card')
            total  = listing.agreed_total or listing.total_price
            listing.payment_method = method
            listing.save()
            TradeEvent.objects.create(listing=listing, event_type='payment_escrowed', actor=user,
                note=f'₦{total:,.0f} paid via {method} — held in escrow')
            _notify('seller', 'payment', '💰 Payment Received in Escrow',
                    f'{user.full_name} paid ₦{total:,.0f} via {method}. Confirm to release funds.',
                    listing=listing, recipient=listing.sourcer)
            _notify('buyer', 'payment', '✅ Payment Sent',
                    f'Your payment of ₦{total:,.0f} is held in escrow.',
                    listing=listing, recipient=user)

        # ── SELLER: confirm payment received ──
        elif action == 'confirm':
            if user != listing.sourcer:
                return Response({'detail': 'Only the seller can confirm.'}, status=403)
            naira = int(listing.agreed_total or listing.verified_total or listing.total_price)
            listing.status              = 'completed'
            listing.blue_credits_earned = naira
            listing.save()
            TradeEvent.objects.create(listing=listing, event_type='payment_received', actor=user)
            TradeEvent.objects.create(listing=listing, event_type='completed', actor=user,
                note=f'₦{naira:,} earned — {naira:,} Blue Credits awarded')
            _notify('seller', 'completed', '🎉 Trade Completed!',
                    f'Payment confirmed. You earned {naira:,} Blue Credits (₦{naira:,}).',
                    listing=listing, recipient=listing.sourcer)
            _notify('buyer', 'completed', '🎉 Purchase Complete!',
                    f'Your purchase of {listing.waste_type} from {listing.sourcer.full_name} is complete.',
                    listing=listing, recipient=listing.buyer)

        # ── SELLER: cancel ──
        elif action == 'cancel':
            if user != listing.sourcer:
                return Response({'detail': 'Only the seller can cancel.'}, status=403)
            listing.status = 'cancelled'
            listing.save()
            TradeEvent.objects.create(listing=listing, event_type='cancelled', actor=user)

        else:
            return Response({'detail': f'Unknown action: {action}'}, status=400)

        return Response(WasteListingSerializer(listing).data)


# ── Waste Reports ─────────────────────────────────────────────────────────────

class WasteReportListCreateView(generics.ListCreateAPIView):
    serializer_class   = WasteReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WasteReport.objects.select_related('reporter').all()

    def perform_create(self, serializer):
        report = serializer.save(reporter=self.request.user)
        _notify('weigher', 'new_listing', '📍 Waste Reported',
                f'{report.reporter.full_name} reported {report.waste_type} at {report.location_area}.')


# ── Notifications ─────────────────────────────────────────────────────────────

class NotificationListView(generics.ListAPIView):
    serializer_class   = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(
            for_role__in=[user.role, 'all']
        ).order_by('-created_at')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notifications_read(request):
    Notification.objects.filter(
        for_role__in=[request.user.role, 'all'], read=False
    ).update(read=True)
    return Response({'detail': 'Marked as read.'})
