#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
This module loads the WSGI application specified by FQN in `.serverless-wsgi` and invokes
the request when the handler is called by AWS Lambda.

Author: Logan Raarup <logan@logan.dk>
"""
import importlib
import io
import json
import os
import sys
import traceback

# Call decompression helper from `serverless-python-requirements` if
# available. See: https://github.com/UnitedIncome/serverless-python-requirements#dealing-with-lambdas-size-limitations
try:
    import unzip_requirements  # noqa
except ImportError:
    pass

import serverless_wsgi

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'singularity_health.serverless_settings')

# Import the WSGI application
from singularity_health.wsgi import application


def load_config():
    """Read the configuration file created during deployment"""
    root = os.path.abspath(os.path.dirname(__file__))
    with open(os.path.join(root, ".serverless-wsgi"), "r") as f:
        return json.loads(f.read())


def import_app(config):
    """Load the application WSGI handler"""
    wsgi_fqn = config["app"].rsplit(".", 1)
    wsgi_fqn_parts = wsgi_fqn[0].rsplit("/", 1)

    if len(wsgi_fqn_parts) == 2:
        root = os.path.abspath(os.path.dirname(__file__))
        sys.path.insert(0, os.path.join(root, wsgi_fqn_parts[0]))

    try:
        wsgi_module = importlib.import_module(wsgi_fqn_parts[-1])

        return getattr(wsgi_module, wsgi_fqn[1])
    except:  # noqa
        traceback.print_exc()
        raise Exception("Unable to import {}".format(config["app"]))


def append_text_mime_types(config):
    """Append additional text (non-base64) mime types from configuration file"""
    if "text_mime_types" in config and isinstance(config["text_mime_types"], list):
        serverless_wsgi.TEXT_MIME_TYPES.extend(config["text_mime_types"])


def handler(event, context):
    """
    Handler function for AWS Lambda.
    """
    # Procesar el evento antes de pasarlo a serverless_wsgi
    if 'path' in event and event['path'].startswith('/$default/'):
        # Eliminar el prefijo $default si está presente
        event['path'] = event['path'].replace('/$default/', '/', 1)
    
    # Asegurar que las solicitudes a /admin/ no utilicen la ruta prefijada
    if 'headers' in event:
        if event.get('path', '').startswith('/admin'):
            # Configurar HTTP_HOST para que las redirecciones funcionen correctamente
            event['headers']['Host'] = os.environ.get('BASE_URL', 'https://1afs3bt7ti.execute-api.us-east-1.amazonaws.com').replace('https://', '')
    
    # Logging para depuración (opcional)
    print(f"Processing request: {event.get('path', 'unknown path')}")
    
    return serverless_wsgi.handle_request(application, event, context)


def _create_app():
    return application


# Read configuration and import the WSGI application
config = load_config()
application = import_app(config)
append_text_mime_types(config)
