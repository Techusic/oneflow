from django.db import models
from apps.projects.models import Project
from django.conf import settings
import uuid
from apps.analytics import models as analytics_models

class Expense(analytics_models.Expense):
    class Meta:
        proxy = True
        app_label = "expenses"
        verbose_name = "Expense"
        verbose_name_plural = "Expenses"