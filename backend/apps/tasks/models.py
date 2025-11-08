from django.db import models
from apps.projects.models import Project
from django.conf import settings
import uuid
from apps.analytics import models as analytics_models

class Task(analytics_models.Task):
    class Meta:
        proxy = True
        app_label = "tasks"
        verbose_name = "Task"
        verbose_name_plural = "Tasks"