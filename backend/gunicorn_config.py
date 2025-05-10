"""Gunicorn config file"""

# Django WSGI application path in pattern MODULE_NAME:VARIABLE_NAME
wsgi_app = "singularity_health.wsgi:application"

# The number of worker processes for handling requests
workers = 3

# The socket to bind
bind = "0.0.0.0:8000"

# Write access and error info to /var/log
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"

# Redirect stdout/stderr to log file
capture_output = True

# PID file so you can easily kill the process
pidfile = "/var/run/gunicorn/gunicorn.pid"

# Daemonize the Gunicorn process (detach & enter background)
daemon = False 