#!/bin/bash

# Script para solucionar todos los problemas de despliegue

echo "Aplicando todas las soluciones..."

# Asegurarse de que el directorio de archivos estáticos existe
mkdir -p staticfiles
mkdir -p static

# Activar el entorno virtual
source venv/bin/activate

# Crear un archivo CSS vacío para verificar que la recolección de estáticos funciona
echo "/* Test CSS file */" > static/test.css

# Recolectar archivos estáticos
echo "Recolectando archivos estáticos..."
python manage.py collectstatic --noinput --clear

# Verificar que los archivos de admin existen
echo "Verificando archivos de admin..."
ls -la staticfiles/admin/ || echo "¡ADVERTENCIA! No se encontraron archivos de admin"

# Asegurarse de que los permisos son correctos
echo "Configurando permisos..."
chmod -R 755 staticfiles
chmod -R 755 static

# Verificar configuración de Nginx
echo "Verificando configuración de Nginx..."
sudo nginx -t

# Reiniciar servicios
echo "Reiniciando servicios..."
sudo systemctl restart gunicorn
sudo systemctl restart nginx

echo "Verificando estado de servicios..."
sudo systemctl status gunicorn
sudo systemctl status nginx

echo "Si los problemas persisten, verifica los logs:"
echo "sudo journalctl -u gunicorn"
echo "sudo tail -f /var/log/nginx/error.log"
echo ""
echo "También puedes verificar que los archivos estáticos existen con:"
echo "ls -la staticfiles/"
echo ""
echo "Para verificar problemas en el navegador:"
echo "1. Abre las herramientas de desarrollador (F12)"
echo "2. Ve a la pestaña Network/Red"
echo "3. Recarga la página y busca errores 404 en archivos CSS/JS" 