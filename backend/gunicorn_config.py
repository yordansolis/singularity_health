"""Gunicorn config file"""

# Django WSGI application path in pattern MODULE_NAME:VARIABLE_NAME
wsgi_app = "singularity_health.wsgi:application"

# The number of worker processes for handling requests
workers = 3

# The socket to bind
bind = "0.0.0.0:8000"

# Write access and error info to logs in home directory
accesslog = "/home/yordansolis2/gunicorn-access.log"
errorlog = "/home/yordansolis2/gunicorn-error.log"

# Redirect stdout/stderr to log file
capture_output = True

# PID file so you can easily kill the process
pidfile = "/home/yordansolis2/gunicorn.pid"

# Daemonize the Gunicorn process (detach & enter background)
daemon = False 