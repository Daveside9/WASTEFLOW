from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# ─── Admin branding ───────────────────────────────────────────────────────────
admin.site.site_header  = '🌊 WasteFlow Admin'
admin.site.site_title   = 'WasteFlow'
admin.site.index_title  = 'Platform Management'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/',     include('accounts.urls')),
    path('api/listings/', include('listings.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
