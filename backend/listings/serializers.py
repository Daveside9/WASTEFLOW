from rest_framework import serializers
from .models import WasteListing, TradeEvent, WasteReport, Notification


class TradeEventSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.full_name', read_only=True)

    class Meta:
        model  = TradeEvent
        fields = ['id', 'event_type', 'actor_name', 'note', 'timestamp']


class WasteListingSerializer(serializers.ModelSerializer):
    sourcer_name   = serializers.CharField(source='sourcer.full_name', read_only=True)
    sourcer_region = serializers.CharField(source='sourcer.region',    read_only=True)
    weigher_name   = serializers.CharField(source='weigher.full_name', read_only=True, default=None)
    buyer_name     = serializers.CharField(source='buyer.full_name',   read_only=True, default=None)
    timeline       = TradeEventSerializer(many=True, read_only=True)

    class Meta:
        model  = WasteListing
        fields = [
            'id', 'sourcer', 'sourcer_name', 'sourcer_region',
            'waste_type', 'estimated_weight', 'verified_weight', 'agreed_weight',
            'price_per_kg', 'total_price', 'verified_total', 'agreed_total',
            'description', 'location_area', 'lat', 'lng', 'status', 'created_at',
            'weigher', 'weigher_name', 'verified_condition', 'weigher_notes', 'verified_at',
            'buyer', 'buyer_name', 'meeting_point', 'meeting_time', 'payment_method',
            'blue_credits_earned', 'timeline',
        ]
        read_only_fields = [
            'id', 'sourcer', 'sourcer_name', 'sourcer_region',
            'total_price', 'verified_total', 'agreed_total',
            'weigher', 'weigher_name', 'buyer', 'buyer_name',
            'blue_credits_earned', 'timeline', 'created_at',
        ]


class CreateListingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = WasteListing
        fields = [
            'waste_type', 'estimated_weight', 'price_per_kg',
            'description', 'location_area', 'lat', 'lng',
        ]

    def create(self, validated_data):
        request = self.context['request']
        listing = WasteListing.objects.create(sourcer=request.user, **validated_data)
        TradeEvent.objects.create(
            listing=listing, event_type='listing_created', actor=request.user
        )
        return listing


class WasteReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source='reporter.full_name', read_only=True)

    class Meta:
        model  = WasteReport
        fields = ['id', 'reporter', 'reporter_name', 'lat', 'lng',
                  'waste_type', 'description', 'location_area', 'resolved', 'created_at']
        read_only_fields = ['id', 'reporter', 'reporter_name', 'resolved', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = ['id', 'for_role', 'notif_type', 'title', 'body',
                  'listing', 'read', 'created_at']
        read_only_fields = ['id', 'created_at']
