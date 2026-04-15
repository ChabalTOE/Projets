
from pathlib import Path
import os
import dj_database_url

BASE_DIR=Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',') if os.environ.get('ALLOWED_HOSTS') else ['*']

INSTALLED_APPS=[
'django.contrib.admin','django.contrib.auth','django.contrib.contenttypes',
'django.contrib.sessions','django.contrib.messages','django.contrib.staticfiles',
'rest_framework','corsheaders','finance'
]

MIDDLEWARE=[
'corsheaders.middleware.CorsMiddleware',
'django.middleware.security.SecurityMiddleware',
'django.contrib.sessions.middleware.SessionMiddleware',
'django.middleware.common.CommonMiddleware',
'django.middleware.csrf.CsrfViewMiddleware',
'django.contrib.auth.middleware.AuthenticationMiddleware',
'django.contrib.messages.middleware.MessageMiddleware'
]

ROOT_URLCONF='config.urls'

TEMPLATES=[
    {
        'BACKEND':'django.template.backends.django.DjangoTemplates',
        'DIRS':[],
        'APP_DIRS':True,
        'OPTIONS':{
            'context_processors':[
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

DATABASES = {
    'default': dj_database_url.config(default=f'sqlite:///{BASE_DIR}/db.sqlite3')
}

REST_FRAMEWORK={'DEFAULT_AUTHENTICATION_CLASSES':(
'rest_framework_simplejwt.authentication.JWTAuthentication',
)}

CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
CORS_ALLOW_CREDENTIALS = True

STATIC_URL='/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
DEFAULT_AUTO_FIELD='django.db.models.BigAutoField'
