"""
Multi-project architecture migration.
Adds Project, UserProfile models and project FK on all data models.
"""
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('mpage', '0007_add_plain_password_to_auth_user'),
    ]

    operations = [
        # 1. Create Project model
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'mpage_project',
                'ordering': ['name'],
            },
        ),
        # 2. Create UserProfile model
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
                ('project', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='members', to='mpage.project')),
            ],
            options={
                'db_table': 'mpage_userprofile',
            },
        ),
        # 3. Add project FK to KeyPillar
        migrations.AddField(
            model_name='keypillar',
            name='project',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='keypillars', to='mpage.project'),
        ),
        # 4. Remove unique on code, replace with unique_together
        migrations.AlterField(
            model_name='keypillar',
            name='code',
            field=models.CharField(max_length=50),
        ),
        migrations.AlterUniqueTogether(
            name='keypillar',
            unique_together={('project', 'code')},
        ),
        # 5. Add project FK to RiskMitigationMechanism
        migrations.AddField(
            model_name='riskmitigationmechanism',
            name='project',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='rmms', to='mpage.project'),
        ),
        # 6. Add project FK to Campaign
        migrations.AddField(
            model_name='campaign',
            name='project',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='campaigns', to='mpage.project'),
        ),
        # 7. Add project FK to IPageIndicator + remove unique, add unique_together
        migrations.AddField(
            model_name='ipageindicator',
            name='project',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='ipage_indicators', to='mpage.project'),
        ),
        migrations.AlterField(
            model_name='ipageindicator',
            name='name',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='ipageindicator',
            name='code',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterUniqueTogether(
            name='ipageindicator',
            unique_together={('project', 'code')},
        ),
        # 8. Add project FK to IPageMechanism
        migrations.AddField(
            model_name='ipagemechanism',
            name='project',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='ipage_mechanisms', to='mpage.project'),
        ),
        # 9. Add project FK to IPageScenario
        migrations.AddField(
            model_name='ipagescenario',
            name='project',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='ipage_scenarios', to='mpage.project'),
        ),
        # 10. Add project FK to IPageSimulation
        migrations.AddField(
            model_name='ipagesimulation',
            name='project',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='ipage_simulations', to='mpage.project'),
        ),
    ]
