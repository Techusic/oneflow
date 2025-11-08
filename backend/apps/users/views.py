# apps/users/views.py

from django.contrib.auth import login, logout, authenticate
from rest_framework import views, response, status
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer # We'll create this serializer

class SessionLoginView(views.APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, email=email, password=password)
        if user:
            login(request, user)
            return response.Response(UserSerializer(user).data)
        return response.Response(
            {"detail": "Invalid credentials"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

class SessionLogoutView(views.APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        logout(request)
        return response.Response(status=status.HTTP_204_NO_CONTENT)

class CurrentUserView(views.APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        return response.Response(UserSerializer(request.user).data)