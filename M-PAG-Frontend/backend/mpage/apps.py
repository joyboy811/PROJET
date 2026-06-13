from django.apps import AppConfig
from django.db.models.signals import post_migrate

class MpageConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mpage'
    verbose_name = 'M-PAGe Module'

    def ready(self):
        # Import and connect the legacy data initialization signal
        from .signals import init_legacy_data_on_startup
        post_migrate.connect(init_legacy_data_on_startup, sender=self)
