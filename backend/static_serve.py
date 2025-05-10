#!/usr/bin/env python3
"""
Script para servir archivos estáticos para el panel de administración de Django.
"""
import http.server
import socketserver
import os

PORT = 8001
DIRECTORY = "staticfiles"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print(f"Sirviendo archivos estáticos desde {DIRECTORY} en el puerto {PORT}")
    print(f"Accede a http://localhost:{PORT}/admin/ para ver los archivos estáticos")
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("Presiona Ctrl+C para detener el servidor")
        httpd.serve_forever() 