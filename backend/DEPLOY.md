# Despliegue de Singularity Health en Google Cloud

Este documento contiene instrucciones para desplegar la aplicación Singularity Health en una VM de Google Cloud.

## Requisitos previos

- Una instancia de VM de Google Cloud con Debian/Ubuntu
- Acceso SSH a la VM
- Repositorio del proyecto clonado en la VM

## Pasos para el despliegue

### 1. Clonar el repositorio (si aún no lo has hecho)

```bash
git clone <URL_DEL_REPOSITORIO>
cd singularity_health
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en el directorio `backend/` con el siguiente contenido:

```
SECRET_KEY=tu_clave_secreta_aqui
DEBUG=False
ALLOWED_HOSTS=tu_ip_o_dominio
DATABASE_URL=sqlite:///db.sqlite3
```

Reemplaza `tu_clave_secreta_aqui` con una clave secreta segura y `tu_ip_o_dominio` con la IP o dominio de tu VM.

### 3. Configurar Nginx

Edita el archivo `backend/nginx_config` y reemplaza `server_name _;` con `server_name tu_ip_o_dominio;`.

### 4. Ejecutar el script de despliegue

```bash
cd backend
./deploy.sh
```

El script realizará las siguientes acciones:

- Actualizar el sistema
- Instalar dependencias
- Configurar un entorno virtual
- Instalar dependencias de Python
- Recopilar archivos estáticos
- Aplicar migraciones
- Configurar Nginx
- Configurar y iniciar Gunicorn como servicio

### 5. Verificar el despliegue

Después de ejecutar el script, puedes verificar el estado del servicio con:

```bash
sudo systemctl status gunicorn
```

Y acceder a la aplicación en tu navegador usando la IP o dominio de tu VM.

## Solución de problemas

Si encuentras algún problema durante el despliegue, puedes revisar los logs con:

```bash
# Logs de Gunicorn
sudo journalctl -u gunicorn

# Logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

## Actualización de la aplicación

Para actualizar la aplicación después de cambios en el código:

```bash
cd singularity_health
git pull
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
sudo systemctl restart gunicorn
```
