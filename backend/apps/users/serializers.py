# apps/users/serializers.py

from rest_framework import serializers
from .models import User, Role

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['name']

class UserSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
    name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'name', 'roles', 'role']

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email.split('@')[0]
    
    def get_role(self, obj):
        # Return the first role name, or default to 'team_member'
        roles = obj.roles.all()
        if roles.exists():
            return roles.first().name
        return 'team_member'