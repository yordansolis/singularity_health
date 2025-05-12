from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse, JsonResponse
import datetime
import os

def healthcheck_view(request):
    """
    Endpoint de healthcheck para monitoreo y verificación de CI/CD
    """
    try:
        # Intentar obtener información de la versión desde una variable de entorno
        version = os.environ.get('APP_VERSION', 'dev')
        
        # Crear respuesta con información útil para monitoreo
        response_data = {
            'status': 'ok',
            'version': version,
            'timestamp': datetime.datetime.now().isoformat(),
            'environment': os.environ.get('DJANGO_SETTINGS_MODULE', '').split('.')[-1],
            'region': os.environ.get('AWS_REGION', 'local')
        }
        
        return JsonResponse(response_data)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('graphql/', csrf_exempt(GraphQLView.as_view(graphiql=True))),
    path('healthcheck/', healthcheck_view, name='healthcheck'),
    path('', lambda request: HttpResponse('¡Aplicación Django funcionando correctamente!')),
]

# Añadir esta configuración para servir archivos estáticos en modo de desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
