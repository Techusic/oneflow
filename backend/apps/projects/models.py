from django.db import models
from django.conf import settings
import uuid
from django.utils import timezone
from apps.analytics import models as analytics_models

class Project(analytics_models.Project):
	class Meta:
		proxy = True
		app_label = "projects"
		verbose_name = "Project"
		verbose_name_plural = "Projects"