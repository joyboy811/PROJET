"""
Local development settings override for O-PAGe.
Uses SQLite so O-PAGe can run without Docker/PostgreSQL.
Usage: set DJANGO_SETTINGS_MODULE=config.settings_local
"""
from config.settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME':   BASE_DIR / 'db.sqlite3',
    }
}

ALLOWED_HOSTS = ['*']
