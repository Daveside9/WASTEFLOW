from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Sum, Count
from .models import WasteListing, TradeEvent, WasteReport, Notification


# ─── Custom admin actions ─────────────────────────────────────────────────────

@admin.action(description='✅ Mark selected listings as completed')
def mark_completed(modeladmin, request, queryset):
    queryset.update(status='completed')

@admin.action(description='❌ Cancel selected listings')
def mark_cancelled(modeladmin, request, queryset):
    queryset.update(status='cancelled')

@admin.action(description='🗑 Delete selected listings + their timeline events')
def delete_with_timeline(modeladmin, request, queryset):
    TradeEvent.objects.filter(listing__in=queryset).delete()
    queryset.delete()

@admin.action(description='🧹 Clear ALL listings (wipe entire market data)')
def clear_all_listings(modeladmin, request, queryset):
    TradeEvent.objects.all().delete()
    WasteListing.objects.all().delete()

@admin.action(description='🧹 Clear ALL waste reports')
def clear_all_reports(modeladmin, request, queryset):
    WasteReport.objects.all().delete()

@admin.action(description='🧹 Clear ALL notifications')
def clear_all_notifications(modeladmin, request, queryset):
    Notification.objects.all().delete()

@admin.action(description='✔ Mark selected notifications as read')
def mark_notifs_read(modeladmin, request, queryset):
    queryset.update(read=True)

@admin.action(description='✔ Mark selected reports as resolved')
def mark_resolved(modeladmin, request, queryset):
    queryset.update(resolved=True)


# ─── Trade event inline ───────────────────────────────────────────────────────

class TradeEventInline(admin.TabularInline):
    model           = TradeEvent
    extra           = 0
    can_delete      = True
    readonly_fields = ('event_type', 'actor', 'note', 'timestamp')
    ordering        = ('timestamp',)


# ─── Waste Listing ────────────────────────────────────────────────────────────

@admin.register(WasteListing)
class WasteListingAdmin(admin.ModelAdmin):
    list_display    = (
        'id', 'sourcer_link', 'waste_type_badge', 'estimated_weight',
        'price_per_kg', 'total_price_display', 'status_badge',
        'location_area', 'buyer_link', 'created_at',
    )
    list_filter     = ('status', 'waste_type', 'created_at')
    search_fields   = ('sourcer__full_name', 'sourcer__email', 'location_area', 'description')
    ordering        = ('-created_at',)
    readonly_fields = ('total_price', 'created_at', 'verified_at')
    inlines         = [TradeEventInline]
    date_hierarchy  = 'created_at'
    list_per_page   = 25
    actions         = [mark_completed, mark_cancelled, delete_with_timeline, clear_all_listings]

    fieldsets = (
        ('Listing Info', {
            'fields': ('sourcer', 'waste_type', 'estimated_weight', 'price_per_kg',
                       'total_price', 'description', 'location_area', 'lat', 'lng', 'status')
        }),
        ('Verification', {
            'fields': ('weigher', 'verified_weight', 'verified_total',
                       'verified_condition', 'weigher_notes', 'verified_at'),
            'classes': ('collapse',),
        }),
        ('Trade', {
            'fields': ('buyer', 'agreed_weight', 'agreed_total',
                       'meeting_point', 'meeting_time', 'payment_method',
                       'blue_credits_earned'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )

    def sourcer_link(self, obj):
        return format_html(
            '<a href="/admin/accounts/user/{}/change/">{}</a>',
            obj.sourcer_id, obj.sourcer.full_name
        )
    sourcer_link.short_description = 'Seller'

    def buyer_link(self, obj):
        if not obj.buyer:
            return '—'
        return format_html(
            '<a href="/admin/accounts/user/{}/change/">{}</a>',
            obj.buyer_id, obj.buyer.full_name
        )
    buyer_link.short_description = 'Buyer'

    def waste_type_badge(self, obj):
        colors = {
            'plastic': '#3B82F6', 'water_hyacinth': '#10B981',
            'mixed': '#F59E0B', 'metal': '#6B7280', 'other': '#8B5CF6',
        }
        color = colors.get(obj.waste_type, '#888')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:12px;font-size:11px">{}</span>',
            color, obj.get_waste_type_display()
        )
    waste_type_badge.short_description = 'Type'

    def status_badge(self, obj):
        colors = {
            'available': '#0EA5E9', 'verified': '#0FA68E', 'reserved': '#F59E0B',
            'inspecting': '#3B82F6', 'payment_pending': '#8B5CF6',
            'completed': '#22C55E', 'cancelled': '#6B7280',
        }
        color = colors.get(obj.status, '#888')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:12px;font-size:11px">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def total_price_display(self, obj):
        return format_html('<strong>₦{}</strong>', f'{obj.total_price:,.0f}')
    total_price_display.short_description = 'Total'


# ─── Waste Report ─────────────────────────────────────────────────────────────

@admin.register(WasteReport)
class WasteReportAdmin(admin.ModelAdmin):
    list_display    = ('id', 'reporter_name', 'waste_type', 'location_area',
                       'coordinates', 'resolved_badge', 'created_at')
    list_filter     = ('resolved', 'waste_type', 'created_at')
    list_editable   = ()  # use the action or inline edit via change view
    search_fields   = ('reporter__full_name', 'reporter__email', 'location_area', 'description')
    ordering        = ('-created_at',)
    date_hierarchy  = 'created_at'
    list_per_page   = 25
    actions         = [mark_resolved, clear_all_reports]

    def reporter_name(self, obj):
        return obj.reporter.full_name
    reporter_name.short_description = 'Reporter'

    def coordinates(self, obj):
        return format_html(
            '<span style="font-family:monospace;font-size:11px">{:.4f}, {:.4f}</span>',
            obj.lat, obj.lng
        )
    coordinates.short_description = 'GPS'

    def resolved_badge(self, obj):
        if obj.resolved:
            return format_html(
                '<span style="background:#22C55E;color:white;padding:2px 8px;border-radius:12px;font-size:11px">Resolved</span>'
            )
        return format_html(
            '<span style="background:#EF4444;color:white;padding:2px 8px;border-radius:12px;font-size:11px">Open</span>'
        )
    resolved_badge.short_description = 'Status'


# ─── Notification ─────────────────────────────────────────────────────────────

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display    = ('id', 'title', 'role_badge', 'type_badge',
                       'recipient_name', 'read_badge', 'created_at')
    list_filter     = ('for_role', 'notif_type', 'read', 'created_at')
    search_fields   = ('title', 'body', 'recipient__full_name')
    ordering        = ('-created_at',)
    date_hierarchy  = 'created_at'
    list_per_page   = 50
    actions         = [mark_notifs_read, clear_all_notifications]

    def recipient_name(self, obj):
        return obj.recipient.full_name if obj.recipient else f'All {obj.for_role}s'
    recipient_name.short_description = 'Recipient'

    def role_badge(self, obj):
        colors = {'seller': '#0FA68E', 'buyer': '#3B82F6', 'weigher': '#F59E0B', 'all': '#8B5CF6'}
        color = colors.get(obj.for_role, '#888')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:12px;font-size:11px">{}</span>',
            color, obj.for_role
        )
    role_badge.short_description = 'Role'

    def type_badge(self, obj):
        return format_html(
            '<span style="background:#374151;color:#D1FAE5;padding:2px 8px;border-radius:12px;font-size:11px">{}</span>',
            obj.notif_type
        )
    type_badge.short_description = 'Type'

    def read_badge(self, obj):
        if obj.read:
            return format_html(
                '<span style="color:#22C55E;font-weight:bold;font-size:12px">✓ Read</span>'
            )
        return format_html(
            '<span style="color:#F59E0B;font-weight:bold;font-size:12px">● Unread</span>'
        )
    read_badge.short_description = 'Read'


# ─── Trade Event ─────────────────────────────────────────────────────────────

@admin.register(TradeEvent)
class TradeEventAdmin(admin.ModelAdmin):
    list_display   = ('id', 'listing_link', 'event_type', 'actor_name', 'note_short', 'timestamp')
    list_filter    = ('event_type', 'timestamp')
    search_fields  = ('actor__full_name', 'note', 'listing__location_area')
    ordering       = ('-timestamp',)
    list_per_page  = 50

    def listing_link(self, obj):
        return format_html(
            '<a href="/admin/listings/wastelisting/{}/change/">Listing #{}</a>',
            obj.listing_id, obj.listing_id
        )
    listing_link.short_description = 'Listing'

    def actor_name(self, obj):
        return obj.actor.full_name if obj.actor else '—'
    actor_name.short_description = 'Actor'

    def note_short(self, obj):
        return obj.note[:60] + '…' if len(obj.note) > 60 else obj.note
    note_short.short_description = 'Note'
