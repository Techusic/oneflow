# apps/users/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('api/users/csrf-token/', views.CSRFTokenView.as_view(), name='api_csrf_token'),
    path('api/users/login/', views.SessionLoginView.as_view(), name='api_login'),
    path('api/users/signup/', views.SessionSignupView.as_view(), name='api_signup'),
    path('api/users/logout/', views.SessionLogoutView.as_view(), name='api_logout'),
    path('api/users/me/', views.CurrentUserView.as_view(), name='api_user'),
    path('api/users/change-password/', views.ChangePasswordView.as_view(), name='api_change_password'),
]