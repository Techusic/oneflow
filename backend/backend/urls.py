# backend/backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # User auth URLs (login, logout, register, session)
    path('api/', include('apps.users.urls')), 
    
    # API endpoints
    path('api/', include('apps.projects.urls')),
    path('api/', include('apps.tasks.urls')),
    path('api/', include('apps.analytics.urls')),
    
    # Add all your other apps here
    path('api/', include('apps.orders.urls')),      # Assumes you create this
    path('api/', include('apps.invoices.urls')),    # Assumes you create this
    path('api/', include('apps.expenses.urls')),    # Assumes you create this
    path('api/', include('apps.timesheets.urls')),  # Assumes you create this
    path('api/', include('apps.products.urls')),    # Assumes you create this
]