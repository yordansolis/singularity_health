#!/bin/bash
# Script para automatizar el despliegue del backend de Singularity Health en AWS Lambda

set -e

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Etapa de despliegue (dev por defecto)
STAGE=${1:-dev}

echo -e "${YELLOW}Iniciando despliegue en etapa: $STAGE${NC}"

# 1. Verificar que Node.js y npm estén instalados
echo -e "${YELLOW}Verificando requisitos...${NC}"
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js no está instalado. Por favor, instálalo e intenta nuevamente.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm no está instalado. Por favor, instálalo e intenta nuevamente.${NC}" >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo -e "${RED}Python 3 no está instalado. Por favor, instálalo e intenta nuevamente.${NC}" >&2; exit 1; }

# 2. Verificar que Serverless esté instalado globalmente, si no, instalarlo
command -v serverless >/dev/null 2>&1 || { 
    echo -e "${YELLOW}Serverless Framework no está instalado. Instalando...${NC}"
    npm install -g serverless
}

# 3. Activar entorno virtual o crearlo si no existe
echo -e "${YELLOW}Configurando entorno virtual...${NC}"
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creando entorno virtual...${NC}"
    python3 -m venv venv
fi

# Activar entorno virtual (depende del sistema operativo)
if [ -e "venv/bin/activate" ]; then
    source venv/bin/activate
elif [ -e "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
else
    echo -e "${RED}No se pudo activar el entorno virtual.${NC}"
    exit 1
fi

# 4. Instalar dependencias de Python
echo -e "${YELLOW}Instalando dependencias de Python...${NC}"
pip install -r requirements.txt

# 5. Instalar dependencias de Node.js
echo -e "${YELLOW}Instalando dependencias de Node.js...${NC}"
npm install

# 6. Desplegar con Serverless
echo -e "${YELLOW}Desplegando aplicación con Serverless Framework...${NC}"
serverless deploy --stage $STAGE --verbose

# 7. Ejecutar migraciones (solo después de un despliegue exitoso)
if [ $? -eq 0 ]; then
    echo -e "${YELLOW}Ejecutando migraciones de la base de datos...${NC}"
    serverless invoke --function migrate --stage $STAGE

    echo -e "${GREEN}¡Despliegue completado con éxito!${NC}"
    echo -e "${GREEN}Puedes acceder a la aplicación a través de la URL proporcionada por API Gateway.${NC}"
    echo -e "${YELLOW}Para ver los logs, ejecuta: serverless logs -f api -t --stage $STAGE${NC}"
else
    echo -e "${RED}Hubo un error durante el despliegue. Por favor, revisa los mensajes de error.${NC}"
fi

# Desactivar entorno virtual
deactivate 