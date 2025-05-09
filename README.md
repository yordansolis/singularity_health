# Singularity Health - Prueba Técnica Backend

API para registro de usuarios con validación de datos desarrollada con FastAPI.

## Características

- Registro de usuarios con validación de datos
- Prevención de duplicados (email, username, documento)
- Almacenamiento seguro de contraseñas
- API RESTful con documentación automática
- Validación de formatos de datos

## Requisitos

- Python 3.8+
- Dependencias en `requirements.txt`

## Instalación

1. Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd singularity-health-backend
```

2. Crear y activar un entorno virtual:

```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. Instalar dependencias:

```bash
pip install -r requirements.txt
```

4. Ejecutar la aplicación:

```bash
python -m app.main
```

5. Acceder a la documentación de la API:

```
http://localhost:8000/docs
```

## Estructura del Proyecto

```
singularity_health/
├── app/
│   ├── __init__.py
│   ├── main.py            # Punto de entrada de la aplicación
│   ├── models/            # Modelos de datos SQLAlchemy
│   ├── schemas/           # Esquemas Pydantic para validación
│   ├── database/          # Configuración de la base de datos
│   ├── crud/              # Operaciones CRUD
│   └── api/               # Endpoints de la API
├── requirements.txt       # Dependencias del proyecto
└── README.md              # Este archivo
```

## Uso de la API

### Registrar un nuevo usuario

```
POST /api/v1/users/
```

Ejemplo de solicitud:

```json
{
  "username": "usuario1",
  "email": "usuario1@example.com",
  "password": "Password1!",
  "identity_document": {
    "document_type": "DNI",
    "document_number": "12345678"
  },
  "contact_info": {
    "phone_number": "+51987654321",
    "address": "Av. Principal 123",
    "city": "Lima",
    "country": "Perú"
  }
}
```

## Mejoras Futuras

- Implementación de autenticación JWT
- Integración con GraphQL
- Pruebas unitarias y de integración
- Despliegue en contenedores Docker
