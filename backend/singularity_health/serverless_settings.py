"""
Serverless-specific settings for singularity_health project.
This file extends the base settings and modifies them for AWS Lambda deployment.
"""
import os
from .settings import *

# Override base settings for Lambda environment

# Debug should be False in production
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Allow API Gateway URLs
ALLOWED_HOSTS = ['*']

# Configure CORS for API Gateway
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    # Add your frontend URLs here
    "https://singularity-health.example.com",
    # Include frontend URLs
    "http://localhost:3000",
    "http://localhost:5173",
    "https://singularity-health.pages.dev",  # Cloudflare Pages
]

# Static files configuration for Lambda (temporalmente servimos archivos estáticos localmente)
STATIC_URL = '/static/'
STATIC_ROOT = '/tmp/staticfiles'

# Configuración para URL y redirecciones en API Gateway
# Estos ajustes son importantes para que las redirecciones funcionen correctamente 
# con Lambda y API Gateway
USE_X_FORWARDED_HOST = True
FORCE_SCRIPT_NAME = os.environ.get('SCRIPT_NAME', '')
CSRF_TRUSTED_ORIGINS = [
    os.environ.get('BASE_URL', 'https://1afs3bt7ti.execute-api.us-east-1.amazonaws.com'),
]
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = False  # API Gateway handles this

# CORS middleware debe estar antes que CommonMiddleware para manejar los preflight OPTIONS
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
] + [m for m in MIDDLEWARE if m != 'corsheaders.middleware.CorsMiddleware']

# Database configuration adjustments if needed
DATABASES['default']['CONN_MAX_AGE'] = 0  # Recommended for Lambda

# Configuración para admin
ADMIN_SITE_HEADER = "Singularity Health Admin"
ADMIN_SITE_TITLE = "Panel de Administración"
ADMIN_INDEX_TITLE = "Administración del Sistema"

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
    },
} 