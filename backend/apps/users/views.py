# apps/users/views.py

import secrets
from django.contrib.auth import login, logout, authenticate
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import views, response, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, Role
from .serializers import UserSerializer

class CSRFTokenView(views.APIView):
    permission_classes = [AllowAny]
    
    @method_decorator(ensure_csrf_cookie)
    def get(self, request, *args, **kwargs):
        token = get_token(request)
        return response.Response({'csrftoken': token})

class SessionLoginView(views.APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # No authentication required for login
    
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return response.Response(
                {"detail": "Email and password are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(request, email=email, password=password)
        if user:
            login(request, user)
            # Generate a simple token for frontend (in production, use JWT)
            token = secrets.token_urlsafe(32)
            # Store token in session for now (in production, use proper token storage)
            request.session['auth_token'] = token
            
            user_data = UserSerializer(user).data
            return response.Response({
                'user': {
                    'id': str(user_data['id']),
                    'email': user_data['email'],
                    'name': user_data['name'],
                    'role': user_data['role']
                },
                'token': token
            })
        return response.Response(
            {"detail": "Invalid credentials"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

class SessionSignupView(views.APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # No authentication required for signup
    
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        name = request.data.get('name', '')
        role_name = request.data.get('role', 'team_member')
        
        if not email or not password:
            return response.Response(
                {"detail": "Email and password are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return response.Response(
                {"detail": "User with this email already exists"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Parse name into first_name and last_name
        name_parts = name.split(' ', 1) if name else []
        first_name = name_parts[0] if name_parts else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Create user
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Assign role
        role, created = Role.objects.get_or_create(name=role_name)
        user.roles.add(role)
        
        # Login the user
        login(request, user)
        
        # Generate token
        token = secrets.token_urlsafe(32)
        request.session['auth_token'] = token
        
        user_data = UserSerializer(user).data
        return response.Response({
            'user': {
                'id': str(user_data['id']),
                'email': user_data['email'],
                'name': user_data['name'],
                'role': user_data['role']
            },
            'token': token
        }, status=status.HTTP_201_CREATED)

class SessionLogoutView(views.APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        logout(request)
        return response.Response(status=status.HTTP_204_NO_CONTENT)

class CurrentUserView(views.APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        user_data = UserSerializer(request.user).data
        return response.Response({
            'id': str(user_data['id']),
            'email': user_data['email'],
            'name': user_data['name'],
            'role': user_data['role']
        })

class ChangePasswordView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return response.Response(
                {"detail": "Current password and new password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify current password
        user = authenticate(request, email=request.user.email, password=current_password)
        if not user:
            return response.Response(
                {"detail": "Current password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate new password length
        if len(new_password) < 8:
            return response.Response(
                {"detail": "New password must be at least 8 characters long"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        request.user.set_password(new_password)
        request.user.save()
        
        return response.Response({
            "detail": "Password updated successfully"
        }, status=status.HTTP_200_OK)