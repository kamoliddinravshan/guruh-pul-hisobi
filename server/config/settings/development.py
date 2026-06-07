from .base import *  # noqa: F403

DEBUG = True
SPECTACULAR_SETTINGS['SERVE_PERMISSIONS'] = ['rest_framework.permissions.AllowAny']  # noqa: F405
ALLOWED_HOSTS = ['*']
CORS_ALLOW_ALL_ORIGINS = True
AUTH_PASSWORD_VALIDATORS = []

if not env('DATABASE_URL', default=None):  # noqa: F405
    DATABASES = {  # noqa: F405
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',  # noqa: F405
        }
    }
