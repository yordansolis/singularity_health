"""
Singularity Health Django application.
"""

import pymysql

# Configure PyMySQL to be used instead of MySQLdb
pymysql.install_as_MySQLdb()
