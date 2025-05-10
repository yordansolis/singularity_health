# Singularity Health - Sistema de Registro de Usuarios

## Descripción del Proyecto

Este proyecto es una solución a la prueba técnica para Desarrollador Backend en Singularity Health, que consiste en un sistema completo de registro de usuarios con validación de datos y persistencia usando GraphQL. El sistema está compuesto por un backend desarrollado con Django y GraphQL, y un frontend desarrollado con React.

## Características Principales

- **API GraphQL**: Implementación completa para la persistencia de datos
- **Modelos de datos relacionados**: Usuario, Documento de Identidad, Contacto
- **Validaciones robustas**: Validación de datos en backend y frontend
- **Interfaz de usuario moderna**: Diseñada con React y Bootstrap
- **Seguridad**: Contraseñas encriptadas y validaciones de datos

## Tecnologías Utilizadas

### Backend

- Django
- Graphene-Django (GraphQL)
- SQLite (base de datos)
- Django CORS Headers
- BCrypt (para encriptación de contraseñas)

### Frontend

- React
- Bootstrap
- React-Toastify (notificaciones)
- Vite (bundler)

## Requisitos Previos

- Python 3.8+
- Node.js 18+
- npm o yarn

## Instalación y Configuración

### Backend

1. Navega al directorio del backend:

   ```
   cd backend
   ```

2. Crea un entorno virtual e instala las dependencias:

   ```
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Ejecuta las migraciones:

   ```
   python manage.py migrate
   ```

4. Inicia el servidor:
   ```
   python manage.py runserver 7007
   ```
   El servidor estará disponible en http://127.0.0.1:7007/

### Frontend

1. Navega al directorio del frontend:

   ```
   cd frontend-health/app
   ```

2. Instala las dependencias:

   ```
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```
   npm run dev
   ```
   La aplicación estará disponible en http://localhost:5173/

## Estructura del Proyecto

### Backend

- **users/**: Aplicación principal con los modelos y esquema GraphQL
  - **models.py**: Define los modelos de Usuario, Documento de Identidad y Contacto
  - **schema.py**: Define los tipos GraphQL y mutaciones
- **singularity_health/**: Configuración del proyecto Django
  - **settings.py**: Configuración del proyecto
  - **urls.py**: Rutas del proyecto
  - **schema.py**: Esquema GraphQL principal

### Frontend

- **src/components/auth/**: Componentes de autenticación
  - **UserRegistration.jsx**: Formulario de registro de usuarios
- **src/services/**: Servicios para comunicación con el backend
  - **graphqlService.js**: Servicio para realizar peticiones GraphQL

## Uso del Sistema

### API GraphQL

La API GraphQL está disponible en http://127.0.0.1:7007/graphql/ y proporciona una interfaz gráfica para realizar consultas y mutaciones.

#### Crear un Usuario

```graphql
mutation {
  createUser(
    username: "usuario1"
    email: "usuario@ejemplo.com"
    password: "Password123"
    firstName: "Nombre"
    lastName: "Apellido"
    documentType: "DNI"
    documentNumber: "12345678"
    issueDate: "2023-01-01"
    phoneNumber: "+1234567890"
    address: "Calle Principal 123"
    city: "Ciudad"
    country: "País"
  ) {
    user {
      id
      username
      email
      firstName
      lastName
    }
  }
}
```

#### Consultar Usuarios

```graphql
query {
  users {
    id
    username
    email
    firstName
    lastName
  }
}
```

### Interfaz de Usuario

La aplicación frontend proporciona un formulario de registro intuitivo con validaciones en tiempo real. El formulario está dividido en secciones para facilitar la entrada de datos:

1. **Información Personal**: Nombre de usuario, correo electrónico, contraseña, nombre y apellido
2. **Documento de Identidad**: Tipo de documento, número y fecha de expedición
3. **Información de Contacto**: Teléfono, dirección, ciudad y país

## Validaciones Implementadas

- **Email**: Formato válido y unicidad
- **Nombre de usuario**: Mínimo 4 caracteres y unicidad
- **Contraseña**: Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
- **Documento**: Unicidad de la combinación tipo y número
- **Teléfono**: Formato válido

## Seguridad

- Contraseñas encriptadas con BCrypt
- Validaciones en backend y frontend
- Protección CSRF en las peticiones

## Licencia

Este proyecto es de código abierto y está disponible bajo la Licencia MIT.

## Autor

Desarrollado como prueba técnica para Singularity Health.
