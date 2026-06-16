"""Add project_id to Risk, KeyPillar, RMM for multi-project isolation."""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('OPAGe', '0004_remove_indicator_normalized_value_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='risk',
            name='project_id',
            field=models.IntegerField(blank=True, null=True, help_text='Project ID for multi-project isolation'),
        ),
        migrations.AddField(
            model_name='keypillar',
            name='project_id',
            field=models.IntegerField(blank=True, null=True, help_text='Project ID for multi-project isolation'),
        ),
        migrations.AddField(
            model_name='rmm',
            name='project_id',
            field=models.IntegerField(blank=True, null=True, help_text='Project ID for multi-project isolation'),
        ),
    ]
