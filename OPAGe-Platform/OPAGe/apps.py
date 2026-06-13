from django.apps import AppConfig
from django.db.models.signals import post_migrate


class OpageConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'OPAGe'

    def ready(self):
        from .signals import init_opage_data_on_startup
        post_migrate.connect(init_opage_data_on_startup, sender=self)
