#!/bin/bash

# Script de despliegue para Singularity Health en Google Cloud

echo "Iniciando despliegue de Singularity Health..."

# Actualizar el sistema
echo "Actualizando el sistema..."
sudo apt-get update
sudo apt-get upgrade -y

# Instalar dependencias
echo "Instalando dependencias..."
sudo apt-get install -y python3-pip python3-dev libpq-dev nginx

# Configurar entorno virtual
echo "Configurando entorno virtual..."
pip3 install virtualenv
virtualenv venv
source venv/bin/activate

# Instalar dependencias de Python
echo "Instalando dependencias de Python..."
pip install -r requirements.txt

# Recopilar archivos estáticos
echo "Recopilando archivos estáticos..."
python manage.py collectstatic --noinput

# Aplicar migraciones
echo "Aplicando migraciones..."
python manage.py migrate

# Configurar Nginx
echo "Configurando Nginx..."
sudo cp nginx_config /etc/nginx/sites-available/singularity_health
sudo ln -sf /etc/nginx/sites-available/singularity_health /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Configurar servicio de systemd para Gunicorn
echo "Configurando servicio de systemd para Gunicorn..."
cat > /tmp/gunicorn.service << EOF
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
User=yordansolis2
Group=www-data
WorkingDirectory=/home/yordansolis2/singularity_health/backend
ExecStart=/home/yordansolis2/singularity_health/backend/venv/bin/gunicorn --config gunicorn_config.py singularity_health.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

sudo mv /tmp/gunicorn.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start gunicorn
sudo systemctl enable gunicorn

echo "¡Despliegue completado!"
echo "Verifica el estado del servicio con: sudo systemctl status gunicorn" 