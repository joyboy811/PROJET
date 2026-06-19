from django.apps import AppConfig
from django.db.models.signals import post_migrate


class MpageConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mpage'
    verbose_name = 'M-PAGe Module'

    def ready(self):
        from .signals import on_post_migrate
        post_migrate.connect(on_post_migrate, sender=self)
