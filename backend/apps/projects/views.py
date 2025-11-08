# backend/apps/projects/views.py
from rest_framework import viewsets
from .models import Project
from .serializers import ProjectSerializer
from rest_framework.permissions import IsAuthenticated

class ProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows projects to be viewed or edited.
    """
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated] # Ensures only logged-in users can access

    def get_queryset(self):
        """
        Only show projects that the user is a part of (manager or team member).
        """
        user = self.request.user
        return Project.objects.filter(
            models.Q(manager=user) | models.Q(team=user)
        ).distinct()

    def perform_create(self, serializer):
        """
        Set the manager to the current user if not specified.
        """
        if 'manager' not in serializer.validated_data:
            serializer.save(manager=self.request.user)
        else:
            serializer.save()