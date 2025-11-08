from django.contrib import admin
from django.apps import apps

# Register all models in the 'expenses' app automatically, but only when the app is installed.
# This avoids LookupError at import time when INSTALLED_APPS doesn't include the app.
try:
    if apps.is_installed("apps.expenses") or apps.is_installed("expenses"):
        app_config = apps.get_app_config("expenses")
    else:
        app_config = None
except LookupError:
    app_config = None

if app_config:
    for model in app_config.get_models():
        try:
            admin.site.register(model)
        except admin.sites.AlreadyRegistered:
            # model already registered elsewhere — skip
            pass
