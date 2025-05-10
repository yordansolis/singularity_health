// Definición de la mutación GraphQL
const CREATE_USER_MUTATION = `
  mutation CreateUser(
    $username: String!,
    $email: String!,
    $password: String!,
    $first_name: String!,
    $last_name: String!,
    $document_type: String!,
    $document_number: String!,
    $issue_date: Date!,
    $phone_number: String!,
    $address: String!,
    $city: String!,
    $country: String!
  ) {
    createUser(
      username: $username,
      email: $email,
      password: $password,
      firstName: $first_name,
      lastName: $last_name,
      documentType: $document_type,
      documentNumber: $document_number,
      issueDate: $issue_date,
      phoneNumber: $phone_number,
      address: $address,
      city: $city,
      country: $country
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
`;

// Función para realizar peticiones GraphQL
async function executeGraphQL(query, variables) {
  try {
    console.log('Enviando consulta GraphQL:', query);
    console.log('Con variables:', variables);
    
    const response = await fetch('http://127.0.0.1:7007/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'same-origin', // Cambiado de 'include' a 'same-origin'
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    
    const result = await response.json();
    console.log('Resultado GraphQL:', result);
    return result;
  } catch (error) {
    console.error('Error en la petición GraphQL:', error);
    throw error;
  }
}

// Esperar a que el DOM esté completamente cargado antes de inicializar Vue
document.addEventListener('DOMContentLoaded', () => {
  // Crear la aplicación Vue
  const { createApp, ref, reactive } = Vue;

  const app = createApp({
    setup() {
      // Estado del formulario
      const formData = reactive({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        document_type: '',
        document_number: '',
        issue_date: '',
        phone_number: '',
        address: '',
        city: '',
        country: ''
      });

      // Estado de errores
      const errors = reactive({});
      const generalError = ref('');
      const isSubmitting = ref(false);
      const registrationSuccess = ref(false);

      // Validaciones
      const validators = {
        username: (value) => {
          if (!value) return 'El nombre de usuario es obligatorio';
          if (value.length < 4) return 'El nombre de usuario debe tener al menos 4 caracteres';
          return null;
        },
        email: (value) => {
          if (!value) return 'El correo electrónico es obligatorio';
          const emailRegex = /^[\w\.-]+@[\w\.-]+\.\w+$/;
          if (!emailRegex.test(value)) return 'El formato del correo electrónico no es válido';
          return null;
        },
        password: (value) => {
          if (!value) return 'La contraseña es obligatoria';
          if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
          if (!/[A-Z]/.test(value)) return 'La contraseña debe contener al menos una letra mayúscula';
          if (!/[a-z]/.test(value)) return 'La contraseña debe contener al menos una letra minúscula';
          if (!/[0-9]/.test(value)) return 'La contraseña debe contener al menos un número';
          return null;
        },
        password_confirm: (value) => {
          if (!value) return 'Debes confirmar la contraseña';
          if (value !== formData.password) return 'Las contraseñas no coinciden';
          return null;
        },
        first_name: (value) => {
          if (!value) return 'El nombre es obligatorio';
          return null;
        },
        last_name: (value) => {
          if (!value) return 'El apellido es obligatorio';
          return null;
        },
        document_type: (value) => {
          if (!value) return 'El tipo de documento es obligatorio';
          return null;
        },
        document_number: (value) => {
          if (!value) return 'El número de documento es obligatorio';
          return null;
        },
        issue_date: (value) => {
          if (!value) return 'La fecha de expedición es obligatoria';
          // Verificar formato de fecha válido (YYYY-MM-DD)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(value)) return 'El formato de fecha debe ser YYYY-MM-DD';
          return null;
        },
        phone_number: (value) => {
          if (!value) return 'El número de teléfono es obligatorio';
          const phoneRegex = /^\+?[0-9]{8,15}$/;
          if (!phoneRegex.test(value)) return 'El formato del número de teléfono no es válido (ej: +56912345678)';
          return null;
        },
        address: (value) => {
          if (!value) return 'La dirección es obligatoria';
          return null;
        },
        city: (value) => {
          if (!value) return 'La ciudad es obligatoria';
          return null;
        },
        country: (value) => {
          if (!value) return 'El país es obligatorio';
          return null;
        }
      };

      // Validar un campo específico
      const validateField = (fieldName) => {
        const validator = validators[fieldName];
        if (validator) {
          const error = validator(formData[fieldName]);
          if (error) {
            errors[fieldName] = error;
          } else {
            delete errors[fieldName];
          }
        }
      };

      // Validar todos los campos
      const validateAllFields = () => {
        Object.keys(validators).forEach(field => {
          validateField(field);
        });
        
        return Object.keys(errors).length === 0;
      };

      // Enviar el formulario
      const submitForm = async () => {
        generalError.value = '';
        
        // Validar todos los campos antes de enviar
        if (!validateAllFields()) {
          generalError.value = 'Por favor, corrija los errores del formulario antes de enviar.';
          return;
        }
        
        isSubmitting.value = true;
        
        try {
          // Preparar las variables para la mutación
          const variables = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
            document_type: formData.document_type,
            document_number: formData.document_number,
            issue_date: formData.issue_date,
            phone_number: formData.phone_number,
            address: formData.address,
            city: formData.city,
            country: formData.country
          };
          
          console.log('Enviando datos:', variables);
          
          // Ejecutar la mutación
          const response = await executeGraphQL(CREATE_USER_MUTATION, variables);
          console.log('Respuesta del servidor:', response);
          
          // Verificar si hay errores en la respuesta
          if (response.errors && response.errors.length > 0) {
            generalError.value = response.errors[0].message;
            return;
          }
          
          // Registro exitoso
          registrationSuccess.value = true;
          
          // Limpiar el formulario
          Object.keys(formData).forEach(key => {
            formData[key] = '';
          });
          
        } catch (error) {
          console.error('Error al registrar usuario:', error);
          generalError.value = 'Ha ocurrido un error al procesar su solicitud. Por favor, inténtelo de nuevo más tarde.';
        } finally {
          isSubmitting.value = false;
        }
      };

      return {
        formData,
        errors,
        generalError,
        isSubmitting,
        registrationSuccess,
        validateField,
        submitForm
      };
    }
  });

  // Asegurarnos de que el elemento #app existe antes de montar la aplicación
  const appElement = document.getElementById('app');
  if (appElement) {
    app.mount('#app');
    console.log('Aplicación Vue montada correctamente');
  } else {
    console.error('No se encontró el elemento #app en el DOM');
  }
});
