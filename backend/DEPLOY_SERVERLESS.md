# Implementación de Singularity Health Backend en AWS Lambda con Serverless Framework

Esta guía proporciona instrucciones para implementar el backend de Singularity Health usando Serverless Framework, una herramienta que facilita el despliegue y gestión de aplicaciones serverless.

## Resumen del Despliegue

El backend de Django ha sido desplegado en AWS Lambda utilizando Serverless Framework. La API está disponible en:

```
https://1afs3bt7ti.execute-api.us-east-1.amazonaws.com/
```

Todas las rutas de la API (incluido el endpoint GraphQL) están disponibles a través de esta URL base.

## Arquitectura Implementada

- **AWS Lambda**: Ejecuta el código del backend de Django
- **API Gateway**: Expone la API a través de HTTP
- **IAM Roles**: Permisos necesarios para que Lambda funcione
- **CloudFormation**: Gestiona todos los recursos como infraestructura como código

## Requisitos Previos

1. Node.js v14 o superior
2. Python 3.9 o superior (recomendado Python 3.11)
3. AWS CLI instalado y configurado
4. Conocimientos básicos de AWS

## Configuración Inicial

1. Instala Serverless Framework globalmente:

```bash
npm install -g serverless
```

2. Configura tus credenciales de AWS:

```bash
aws configure
```

3. Crea y activa un entorno virtual de Python:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

4. Instala las dependencias de Python:

```bash
pip install -r requirements.txt
```

5. Instala las dependencias de Node.js para Serverless:

```bash
npm install
```

## Despliegue Automatizado

Para desplegar la aplicación de forma automática, simplemente ejecuta:

```bash
bash deploy.sh
```

Este script realizará automáticamente todas las tareas necesarias para el despliegue incluyendo:

- Instalación de dependencias
- Despliegue con Serverless Framework
- Ejecución de migraciones de base de datos

## Despliegue Manual

Si prefieres realizar el despliegue manualmente, sigue estos pasos:

1. Desplegar en el entorno de desarrollo:

```bash
serverless deploy
```

2. Ejecutar migraciones de base de datos:

```bash
serverless invoke --function migrate
```

3. Para desplegar en producción:

```bash
serverless deploy --stage prod
```

## Verificación y Monitoreo

### Visualización de Logs

Para monitorear los logs de la aplicación:

```bash
serverless logs -f api -t
```

El flag `-t` habilita el modo de seguimiento (tail), que muestra nuevos registros en tiempo real.

### Prueba de la API

Puedes probar la API utilizando herramientas como Postman o cURL:

```bash
curl -X POST \
  https://1afs3bt7ti.execute-api.us-east-1.amazonaws.com/graphql/ \
  -H 'Content-Type: application/json' \
  -d '{"query": "{ users { id username email } }"}'
```

## Personalización Adicional

### Dominio Personalizado

Si deseas configurar un dominio personalizado, añade esto a tu `serverless.yml`:

```yaml
plugins:
  - serverless-domain-manager

custom:
  customDomain:
    domainName: api.tudominio.com
    certificateName: "*.tudominio.com"
    basePath: ""
    stage: ${self:provider.stage}
    createRoute53Record: true
```

Y ejecuta:

```bash
npm install --save-dev serverless-domain-manager
serverless create_domain
serverless deploy
```

### Archivos Estáticos

Si necesitas servir archivos estáticos, considera estas opciones:

1. **Servir desde S3**: Implementa un bucket S3 configurado para servir archivos estáticos

2. **Usar un CDN**: Configura CloudFront o Cloudflare para servir los archivos estáticos

## Eliminación del Despliegue

Si necesitas eliminar el despliegue:

```bash
serverless remove
```

## Resolución de Problemas

1. **Errores de timeout**: Aumenta el valor de `timeout` en `serverless.yml`
2. **Problemas de memoria**: Aumenta el valor de `memorySize` en `serverless.yml`
3. **Errores de conexión a la base de datos**: Verifica la configuración de seguridad para permitir el acceso desde Lambda

## Recursos Adicionales

- [Documentación de Serverless Framework](https://www.serverless.com/framework/docs/)
- [Documentación de AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [Documentación de API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)
