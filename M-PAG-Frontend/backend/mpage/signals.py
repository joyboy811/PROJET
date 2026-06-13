"""
Signals for automatic initialization of M-PAGe legacy data.
"""
import os
import sqlite3
from pathlib import Path
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.conf import settings

def init_legacy_data():
    """Initialize legacy data if the SQL script exists"""
    # Path to the database
    db_path = Path(settings.BASE_DIR) / 'db.sqlite3'
    sql_script_path = Path(settings.BASE_DIR) / 'init_legacy_data.sql'

    if not sql_script_path.exists():
        print("SQL script init_legacy_data.sql not found - legacy data not initialized")
        return

    if not db_path.exists():
        print("Database not found - skipping legacy data initialization")
        return

    try:
        # Connect to the database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Read and execute the SQL script
        with open(SQL_SCRIPT_PATH, 'r', encoding='utf-8') as f:
            sql_script = f.read()

        # Execute the script
        cursor.executescript(sql_script)
        conn.commit()

        print(f"M-PAGe legacy data initialized successfully from {sql_script_path.name}")

    except Exception as e:
        print(f"Error initializing legacy data: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

def ensure_default_roles():
    from django.contrib.auth.models import Group

    roles = [
        'administrateur',
        'responsable_risques',
        'responsable_org',
        'auditeur',
        'decideur',
        'observateur',
    ]
    for role in roles:
        Group.objects.get_or_create(name=role)


def ensure_default_admin():
    from .models_admin import SystemAdmin
    
    username = 'admin'
    password = 'Admin1234'
    email = 'admin@example.com'

    try:
        system_admin = SystemAdmin.objects.get(username=username)
        system_admin.set_password(password)
        system_admin.save()
        print('System administrator account updated: admin / Admin1234')
    except SystemAdmin.DoesNotExist:
        system_admin = SystemAdmin.objects.create(
            username=username,
            email=email,
            first_name='Admin',
            last_name='System',
            is_active=True,
        )
        system_admin.set_password(password)
        system_admin.save()
        print('System administrator account created: admin / Admin1234')


@receiver(post_migrate)
def init_legacy_data_on_startup(sender, **kwargs):
    """
    Signal handler that executes after migrations.
    Initializes M-PAGe legacy data if the SQL script exists.
    """
    # Only executes for the mpage app
    if sender.name == 'mpage':
        init_legacy_data()
        ensure_default_roles()
        ensure_default_admin()