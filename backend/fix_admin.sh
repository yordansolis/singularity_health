#!/bin/bash

# Script para solucionar problemas con el panel de administración de Django

echo "Solucionando problemas con el panel de administración..."

# Activar el entorno virtual
source venv/bin/activate

# Verificar que Django Admin está en INSTALLED_APPS
echo "Verificando configuración de Django..."
python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'singularity_health.settings'); import django; django.setup(); from django.conf import settings; print('django.contrib.admin' in settings.INSTALLED_APPS)"

# Recolectar archivos estáticos con --clear para forzar la recolección completa
echo "Recolectando archivos estáticos..."
python manage.py collectstatic --noinput --clear

# Verificar que los archivos de admin existen
echo "Verificando archivos de admin..."
ls -la staticfiles/admin/

# Asegurarse de que los permisos son correctos
echo "Configurando permisos..."
chmod -R 755 staticfiles

# Verificar la configuración de Nginx
echo "Verificando configuración de Nginx..."
cat nginx_config

# Reiniciar servicios
echo "Reiniciando servicios..."
sudo systemctl restart gunicorn
sudo systemctl restart nginx

echo "Verificando estado de servicios..."
sudo systemctl status gunicorn
sudo systemctl status nginx

echo "Si el panel de administración sigue sin estilo, verifica los logs:"
echo "sudo tail -f /var/log/nginx/error.log"
echo ""
echo "También puedes verificar las solicitudes de red en el navegador usando las herramientas de desarrollador"
echo "para ver qué archivos CSS/JS están fallando al cargar." 