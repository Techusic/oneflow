from apps.analytics import models as analytics_models

class TimeEntry(analytics_models.TimeEntry):
    class Meta:
        proxy = True
        app_label = "timesheets"
        verbose_name = "Time Entry"
        verbose_name_plural = "Time Entries"
