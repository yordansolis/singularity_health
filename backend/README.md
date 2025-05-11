# Prueba Técnica: Desarrollador Backend en Singularity Health

Este proyecto es una solución a la prueba técnica para Desarrollador Backend en Singularity Health, que consiste en crear un formulario de registro de usuarios con validación de datos y persistencia usando GraphQL.

## Características Implementadas

- API GraphQL para la persistencia de datos
- Modelos de datos relacionados (Usuario, Documento de Identidad, Contacto)
- Validación de formato y duplicidad de datos
- Almacenamiento seguro de contraseñas
- Formulario de registro con validación en tiempo real

## Tecnologías Utilizadas

- **Backend:**

  - Django
  - Graphene-Django (implementación de GraphQL para Django)
  - Django CORS Headers

- **Frontend:**
  - HTML5
  - CSS (Tailwind CSS)
  - JavaScript (jQuery)

## Estructura del Proyecto

```
singularity_health_project/
├── manage.py
├── singularity_health/         # Configuración principal del proyecto
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── schema.py               # Esquema GraphQL principal
├── users/                      # Aplicación de usuarios
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py               # Modelos de datos
│   ├── schema.py               # Esquema GraphQL para usuarios
│   ├── migrations/
│   └── tests.py
└── frontend/                   # Archivos de frontend
    └── index.html              # Formulario de registro
```

## Modelos de Datos

### Usuario (User)

- Nombre de usuario (único)
- Email (único)
- Contraseña (hashada)
- Nombre y apellidos
- Fecha de registro

### Documento de Identidad (IdentityDocument)

- Tipo de documento (DNI, Pasaporte, etc.)
- Número de documento
- Fecha de expedición
- Relación con el usuario (OneToOne)

### Contacto (Contact)

- Teléfono
- Dirección
- Ciudad
- País
- Relación con el usuario (OneToOne)

## API GraphQL

### Mutaciones

- **createUser**: Permite registrar un nuevo usuario con su documento de identidad y datos de contacto

### Consultas

- **users**: Obtiene la lista de todos los usuarios
- **user**: Obtiene un usuario específico por ID

## Validaciones Implementadas

### Backend

- Validación de formato de email
- Validación de formato de número de teléfono
- Validación de contraseña (longitud, mayúsculas, minúsculas, números)
- Validación de duplicidad de email, nombre de usuario y documentos
- Almacenamiento seguro de contraseñas mediante hashing

### Frontend

- Validación en tiempo real para campos clave
- Validación de coincidencia de contraseñas
- Validación de campos requeridos
- Manejo de errores del servidor

## Instrucciones de Instalación

Ver archivo de instrucciones de configuración adjunto.

## Pruebas con GraphiQL

Accede a `http://localhost:8000/graphql/` para utilizar la interfaz GraphiQL y probar las consultas y mutaciones.

## Ejemplo de uso de la API

### Crear un usuario

```graphql
mutation {
  createUser(
    username: "usuario_test"
    email: "usuario@test.com"
    password: "Password123"
    firstName: "Usuario"
    lastName: "Test"
    documentType: "DNI"
    documentNumber: "12345678A"
    issueDate: "2020-01-01"
    phoneNumber: "+34612345678"
    address: "Calle Test 123"
    city: "Madrid"
    country: "España"
  ) {
    user {
      id
      username
      email
      firstName
      lastName
      identityDocument {
        documentType
        documentNumber
        issueDate
      }
      contact {
        phoneNumber
        address
        city
        country
      }
    }
  }
}
```

### Consultar usuarios

```graphql
query {
  users {
    id
    username
    email
    firstName
    lastName
    identityDocument {
      documentType
      documentNumber
    }
    contact {
      phoneNumber
      city
      country
    }
  }
}
```

## Notas Adicionales

- El sistema utiliza transacciones para garantizar la integridad de los datos.
- Todas las contraseñas son almacenadas mediante hash utilizando las funciones de seguridad de Django.
- La API incluye validaciones completas para evitar datos incorrectos o duplicados.
- El frontend incluye validación en tiempo real para mejorar la experiencia de usuario.

######

sudo apt install -y python3 python3-pip python3-venv
sudo apt install nginx -y
sudo apt install git -y

git clone …http repor
pip3 install -r requirements.txt
pip3 install gunicorn

cd nombre-del-repo

nano settings.py

ALLOWED_HOSTS = []

sudo apt install -y python3 python3-pip python3-venv
sudo apt install nginx -y
sudo apt install git -y

git clone …http repor
pip3 install -r requirements.txt
pip3 install gunicorn

cd nombre-del-repo

nano settings.py

ALLOWED_HOSTS = ['your.server.ip.address', 'yourdomain.com', 'localhost']

sudo nano /etc/systemd/system/gunicorn.service

[Unit]
Description=gunicorn daemon for Django app
After=network.target

[Service]
User=parth_nangroo
Group=www-data
WorkingDirectory=/home/parth_nangroo/singularity_health/backend
Environment="PATH=/home/parth_nangroo/venv/bin"
ExecStart-/home/parth_nangroo/venv/bin/gunicorn --access-logfile - --workers 3 --bind unix:/ho>

[Install]
WantedBy=multi-user.target

sudo systemctl daemon-reload
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
sudo systemctl status gunicorn
