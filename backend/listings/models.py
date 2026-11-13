from django.db import models
from django.conf import settings


WASTE_TYPES = [
    ('plastic',        'Plastic'),
    ('water_hyacinth', 'Water Hyacinth'),
    ('mixed',          'Mixed Waste'),
    ('metal',          'Metal'),
    ('other',          'Other'),
]

LISTING_STATUSES = [
    ('available',       'Available'),
    ('verified',        'Verified'),
    ('reserved',        'Reserved'),
    ('inspecting',      'Inspecting'),
    ('payment_pending', 'Payment Pending'),
    ('completed',       'Completed'),
    ('cancelled',       'Cancelled'),
]


class WasteListing(models.Model):
    sourcer          = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                         related_name='listings')
    waste_type       = models.CharField(max_length=20, choices=WASTE_TYPES)
    estimated_weight = models.FloatField()
    verified_weight  = models.FloatField(null=True, blank=True)
    agreed_weight    = models.FloatField(null=True, blank=True)
    price_per_kg     = models.DecimalField(max_digits=10, decimal_places=2)
    total_price      = models.DecimalField(max_digits=12, decimal_places=2, editable=False)
    verified_total   = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    agreed_total     = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    description      = models.TextField(blank=True)
    location_area    = models.CharField(max_length=200)
    lat              = models.FloatField(null=True, blank=True)
    lng              = models.FloatField(null=True, blank=True)
    status           = models.CharField(max_length=20, choices=LISTING_STATUSES, default='available')
    created_at       = models.DateTimeField(auto_now_add=True)

    # Weigher
    weigher           = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                           null=True, blank=True, related_name='verified_listings')
    verified_condition = models.CharField(max_length=20, blank=True)
    weigher_notes      = models.TextField(blank=True)
    verified_at        = models.DateTimeField(null=True, blank=True)

    # Buyer
    buyer        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                      null=True, blank=True, related_name='purchases')
    meeting_point = models.CharField(max_length=200, blank=True)
    meeting_time  = models.DateTimeField(null=True, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)

    # Credits
    blue_credits_earned = models.IntegerField(null=True, blank=True)

    def save(self, *args, **kwargs):
        self.total_price = float(self.estimated_weight) * float(self.price_per_kg)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.waste_type} — {self.estimated_weight}kg [{self.status}]'


class TradeEvent(models.Model):
    EVENT_TYPES = [
        ('listing_created',    'Listing Created'),
        ('interest_expressed', 'Interest Expressed'),
        ('meeting_scheduled',  'Meeting Scheduled'),
        ('inspection_confirmed','Inspection Confirmed'),
        ('weight_verified',    'Weight Verified'),
        ('weight_agreed',      'Weight Agreed'),
        ('payment_escrowed',   'Payment Escrowed'),
        ('payment_received',   'Payment Received'),
        ('completed',          'Completed'),
        ('cancelled',          'Cancelled'),
    ]

    listing    = models.ForeignKey(WasteListing, on_delete=models.CASCADE, related_name='timeline')
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    actor      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                    null=True, related_name='trade_events')
    note       = models.TextField(blank=True)
    timestamp  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f'{self.event_type} @ {self.timestamp:%Y-%m-%d %H:%M}'


class WasteReport(models.Model):
    reporter     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                      related_name='waste_reports')
    lat          = models.FloatField()
    lng          = models.FloatField()
    waste_type   = models.CharField(max_length=20, choices=WASTE_TYPES)
    description  = models.TextField(blank=True)
    location_area = models.CharField(max_length=200)
    resolved     = models.BooleanField(default=False)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Report by {self.reporter} — {self.waste_type} at {self.location_area}'


class Notification(models.Model):
    FOR_ROLE_CHOICES = [
        ('seller',  'Seller'),
        ('buyer',   'Buyer'),
        ('weigher', 'Weigher'),
        ('all',     'All'),
    ]
    TYPE_CHOICES = [
        ('new_listing', 'New Listing'),
        ('interest',    'Interest'),
        ('meeting',     'Meeting'),
        ('payment',     'Payment'),
        ('completed',   'Completed'),
        ('verified',    'Verified'),
        ('system',      'System'),
    ]

    recipient  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                    related_name='notifications', null=True, blank=True)
    for_role   = models.CharField(max_length=10, choices=FOR_ROLE_CHOICES, default='all')
    notif_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title      = models.CharField(max_length=200)
    body       = models.TextField()
    listing    = models.ForeignKey(WasteListing, on_delete=models.SET_NULL,
                                    null=True, blank=True, related_name='notifications')
    read       = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.for_role}] {self.title}'
