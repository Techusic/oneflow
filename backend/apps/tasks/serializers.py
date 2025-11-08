from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=serializers.get_user_model().objects.all(), 
        source='assignee', 
        write_only=True, 
        allow_null=True,
        required=False
    )
    project_id = serializers.PrimaryKeyRelatedField(
        queryset=serializers.get_user_model().Project.objects.all(), 
        source='project', 
        write_only=True
    )

    class Meta:
        model = Task
        fields = [
            'id', 'name', 'description', 'status', 'priority', 'project', 
            'assignee', 'due_date', 'created_at', 'updated_at',
            'assignee_id', 'project_id'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'project', 'assignee']
        depth = 1 # Show nested project/assignee data on read