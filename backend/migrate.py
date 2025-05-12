"""
Script para ejecutar migraciones de Django en AWS Lambda.
"""
import os
import sys
import django

# Configurar el entorno para Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'singularity_health.serverless_settings')

def handler(event, context):
    """
    Manejador de Lambda para ejecutar migraciones de Django.
    """
    # Configurar Django
    django.setup()
    
    # Importar el módulo de migraciones después de configurar Django
    from django.core.management import execute_from_command_line
    
    # Ejecutar migraciones
    execute_from_command_line(['manage.py', 'migrate'])
    
    return {
        'statusCode': 200,
        'body': 'Migraciones completadas exitosamente'
    }

if __name__ == '__main__':
    # Si se ejecuta localmente, simplemente ejecuta las migraciones
    django.setup()
    from django.core.management import execute_from_command_line
    execute_from_command_line(['manage.py', 'migrate']) 