from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User


# ─── Actions ─────────────────────────────────────────────────────────────────

@admin.action(description='✅ Approve selected users')
def approve_users(modeladmin, request, queryset):
    queryset.update(approved=True)

@admin.action(description='🚫 Suspend selected users')
def suspend_users(modeladmin, request, queryset):
    queryset.update(is_active=False)

@admin.action(description='🧹 Delete ALL non-admin users + their data')
def clear_all_users(modeladmin, request, queryset):
    User.objects.filter(is_staff=False, is_superuser=False).delete()


# ─── User admin ───────────────────────────────────────────────────────────────

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display    = ('email', 'full_name', 'role_badge', 'region',
                       'approved_badge', 'is_active', 'created_at')
    list_filter     = ('role', 'approved', 'is_active', 'is_staff', 'region')
    search_fields   = ('email', 'full_name', 'region', 'company_name')
    ordering        = ('-created_at',)
    list_per_page   = 25
    date_hierarchy  = 'created_at'
    actions         = [approve_users, suspend_users, clear_all_users]

    fieldsets = (
        (None,          {'fields': ('email', 'password')}),
        ('Profile',     {'fields': ('full_name', 'role', 'region', 'approved', 'is_active')}),
        ('Buyer Info',  {
            'fields': ('is_company', 'company_name', 'registration_number', 'processing_capacity'),
            'classes': ('collapse',),
        }),
        ('Permissions', {
            'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',),
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('email', 'full_name', 'role', 'region',
                        'password1', 'password2', 'approved'),
        }),
    )

    def role_badge(self, obj):
        colors = {
            'seller':  '#0FA68E',
            'buyer':   '#3B82F6',
            'weigher': '#F59E0B',
            'admin':   '#8B5CF6',
        }
        color = colors.get(obj.role, '#888')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;'
            'border-radius:12px;font-size:11px">{}</span>',
            color, obj.role.capitalize()
        )
    role_badge.short_description = 'Role'

    def approved_badge(self, obj):
        if obj.approved:
            return format_html(
                '<span style="background:#22C55E;color:white;padding:2px 8px;'
                'border-radius:12px;font-size:11px">Approved</span>'
            )
        return format_html(
            '<span style="background:#EF4444;color:white;padding:2px 8px;'
            'border-radius:12px;font-size:11px">Pending</span>'
        )
    approved_badge.short_description = 'Approved'
