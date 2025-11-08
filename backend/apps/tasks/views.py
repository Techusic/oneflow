from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer
from rest_framework.permissions import IsAuthenticated

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Only show tasks for projects the user is a part of.
        """
        user = self.request.user
        return Task.objects.filter(project__team=user).order_by('due_date')

    def perform_create(self, serializer):
        # You could add logic here to ensure user can only add tasks to their own projects
        serializer.save()