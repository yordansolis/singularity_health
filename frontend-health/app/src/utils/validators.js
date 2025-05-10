// Form field validators

/**
 * Object containing validation functions for form fields
 */
export const validators = {
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