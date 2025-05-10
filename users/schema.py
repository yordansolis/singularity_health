import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError
from django.db import transaction
from .models import User, IdentityDocument, Contact
import re

# Queries para obtener información de los usuarios
class UserType(DjangoObjectType):
    """Tipo GraphQL que representa un usuario registrado en el sistema."""

    class Meta:
        model = User
        exclude = ('password',) # Excluir la contraseña para seguridad
        description = "Contiene los datos básicos del usuario, excluyendo la contraseña."


class IdentityDocumentType(DjangoObjectType):
    """Tipo GraphQL para los documentos de identidad de los usuarios."""

    class Meta:
        model = IdentityDocument
        description = "Representa un documento de identidad vinculado a un usuario."

class ContactType(DjangoObjectType):
    """Tipo GraphQL para la información de contacto del usuario."""
    class Meta:
        model = Contact
        description = "Incluye teléfono, dirección, ciudad y país del usuario."



# Mutaciones para crear nuevos usuarios o actualizarlos o eliminarlos
class CreateUser(graphene.Mutation):
    """
    Mutación para crear un nuevo usuario con sus datos personales, documento de identidad y contacto.
    """
    class Arguments:
        # User data
        username = graphene.String(required=True,  description="El nombre del usuario único .")
        email = graphene.String(required=True, description="Correo electrónico del usuario.")
        password = graphene.String(required=True, description="Contraseña segura para la cuenta.")
        first_name = graphene.String(required=True, description="Nombre del usuario.")
        last_name = graphene.String(required=True, description="Apellido del usuario.")
        
        # Identity document data
        document_type = graphene.String(required=True, description="Tipo de documento (Ej: DNI, Pasaporte).")
        document_number = graphene.String(required=True, description="Número del documento.")
        issue_date = graphene.Date(required=True, description="Fecha de expedición del documento.")
        
        # Contact data
        phone_number = graphene.String(required=True, description="Número de Teléfono del usuario.")
        address = graphene.String(required=True, description= "Dirección de residencia.")
        city = graphene.String(required=True,  description="Ciudad donde reside el usuario.")
        country = graphene.String(required=True, description="País de residencia.")
    
    user = graphene.Field(UserType, description="El usuario creado con exito.")







###
# LOS METODOS   @staticmethod  SE UTILIZAN PARA VALIDAR LOS DATOS DE ENTRADA INDIVIDUALES COMO: 
# El email no puede estar vacio y debe tener un formato valido
# El nombre de usuario debe tener al menos 4 caracteres
# La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número
# El formato del número de teléfono no es válido
# Realizan validaciones independientes.
# No dependen de ninguna instancia de objeto ni de la clase.
### 

    @staticmethod
    def validate_email(email):
        # El email no puede estar vacio y debe tener un formato valido
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
            raise GraphQLError(f"El formato del email {email} no es válido")
        if User.objects.filter(email=email).exists():
            raise GraphQLError(f"El email {email} ya está registrado")
        return email
    
    @staticmethod
    def validate_username(username):
        if len(username) < 4:
            raise GraphQLError("El nombre de usuario debe tener al menos 4 caracteres")
        if User.objects.filter(username=username).exists():
            raise GraphQLError(f"El nombre de usuario {username} ya está registrado")
        return username
    
    @staticmethod
    def validate_password(password):
        # La contraseña debe tener al menos 8 caracteres,
        #  una letra mayúscula, una letra minúscula y un número Eje.: Password123
        if len(password) < 8:
            raise GraphQLError("La contraseña debe tener al menos 8 caracteres")
        if not re.search(r'[A-Z]', password):
            raise GraphQLError("La contraseña debe contener al menos una letra mayúscula")
        if not re.search(r'[a-z]', password):
            raise GraphQLError("La contraseña debe contener al menos una letra minúscula")
        if not re.search(r'[0-9]', password):
            raise GraphQLError("La contraseña debe contener al menos un número")
        return password
    
    @staticmethod
    def validate_document(document_type, document_number):
        if IdentityDocument.objects.filter(document_type=document_type, document_number=document_number).exists():
            raise GraphQLError(f"El documento {document_type}: {document_number} ya está registrado") # ERROR:
        return document_type, document_number
    
    @staticmethod
    def validate_phone(phone_number):
        # El teléfono no puede estar vacio y debe tener un formato valido ejem. +56912345678
        if not re.match(r'^\+?[0-9]{8,15}$', phone_number):
            raise GraphQLError(f"El formato del número de teléfono {phone_number} no es válido")
        return phone_number
    
    @classmethod
    def mutate(cls, root, info, **kwargs):
        # Validate input data
        email = cls.validate_email(kwargs.get('email'))
        username = cls.validate_username(kwargs.get('username'))
        password = cls.validate_password(kwargs.get('password'))
        document_type, document_number = cls.validate_document(
            kwargs.get('document_type'), 
            kwargs.get('document_number')
        )
        phone_number = cls.validate_phone(kwargs.get('phone_number'))
        

        # Creamos el usuario en la base de datos y usamos el try except para manejar los errores si la base de datos falla
        try:
            with transaction.atomic():
                # Create user
                user = User(
                    username=username,
                    email=email,
                    first_name=kwargs.get('first_name'),
                    last_name=kwargs.get('last_name')
                )
                user.set_password(password)
                user.save()
                
                # Create identity document
                identity_document = IdentityDocument(
                    user=user,
                    document_type=document_type,
                    document_number=document_number,
                    issue_date=kwargs.get('issue_date')
                )
                identity_document.save()
                
                # Create contact
                contact = Contact(
                    user=user,
                    phone_number=phone_number,
                    address=kwargs.get('address'),
                    city=kwargs.get('city'),
                    country=kwargs.get('country')
                )
                contact.save()
                
                return CreateUser(user=user)
                
        except Exception as e:
            raise GraphQLError(f"Error al crear el usuario: {str(e)}")


###
# LOS QUERYS SE UTILIZAN PARA OBTENER DATOS DE LA BASE DE DATOS.
###
class Query(graphene.ObjectType):
    users = graphene.List(UserType)
    user = graphene.Field(UserType, id=graphene.ID())
    
    # Resolvers para obtener los usuarios
    def resolve_users(self, info):
        return User.objects.all()
    
    # Resolver para obtener un usuario por su ID
    def resolve_user(self, info, id):
        try:
            return User.objects.get(pk=id)
        except User.DoesNotExist:
            return None

# Mutations para crear un nuevo usuario
class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()