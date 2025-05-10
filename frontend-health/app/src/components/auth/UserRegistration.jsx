import { useState, useRef, useEffect } from 'react';
import { executeGraphQL, userQueries } from '../../services/graphqlService';
import { validators } from '../../utils/validators';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UserRegistration.css';
import logo from '../../assets/logo.png';

function UserRegistration() {
  // Estados del formulario
  const [formData, setFormData] = useState({
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
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);

  // Estado para el paso actual
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Estado para rastrear qué campos han sido tocados
  const [touchedFields, setTouchedFields] = useState({});

  // Referencia para el input de fecha
  const dateInputRef = useRef(null);

  // Ref para el contenedor de toast
  const toastContainerRef = useRef(null);

  // Función específica para manejar el cambio en el checkbox de términos
  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked);
    if (e.target.checked) {
      setTermsError(false);
    }
  };

  // Función para manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Marcar el campo como tocado
    setTouchedFields(prevState => ({
      ...prevState,
      [name]: true
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
        
        // Marcar el campo como tocado cuando se valida explícitamente
        setTouchedFields(prevState => ({
          ...prevState,
          [name]: true
        }));
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

  // Función para validar campos del paso actual
  const validateCurrentStep = () => {
    const fieldsToValidate = {
      1: ['username', 'email', 'password', 'password_confirm'],
      2: ['first_name', 'last_name', 'document_type', 'document_number', 'issue_date'],
      3: ['phone_number', 'address', 'city', 'country']
    };
    
    let isValid = true;
    const newErrors = { ...errors };
    
    fieldsToValidate[currentStep].forEach(fieldName => {
      if (validators[fieldName]) {
        // Marcar el campo como tocado cuando se valida en el cambio de paso
        setTouchedFields(prevState => ({
          ...prevState,
          [fieldName]: true
        }));
        
        let error;
        if (fieldName === 'password_confirm') {
          error = validators[fieldName](formData[fieldName], formData);
        } else {
          error = validators[fieldName](formData[fieldName]);
        }
        
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        } else {
          delete newErrors[fieldName];
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  // Función para hacer scroll al inicio del formulario o toast
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Funciones para navegar entre pasos
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast.error('Por favor, corrija los errores antes de continuar.', {
        position: "top-center",
        autoClose: 3000,
        onOpen: scrollToTop
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
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

  // Función para abrir el selector de fecha
  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  // Función para validar y marcar términos y condiciones
  const validateTerms = () => {
    if (!termsAccepted) {
      setTermsError(true);
      
      // Hacer scroll al checkbox de términos
      const termsElement = document.getElementById('termsCheck');
      if (termsElement) {
        termsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      toast.error('Debe aceptar los términos y condiciones para continuar.', {
        position: "top-center",
        autoClose: 3000
      });
      
      return false;
    }
    
    return true;
  };

  // Manejador separado para la acción de envío
  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Botón de registro clickeado");
    
    // Verificar términos y condiciones - SIMPLIFICADO
    if (!termsAccepted) {
      // Establecer el error en el estado
      setTermsError(true);
      
      // Mostrar alerta clara y directa
      // alert('Debe aceptar los términos y condiciones para completar el registro.');
      
      // Desplazamiento al checkbox
      const termsElement = document.getElementById('termsCheck');
      if (termsElement) {
        termsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }
    
    // Marcar todos los campos como tocados para mostrar todos los errores
    const allFields = Object.keys(formData);
    const allTouched = allFields.reduce((touched, field) => {
      touched[field] = true;
      return touched;
    }, {});
    setTouchedFields(allTouched);
    
    // Validar todos los campos
    if (!validateAllFields()) {
      console.log("Validación de campos fallida");
      setGeneralError('Por favor, corrija los errores del formulario antes de enviar.');
      toast.error('Por favor, corrija los errores del formulario antes de enviar.', {
        position: "top-center",
        autoClose: 3000,
        onOpen: scrollToTop
      });
      return;
    }
    
    // Si todo está validado, proceder con la petición a la API
    submitFormToAPI();
  };
  
  // Función para enviar el formulario a la API
  const submitFormToAPI = async () => {
    // Limpiar mensajes previos
    setGeneralError('');
    setRegistrationSuccess(false);
    
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
      
      // Mostrar información en consola para depuración
      console.log('Datos que se enviarán al servidor:', variables);
      
      // Ejecutar la mutación
      const response = await executeGraphQL(userQueries.CREATE_USER_MUTATION, variables);
      
      // Debug para ver la respuesta completa
      console.log('Respuesta completa del servidor:', response);
      
      // Verificar si hay errores
      if (response.errors && response.errors.length > 0) {
        console.error('Errores recibidos del servidor:', response.errors);
        
        // Detectar error de email duplicado o cualquier otro error específico
        const errorMessage = response.errors[0].message;
        if (errorMessage.includes('email') && errorMessage.includes('registrado')) {
          const detailedError = `El correo electrónico ${formData.email} ya está registrado. Por favor utilice otro correo o inicie sesión.`;
          setGeneralError(detailedError);
          toast.error(detailedError, {
            position: "top-center",
            autoClose: 3000,
            onOpen: scrollToTop
          });
        } else if (errorMessage.includes('documento') && errorMessage.includes('registrado')) {
          const detailedError = `El documento ${formData.document_type}: ${formData.document_number} ya está registrado.`;
          setGeneralError(detailedError);
          toast.error(detailedError, {
            position: "top-center",
            autoClose: 3000,
            onOpen: scrollToTop
          });
        } else {
          setGeneralError(errorMessage);
          toast.error(errorMessage, {
            position: "top-center",
            autoClose: 3000,
            onOpen: scrollToTop
          });
        }
        return;
      }
      
      // Mostrar mensaje de éxito
      setRegistrationSuccess(true);
      toast.success('¡Registro exitoso! Su cuenta ha sido creada correctamente.', {
        position: "top-center",
        autoClose: 3000,
        onOpen: scrollToTop
      });
      
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
      const errorMessage = 'Ha ocurrido un error al procesar su solicitud. Por favor, inténtelo de nuevo más tarde.';
      setGeneralError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
        onOpen: scrollToTop
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar error simplificado
  const renderFieldError = (errorMessage, fieldName) => {
    // Solo mostrar error si el campo ha sido tocado
    if (!errorMessage || !touchedFields[fieldName]) return null;
    
    return (
      <div className="error-message">
        {errorMessage}
      </div>
    );
  };

  // Renderizador de indicador de pasos
  const renderStepIndicator = () => {
    return (
      <div className="stepper">
        {[...Array(totalSteps)].map((_, index) => (
          <div 
            key={index} 
            className={`step ${currentStep > index + 1 ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">
              {index === 0 ? 'Cuenta' : index === 1 ? 'Personal' : 'Contacto'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Función para renderizar el campo de términos y condiciones
  const renderTermsAndConditions = () => {
    return (
      <div className="form-field checkbox terms-container">
        <div className={`checkbox-container ${termsError ? 'checkbox-error' : ''}`}>
          <input 
            type="checkbox" 
            id="termsCheck"
            checked={termsAccepted}
            onChange={handleTermsChange}
            className={`terms-checkbox ${termsError ? 'checkbox-input-error' : ''}`}
            style={termsError ? {border: '2px solid red'} : {}}
          />
          <label htmlFor="termsCheck" className="terms-label" style={termsError ? {color: '#f44336', fontWeight: 'bold'} : {}}>
            <span className="required-indicator">*</span> Acepto los <a href="#" className="terms-link">términos y condiciones</a> y la <a href="#" className="terms-link">política de privacidad</a>
          </label>
          {termsError && (
            <div className="error-message" style={{fontWeight: 'bold', fontSize: '14px', marginTop: '8px'}}>
              Debe aceptar los términos y condiciones para continuar.
            </div>
          )}
        </div>
      </div>
    );
  };

  // Renderizar el paso actual
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h2>Información de cuenta</h2>
            
            <div className="form-field">
              <label htmlFor="username">Nombre de usuario</label>
              <input 
                type="text" 
                id="username" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={() => validateField('username')}
                placeholder="Ingrese su nombre de usuario"
                className={errors.username && touchedFields.username ? 'error' : ''}
              />
              {renderFieldError(errors.username, 'username')}
            </div>
            
            <div className="form-field">
              <label htmlFor="email">Correo electrónico</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => validateField('email')}
                placeholder="nombre@ejemplo.com"
                className={errors.email && touchedFields.email ? 'error' : ''}
              />
              {renderFieldError(errors.email, 'email')}
            </div>
            
            <div className="form-field">
              <label htmlFor="password">Contraseña</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => validateField('password')}
                placeholder="••••••••"
                className={errors.password && touchedFields.password ? 'error' : ''}
              />
              {renderFieldError(errors.password, 'password')}
            </div>
            
            <div className="form-field">
              <label htmlFor="password_confirm">Confirmar contraseña</label>
              <input 
                type="password" 
                id="password_confirm" 
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                onBlur={() => validateField('password_confirm')}
                placeholder="••••••••"
                className={errors.password_confirm && touchedFields.password_confirm ? 'error' : ''}
              />
              {renderFieldError(errors.password_confirm, 'password_confirm')}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="form-step">
            <h2>Información personal</h2>
            
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="first_name">Nombre</label>
                <input 
                  type="text" 
                  id="first_name" 
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  onBlur={() => validateField('first_name')}
                  placeholder="Ingrese su nombre"
                  className={errors.first_name && touchedFields.first_name ? 'error' : ''}
                />
                {renderFieldError(errors.first_name, 'first_name')}
              </div>
              
              <div className="form-field">
                <label htmlFor="last_name">Apellido</label>
                <input 
                  type="text" 
                  id="last_name" 
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  onBlur={() => validateField('last_name')}
                  placeholder="Ingrese su apellido"
                  className={errors.last_name && touchedFields.last_name ? 'error' : ''}
                />
                {renderFieldError(errors.last_name, 'last_name')}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="document_type">Tipo de documento</label>
                <select
                  id="document_type"
                  name="document_type"
                  value={formData.document_type}
                  onChange={handleChange}
                  onBlur={() => validateField('document_type')}
                  className={errors.document_type && touchedFields.document_type ? 'error' : ''}
                >
                  <option value="" disabled>Seleccione tipo</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="PA">Pasaporte</option>
                </select>
                {renderFieldError(errors.document_type, 'document_type')}
              </div>
              
              <div className="form-field">
                <label htmlFor="document_number">Número de documento</label>
                <input 
                  type="text" 
                  id="document_number" 
                  name="document_number"
                  value={formData.document_number}
                  onChange={handleChange}
                  onBlur={() => validateField('document_number')}
                  placeholder="12345678"
                  className={errors.document_number && touchedFields.document_number ? 'error' : ''}
                />
                {renderFieldError(errors.document_number, 'document_number')}
              </div>
            </div>
            
            <div className="form-field">
              <label htmlFor="issue_date">Fecha de expedición</label>
              <input 
                ref={dateInputRef}
                type="date" 
                id="issue_date" 
                name="issue_date"
                value={formData.issue_date}
                onChange={handleChange}
                onBlur={() => validateField('issue_date')}
                onClick={openDatePicker}
                max={new Date().toISOString().split('T')[0]}
                className={errors.issue_date && touchedFields.issue_date ? 'error' : ''}
              />
              {renderFieldError(errors.issue_date, 'issue_date')}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="form-step">
            <h2>Información de contacto</h2>
            
            <div className="form-field">
              <label htmlFor="phone_number">Número de teléfono</label>
              <input 
                type="tel" 
                id="phone_number" 
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                onBlur={() => validateField('phone_number')}
                placeholder="3001234567"
                className={errors.phone_number && touchedFields.phone_number ? 'error' : ''}
              />
              {renderFieldError(errors.phone_number, 'phone_number')}
            </div>
            
            <div className="form-field">
              <label htmlFor="address">Dirección</label>
              <input 
                type="text" 
                id="address" 
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={() => validateField('address')}
                placeholder="Calle 123 # 45-67"
                className={errors.address && touchedFields.address ? 'error' : ''}
              />
              {renderFieldError(errors.address, 'address')}
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="city">Ciudad</label>
                <input 
                  type="text" 
                  id="city" 
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={() => validateField('city')}
                  placeholder="Bogotá"
                  className={errors.city && touchedFields.city ? 'error' : ''}
                />
                {renderFieldError(errors.city, 'city')}
              </div>
              
              <div className="form-field">
                <label htmlFor="country">País</label>
                <input 
                  type="text" 
                  id="country" 
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  onBlur={() => validateField('country')}
                  placeholder="Colombia"
                  className={errors.country && touchedFields.country ? 'error' : ''}
                />
                {renderFieldError(errors.country, 'country')}
              </div>
            </div>
            
            {renderTermsAndConditions()}
          </div>
        );
        
      default:
        return null;
    }
  };

  // Renderizar botones de navegación
  const renderNavButtons = () => {
    // Determinar si el botón de envío debe estar habilitado
    const isSubmitDisabled = isSubmitting;
    
    return (
      <div className="form-navigation">
        {currentStep > 1 && (
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={prevStep}
            disabled={isSubmitting}
          >
            Anterior
          </button>
        )}
        
        {currentStep < totalSteps ? (
          <button 
            type="button" 
            className="btn-primary btn-next" 
            onClick={nextStep}
            disabled={isSubmitting}
          >
            Siguiente
          </button>
        ) : (
          <button 
            type="button"
            className="btn-primary" 
            disabled={isSubmitDisabled}
            onClick={(e) => {
              // Si no han aceptado los términos, mostrar un alerta y destacar visualmente
              if (!termsAccepted) {
                setTermsError(true);
                // alert('Debe aceptar los términos y condiciones para completar el registro.');
                
                // Desplazamiento al checkbox
                const termsElement = document.getElementById('termsCheck');
                if (termsElement) {
                  termsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
              }
              // Si los términos están aceptados, continuar con el envío del formulario
              handleFormSubmit(e);
            }}
          >
            {isSubmitting ? 'Enviando...' : 'Registrarse'}
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <ToastContainer
        ref={toastContainerRef}
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="form-container">
        <div className="logo">
          <img src={logo} alt="Singularity Health" />
        </div>
        
        <h1>Registro de Usuario</h1>
        
        {renderStepIndicator()}
        
        <div className="registration-form">  {/* Cambiado de form a div */}
          {renderStep()}
          {renderNavButtons()}
        </div>
        
        {/* <div className="login-link">
          ¿Ya tienes una cuenta? <a href="/login">Iniciar sesión</a>
        </div> */}
      </div>
    </>
  );
}

export default UserRegistration; 