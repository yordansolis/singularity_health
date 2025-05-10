from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self,
                     email,
                     username,
                       password=None,
                         **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        if not username:
            raise ValueError('El nombre de usuario es obligatorio')
        
        email = self.normalize_email(email) # normaliza el email para que quede en minusculas
        user = self.model(email=email, username=username, **extra_fields) # crea el usuario en la base de datos
        user.set_password(password) # encripta la contraseña
        user.save(using=self._db)
        return user
    
    def create_superuser(self, 
                         email,
                          username, 
                          password=None, 
                          **extra_fields):
        
        
        extra_fields.setdefault('is_staff', True) # establece el campo is_staff en True
        extra_fields.setdefault('is_superuser', True) # establece el campo is_superuser en True que sirve para dar permisos de superusuario
        
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    
    objects = CustomUserManager() # establece el manager por defecto
    
    USERNAME_FIELD = 'email' # establece el campo de autenticación
    REQUIRED_FIELDS = ['username'] # establece los campos requeridos
    
    def __str__(self):
        return self.email + ' - ' + self.username  

class IdentityDocumentType(models.TextChoices):
    DNI = 'DNI', 'DNI'
    PASSPORT = 'PASSPORT', 'Pasaporte'
    RESIDENCE_CARD = 'RESIDENCE', 'Tarjeta de Residencia'
    OTHER = 'OTHER', 'Otro'

class IdentityDocument(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='identity_document')
    document_type = models.CharField(max_length=20, choices=IdentityDocumentType.choices)
    document_number = models.CharField(max_length=50)
    issue_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('document_type', 'document_number')
    
    def __str__(self):
        return f"{self.document_type}: {self.document_number}"

class Contact(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='contact')
    phone_number = models.CharField(max_length=20)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Contact for {self.user.email} "