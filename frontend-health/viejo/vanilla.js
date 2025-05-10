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
      credentials: 'same-origin',
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    
    if (!response.ok) {
      console.error(`Error HTTP: ${response.status} ${response.statusText}`);
      throw new Error(`Error de servidor: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Resultado GraphQL:', result);
    return result;
  } catch (error) {
    console.error('Error en la petición GraphQL:', error);
    throw error;
  }
}

// Validators para los campos del formulario
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
  password_confirm: (value, formData) => {
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

// Función para validar un campo
function validateField(fieldName, formData) {
  const field = document.getElementById(fieldName);
  const feedbackElement = document.getElementById(`${fieldName}-feedback`);
  
  if (!field) {
    console.error(`Error: No se encontró el campo ${fieldName}`);
    return false;
  }
  
  if (!feedbackElement) {
    console.error(`Error: No se encontró el elemento de feedback para ${fieldName}`);
    return false;
  }
  
  const value = field.value.trim();
  let error = null;
  
  if (validators[fieldName]) {
    // Para password_confirm necesitamos pasar formData
    if (fieldName === 'password_confirm') {
      error = validators[fieldName](value, formData);
    } else {
      error = validators[fieldName](value);
    }
  }
  
  if (error) {
    field.classList.add('is-invalid');
    feedbackElement.textContent = error;
    feedbackElement.style.display = 'block';
    return false;
  } else {
    field.classList.remove('is-invalid');
    feedbackElement.textContent = '';
    feedbackElement.style.display = 'none';
    return true;
  }
}

// Función para validar todos los campos
function validateAllFields(formData) {
  const fields = [
    'username', 'email', 'password', 'password_confirm',
    'first_name', 'last_name', 'document_type', 'document_number',
    'issue_date', 'phone_number', 'address', 'city', 'country'
  ];
  
  let isValid = true;
  
  fields.forEach(field => {
    const fieldValid = validateField(field, formData);
    if (!fieldValid) isValid = false;
  });
  
  return isValid;
}

// Función para obtener los datos del formulario
function getFormData() {
  return {
    username: document.getElementById('username').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value.trim(),
    password_confirm: document.getElementById('password_confirm').value.trim(),
    first_name: document.getElementById('first_name').value.trim(),
    last_name: document.getElementById('last_name').value.trim(),
    document_type: document.getElementById('document_type').value,
    document_number: document.getElementById('document_number').value.trim(),
    issue_date: document.getElementById('issue_date').value,
    phone_number: document.getElementById('phone_number').value.trim(),
    address: document.getElementById('address').value.trim(),
    city: document.getElementById('city').value.trim(),
    country: document.getElementById('country').value.trim()
  };
}

// Función para mostrar mensajes de error
function showError(message) {
  console.log(`Mostrando error: ${message}`);
  
  const errorAlert = document.getElementById('errorAlert');
  const errorMessage = document.getElementById('errorMessage');
  
  if (!errorAlert || !errorMessage) {
    console.error('Error: No se encontraron elementos para mostrar el mensaje de error');
    alert(`Error: ${message}`);
    return;
  }
  
  errorMessage.textContent = message;
  errorAlert.classList.remove('hidden');
  
  // Hacer scroll al mensaje de error para que sea visible
  errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Función para mostrar mensaje de éxito
function showSuccess() {
  console.log('Mostrando mensaje de éxito');
  
  const successAlert = document.getElementById('successAlert');
  if (!successAlert) {
    console.error('Error: No se encontró el elemento de alerta de éxito');
    alert('Registro exitoso');
    return;
  }
  
  successAlert.classList.remove('hidden');
  
  // Hacer scroll al mensaje de éxito para que sea visible
  successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Función para restablecer el formulario
function resetForm() {
  const form = document.getElementById('registrationForm');
  if (!form) {
    console.error('Error: No se encontró el formulario');
    return;
  }
  
  form.reset();
  
  // Eliminar todas las clases is-invalid
  const invalidFields = document.querySelectorAll('.is-invalid');
  if (invalidFields) {
    invalidFields.forEach(field => {
      field.classList.remove('is-invalid');
    });
  }
  
  // Ocultar todos los mensajes de feedback
  const feedbackElements = document.querySelectorAll('.invalid-feedback');
  if (feedbackElements) {
    feedbackElements.forEach(element => {
      element.textContent = '';
      element.style.display = 'none';
    });
  }
}

// Función para manejar el envío del formulario
async function handleSubmit(event) {
  event.preventDefault();
  console.log('Formulario enviado');
  
  // Obtener referencias a elementos críticos
  const errorAlert = document.getElementById('errorAlert');
  const successAlert = document.getElementById('successAlert');
  const submitButton = document.getElementById('submitButton');
  const spinner = document.getElementById('spinner');
  const buttonText = document.getElementById('buttonText');
  
  // Si algún elemento no existe, no podemos continuar
  if (!errorAlert || !successAlert || !submitButton || !spinner || !buttonText) {
    console.error('Error crítico: Elementos del DOM no encontrados durante el envío');
    alert('Error en la interfaz. Por favor, recargue la página e intente nuevamente.');
    return;
  }

  // Ocultar alertas previas
  errorAlert.classList.add('hidden');
  successAlert.classList.add('hidden');
  
  // Obtener y validar datos del formulario
  const formData = getFormData();
  if (!validateAllFields(formData)) {
    showError('Por favor, corrija los errores del formulario antes de enviar.');
    return;
  }
  
  // Guardar texto original del botón
  const buttonTextOriginal = buttonText.textContent;
  
  // Mostrar estado de procesamiento
  submitButton.disabled = true;
  spinner.classList.remove('hidden');
  buttonText.textContent = 'Procesando...';
  
  try {
    console.log('Enviando datos...');
    
    // Preparar variables para la mutación
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
    
    // Ejecutar la mutación
    const response = await executeGraphQL(CREATE_USER_MUTATION, variables);
    console.log('Respuesta recibida:', response);
    
    // Verificar si hay errores
    if (response.errors && response.errors.length > 0) {
      console.error('Error en respuesta GraphQL:', response.errors);
      showError(response.errors[0].message);
      return;
    }
    
    // Mostrar mensaje de éxito
    console.log('Registro exitoso');
    showSuccess();
    
    // Limpiar el formulario
    resetForm();
    
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    showError('Ha ocurrido un error al procesar su solicitud. Por favor, inténtelo de nuevo más tarde.');
  } finally {
    console.log('Finalizando envío');
    // Restaurar el estado original del botón
    submitButton.disabled = false;
    spinner.classList.add('hidden');
    buttonText.textContent = buttonTextOriginal;
  }
}

// Configurar validación de campos cuando se pierde el foco
function setupFieldValidation() {
  const fields = [
    'username', 'email', 'password', 'password_confirm',
    'first_name', 'last_name', 'document_type', 'document_number',
    'issue_date', 'phone_number', 'address', 'city', 'country'
  ];
  
  fields.forEach(field => {
    const element = document.getElementById(field);
    if (element) {
      element.addEventListener('blur', () => {
        validateField(field, getFormData());
      });
    }
  });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Cargado - Configurando formulario');
  
  // Verificar existencia de elementos críticos
  const criticalElements = [
    'registrationForm', 
    'submitButton', 
    'spinner', 
    'buttonText',
    'errorAlert',
    'errorMessage',
    'successAlert'
  ];
  
  let allElementsExist = true;
  const missingElements = [];
  
  criticalElements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Elemento crítico no encontrado: #${elementId}`);
      missingElements.push(elementId);
      allElementsExist = false;
    } else {
      console.log(`Elemento encontrado: #${elementId}`);
    }
  });
  
  if (!allElementsExist) {
    console.error(`No se pueden configurar los eventos. Elementos faltantes: ${missingElements.join(', ')}`);
    alert('Error al inicializar el formulario. Por favor, recargue la página.');
    return;
  }
  
  // Configurar el manejador del formulario
  const form = document.getElementById('registrationForm');
  form.addEventListener('submit', handleSubmit);
  
  // Configurar validación de campos
  setupFieldValidation();
  
  // Configurar botones para cerrar alertas
  const closeButtons = document.querySelectorAll('.btn-close');
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      this.parentElement.classList.add('hidden');
    });
  });
  
  console.log('Formulario inicializado correctamente');
}); 