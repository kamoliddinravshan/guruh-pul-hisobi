import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

env_file = BASE_DIR / ".env"
if env_file.exists():
    for line in env_file.read_text().splitlines():
        if not line or line.strip().startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def env(name, default=""):
    return os.environ.get(name, default)


def env_list(name, default=""):
    raw = env(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


SECRET_KEY = env("SECRET_KEY", "change_this_secret")
DEBUG = env("DEBUG", "False").lower() == "true"
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1")
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080")
GOOGLE_CLIENT_ID = env("GOOGLE_CLIENT_ID")

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "api",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "api.middleware.SimpleCorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("POSTGRES_DB", "guruh_pul_hisobi"),
        "USER": env("POSTGRES_USER", "postgres"),
        "PASSWORD": env("POSTGRES_PASSWORD", "postgres"),
        "HOST": env("POSTGRES_HOST", "127.0.0.1"),
        "PORT": env("POSTGRES_PORT", "5432"),
    }
}

AUTH_PASSWORD_VALIDATORS = []
USE_TZ = True
TIME_ZONE = "Asia/Tashkent"
LANGUAGE_CODE = "uz"
