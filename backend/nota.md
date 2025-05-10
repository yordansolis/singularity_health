# Instrucciones de Configuración del Proyecto

## 1. Crear el entorno virtual e instalar dependencias

```bash
# Crear un entorno virtual
python -m venv venv

# Activar el entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar las dependencias
pip install -r requirements.txt
```

## 2. Crear el proyecto Django

```bash
# Crear el proyecto
django-admin startproject singularity_health

# Acceder al directorio del proyecto
cd singularity_health

# Crear la aplicación de usuarios
python manage.py startapp users
```

## 3. Copiar el código proporcionado

Copia los archivos de código proporcionados en el artefacto anterior a sus ubicaciones correspondientes en la estructura del proyecto.

## 4. Configurar el archivo settings.py

Asegúrate de tener configuradas las aplicaciones instaladas, middleware y configuración de GraphQL como se muestra en el fragmento del archivo settings.py.

También, agrega la siguiente configuración para la base de datos (o configura la que prefieras):

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

## 5. Crear y aplicar migraciones

```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate
```

## 6. Crear un superusuario (opcional)

```bash
python manage.py createsuperuser
```

## 7. Ejecutar el servidor de desarrollo

```bash
python manage.py runserver
```

## 8. Acceder a la interfaz GraphQL

Abre tu navegador y visita `http://localhost:8000/graphql/` para acceder a la interfaz GraphiQL, donde podrás probar las consultas y mutaciones de GraphQL.

## 9. Ejemplo de mutación para crear un usuario

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

## 10. Ejemplo de consulta para obtener usuarios

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

Super ususerio

jsolis
yordansolis2@gmaill.com
Admin123#
