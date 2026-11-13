from django.urls import path
from .views import (
    ListingListCreateView, ListingDetailView, ListingActionView,
    WasteReportListCreateView, NotificationListView, mark_notifications_read,
)

urlpatterns = [
    path('',                          ListingListCreateView.as_view(),  name='listing-list'),
    path('<int:pk>/',                 ListingDetailView.as_view(),       name='listing-detail'),
    path('<int:pk>/<str:action>/',    ListingActionView.as_view(),       name='listing-action'),
    path('reports/',                  WasteReportListCreateView.as_view(), name='report-list'),
    path('notifications/',            NotificationListView.as_view(),    name='notif-list'),
    path('notifications/read/',       mark_notifications_read,           name='notif-read'),
]
