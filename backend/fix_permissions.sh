#!/bin/bash

# Script para solucionar problemas de permisos en el despliegue de Gunicorn

echo "Solucionando problemas de permisos para Gunicorn..."

# Detener el servicio de Gunicorn
sudo systemctl stop gunicorn

# Reiniciar el servicio con la nueva configuración
sudo systemctl daemon-reload
sudo systemctl start gunicorn
sudo systemctl status gunicorn

echo "Verificando estado de Nginx..."
sudo systemctl status nginx

echo "Si el servicio sigue fallando, ejecuta los siguientes comandos:"
echo "sudo journalctl -u gunicorn"
echo "sudo tail -f /var/log/nginx/error.log" 