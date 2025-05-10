#!/bin/bash

# Script para solucionar problemas con archivos estáticos

echo "Solucionando problemas con archivos estáticos..."

# Asegurarse de que el directorio de archivos estáticos existe
mkdir -p staticfiles

# Activar el entorno virtual
source venv/bin/activate

# Recolectar archivos estáticos
echo "Recolectando archivos estáticos..."
python manage.py collectstatic --noinput --clear

# Asegurarse de que los permisos son correctos
echo "Configurando permisos..."
chmod -R 755 staticfiles

# Reiniciar servicios
echo "Reiniciando servicios..."
sudo systemctl restart gunicorn
sudo systemctl restart nginx

echo "Verificando estado de servicios..."
sudo systemctl status gunicorn
sudo systemctl status nginx

echo "Si los archivos estáticos siguen sin funcionar, verifica los logs:"
echo "sudo tail -f /var/log/nginx/error.log" 