from django.db.models.signals import post_migrate
from django.dispatch import receiver


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
def on_post_migrate(sender, **kwargs):
    if sender.name == 'mpage':
        ensure_default_roles()
        ensure_default_admin()
