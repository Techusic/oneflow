import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Minimal secrets for local/dev. Set SECRET_KEY in env for production.
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")

DEBUG = os.environ.get("DEBUG", "1") != "0"

ALLOWED_HOSTS = []

# Core apps + your app packages (dotted paths)
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "apps.analytics",
    "apps.expenses",
    "apps.invoices",
    "apps.orders",
    "apps.products",
    "apps.projects",
    "apps.tasks",
    "apps.timesheets",
    "apps.users",
    # Do not add "corsheaders" unconditionally here; it's handled below.
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    # corsheaders middleware inserted below only if package is installed
]

ROOT_URLCONF = "urls"  # Point to urls.py in the same directory as settings.py

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"  # optional; keep or update to your wsgi module

# Simple local sqlite DB
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": str(BASE_DIR / "db.sqlite3"),
    }
}

# Password validators (kept minimal for dev)
AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = str(BASE_DIR / "staticfiles")

MEDIA_URL = "/media/"
MEDIA_ROOT = str(BASE_DIR / "media")

# Only enable django-cors-headers if installed to avoid import errors.
try:
    import importlib

    importlib.import_module("corsheaders")
except Exception:
    _CORS_AVAILABLE = False
else:
    _CORS_AVAILABLE = True

if _CORS_AVAILABLE and "corsheaders" not in INSTALLED_APPS:
    INSTALLED_APPS.insert(0, "corsheaders")

if _CORS_AVAILABLE:
    cors_mw = "corsheaders.middleware.CorsMiddleware"
    if cors_mw not in MIDDLEWARE:
        MIDDLEWARE.insert(0, cors_mw)

# Development-safe CORS policy (no-op if package missing)
CORS_ALLOW_ALL_ORIGINS = True

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# CORS Configuration
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# CSRF Configuration for API
CSRF_TRUSTED_ORIGINS = ['http://localhost:8080', 'http://127.0.0.1:8080']
CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript to read CSRF token
CSRF_COOKIE_SAMESITE = 'Lax'

# Keep file-based email backend for dev
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Use BigAutoField as the default primary key
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# End of settings.py