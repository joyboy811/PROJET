from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mpage', '0005_add_system_admin_model'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserPlainPassword',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(blank=True, max_length=128)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=models.deletion.CASCADE, related_name='plain_password', to='auth.user')),
            ],
            options={
                'db_table': 'user_plain_password',
                'verbose_name': 'User plain password',
                'verbose_name_plural': 'User plain passwords',
            },
        ),
    ]
