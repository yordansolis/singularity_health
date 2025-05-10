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
const executeGraphQL = async (query, variables) => {
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
};

// Validadores para cada campo
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

function App() {
  // Estados del formulario
  const [formData, setFormData] = React.useState({
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
  
  // Estados para errores y mensajes
  const [errors, setErrors] = React.useState({});
  const [generalError, setGeneralError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [registrationSuccess, setRegistrationSuccess] = React.useState(false);

  // Función para manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Validar al cambiar
    validateField(name, value);
  };

  // Función para validar un campo
  const validateField = (name, value) => {
    if (validators[name]) {
      let validationValue = value;
      if (value === undefined) {
        validationValue = formData[name];
      }
      
      let error = null;
      if (name === 'password_confirm') {
        error = validators[name](validationValue, formData);
      } else {
        error = validators[name](validationValue);
      }
      
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: error
      }));
      
      return !error;
    }
    return true;
  };

  // Función para validar todos los campos
  const validateAllFields = () => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(validators).forEach(fieldName => {
      let error;
      if (fieldName === 'password_confirm') {
        error = validators[fieldName](formData[fieldName], formData);
      } else {
        error = validators[fieldName](formData[fieldName]);
      }
      
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Formulario enviado');
    
    // Limpiar mensajes previos
    setGeneralError('');
    setRegistrationSuccess(false);
    
    // Validar todos los campos
    if (!validateAllFields()) {
      setGeneralError('Por favor, corrija los errores del formulario antes de enviar.');
      return;
    }
    
    // Iniciar estado de carga
    setIsSubmitting(true);
    
    try {
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
      
      // Verificar si hay errores
      if (response.errors && response.errors.length > 0) {
        setGeneralError(response.errors[0].message);
        return;
      }
      
      // Mostrar mensaje de éxito
      setRegistrationSuccess(true);
      
      // Limpiar formulario
      setFormData({
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
      
      // Limpiar errores
      setErrors({});
      
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setGeneralError('Ha ocurrido un error al procesar su solicitud. Por favor, inténtelo de nuevo más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      {/* Encabezado */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">Registro de Usuario</h1>
        <p className="text-muted">Complete el siguiente formulario para crear su cuenta en Singularity Health</p>
      </div>

      {/* Alertas */}
      {registrationSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i> 
          <strong>¡Registro exitoso!</strong> Su cuenta ha sido creada correctamente.
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setRegistrationSuccess(false)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {generalError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>Error:</strong> {generalError}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setGeneralError('')}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        
        {/* Información básica */}
        <div className="mb-4">
          <h2 className="section-title">Información básica</h2>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="username" className="form-label">Nombre de usuario</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person"></i></span>
                <input 
                  type="text" 
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  id="username" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={() => validateField('username')}
                  placeholder="Ingrese su nombre de usuario"
                />
              </div>
              {errors.username && <div className="invalid-feedback d-block">{errors.username}</div>}
            </div>
            
            <div className="col-md-6">
              <label htmlFor="email" className="form-label">Correo electrónico</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                <input 
                  type="email" 
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => validateField('email')}
                  placeholder="nombre@ejemplo.com"
                />
              </div>
              {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
            </div>

            <div className="col-md-6">
              <label htmlFor="first_name" className="form-label">Nombre</label>
              <input 
                type="text" 
                className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                id="first_name" 
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                onBlur={() => validateField('first_name')}
                placeholder="Ingrese su nombre"
              />
              {errors.first_name && <div className="invalid-feedback d-block">{errors.first_name}</div>}
            </div>
            
            <div className="col-md-6">
              <label htmlFor="last_name" className="form-label">Apellido</label>
              <input 
                type="text" 
                className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                id="last_name" 
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={() => validateField('last_name')}
                placeholder="Ingrese su apellido"
              />
              {errors.last_name && <div className="invalid-feedback d-block">{errors.last_name}</div>}
            </div>

            <div className="col-md-6">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                <input 
                  type="password" 
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  id="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => validateField('password')}
                  placeholder="Contraseña"
                />
              </div>
              {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
              <div className="form-text">La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número.</div>
            </div>
            
            <div className="col-md-6">
              <label htmlFor="password_confirm" className="form-label">Confirmar contraseña</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                <input 
                  type="password" 
                  className={`form-control ${errors.password_confirm ? 'is-invalid' : ''}`}
                  id="password_confirm" 
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  onBlur={() => validateField('password_confirm')}
                  placeholder="Confirmar contraseña"
                />
              </div>
              {errors.password_confirm && <div className="invalid-feedback d-block">{errors.password_confirm}</div>}
            </div>
          </div>
        </div>
        
        {/* Documento de identidad */}
        <div className="mb-4">
          <h2 className="section-title">Documento de identidad</h2>
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="document_type" className="form-label">Tipo de documento</label>
              <select 
                className={`form-select ${errors.document_type ? 'is-invalid' : ''}`}
                id="document_type" 
                name="document_type"
                value={formData.document_type}
                onChange={handleChange}
                onBlur={() => validateField('document_type')}
              >
                <option value="">Seleccione un tipo</option>
                <option value="DNI">DNI</option>
                <option value="PASSPORT">Pasaporte</option>
                <option value="RESIDENCE">Tarjeta de Residencia</option>
                <option value="OTHER">Otro</option>
              </select>
              {errors.document_type && <div className="invalid-feedback d-block">{errors.document_type}</div>}
            </div>
            
            <div className="col-md-4">
              <label htmlFor="document_number" className="form-label">Número de documento</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-card-text"></i></span>
                <input 
                  type="text" 
                  className={`form-control ${errors.document_number ? 'is-invalid' : ''}`}
                  id="document_number" 
                  name="document_number"
                  value={formData.document_number}
                  onChange={handleChange}
                  onBlur={() => validateField('document_number')}
                  placeholder="Número de identificación"
                />
              </div>
              {errors.document_number && <div className="invalid-feedback d-block">{errors.document_number}</div>}
            </div>
            
            <div className="col-md-4">
              <label htmlFor="issue_date" className="form-label">Fecha de expedición</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-calendar3"></i></span>
                <input 
                  type="date" 
                  className={`form-control ${errors.issue_date ? 'is-invalid' : ''}`}
                  id="issue_date" 
                  name="issue_date"
                  value={formData.issue_date}
                  onChange={handleChange}
                  onBlur={() => validateField('issue_date')}
                />
              </div>
              {errors.issue_date && <div className="invalid-feedback d-block">{errors.issue_date}</div>}
            </div>
          </div>
        </div>
        
        {/* Información de contacto */}
        <div className="mb-4">
          <h2 className="section-title">Información de contacto</h2>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="phone_number" className="form-label">Número de teléfono</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                <input 
                  type="tel" 
                  className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
                  id="phone_number" 
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  onBlur={() => validateField('phone_number')}
                  placeholder="+5691234567"
                />
              </div>
              {errors.phone_number && <div className="invalid-feedback d-block">{errors.phone_number}</div>}
            </div>
            
            <div className="col-md-6">
              <label htmlFor="address" className="form-label">Dirección</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-house"></i></span>
                <input 
                  type="text" 
                  className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                  id="address" 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={() => validateField('address')}
                  placeholder="Ingrese su dirección"
                />
              </div>
              {errors.address && <div className="invalid-feedback d-block">{errors.address}</div>}
            </div>
            
            <div className="col-md-6">
              <label htmlFor="city" className="form-label">Ciudad</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-building"></i></span>
                <input 
                  type="text" 
                  className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                  id="city" 
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={() => validateField('city')}
                  placeholder="Ingrese su ciudad"
                />
              </div>
              {errors.city && <div className="invalid-feedback d-block">{errors.city}</div>}
            </div>
            
            <div className="col-md-6">
              <label htmlFor="country" className="form-label">País</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-globe"></i></span>
                <input 
                  type="text" 
                  className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                  id="country" 
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  onBlur={() => validateField('country')}
                  placeholder="Ingrese su país"
                />
              </div>
              {errors.country && <div className="invalid-feedback d-block">{errors.country}</div>}
            </div>
          </div>
        </div>
        
        {/* Botón de envío */}
        <div className="d-grid gap-2 col-md-6 mx-auto mt-5">
          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Procesando...
              </>
            ) : 'Registrar usuario'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Renderizar la aplicación
ReactDOM.render(<App />, document.getElementById('root')); 