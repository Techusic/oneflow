# backend/apps/projects/serializers.py
from rest_framework import serializers
from .models import Project
from apps.users.serializers import UserSerializer  # We'll use this for nested data

class ProjectSerializer(serializers.ModelSerializer):
    # Make manager and team read-only with nested user data
    manager = UserSerializer(read_only=True)
    team = UserSerializer(many=True, read_only=True)
    
    # Allow setting manager/team by their ID during create/update
    manager_id = serializers.PrimaryKeyRelatedField(
        queryset=serializers.get_user_model().objects.all(), 
        source='manager', 
        write_only=True, 
        allow_null=True,
        required=False
    )
    team_ids = serializers.PrimaryKeyRelatedField(
        queryset=serializers.get_user_model().objects.all(), 
        source='team', 
        write_only=True, 
        many=True,
        required=False
    )

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'start_date', 'end_date', 'status', 
            'manager', 'team', 'created_at', 'updated_at',
            'manager_id', 'team_ids'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'manager', 'team']

    def create(self, validated_data):
        # DRF handles manager_id and team_ids automatically
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # DRF handles manager_id and team_ids automatically
        return super().update(instance, validated_data)