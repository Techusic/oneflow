# apps/users/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('api/auth/login/', views.SessionLoginView.as_view(), name='api_login'),
    path('api/auth/logout/', views.SessionLogoutView.as_view(), name='api_logout'),
    path('api/auth/user/', views.CurrentUserView.as_view(), name='api_user'),
]