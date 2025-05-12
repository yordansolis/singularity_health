"""
Lambda-specific settings for singularity_health project.
This file extends the base settings and modifies them for AWS Lambda deployment.
"""
import os
from .settings import *

# Override base settings for Lambda environment

# Debug should be False in production
DEBUG = False

# Allow API Gateway URLs
ALLOWED_HOSTS = ['*']

# Configure CORS for API Gateway
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    # Add your frontend URLs here
    "https://singularity-health.example.com",
]

# Static files configuration for Lambda
STATIC_URL = '/static/'
STATIC_ROOT = '/tmp/staticfiles'

# Media files (if applicable)
MEDIA_URL = '/media/'
MEDIA_ROOT = '/tmp/mediafiles'

# Security settings for production
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# AWS S3 for static files (optional, if you want to use S3 for static files)
# Uncomment and configure if needed
# AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
# AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
# AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
# AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
# AWS_S3_OBJECT_PARAMETERS = {
#     'CacheControl': 'max-age=86400',
# }
# AWS_LOCATION = 'static'
# STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{AWS_LOCATION}/'
# STATICFILES_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage' 