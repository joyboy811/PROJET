from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mpage', '0006_add_user_plain_password'),
    ]

    operations = [
        migrations.RunSQL(
            sql=(
                "ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS plain_password varchar(128);"
                "\n"
                "-- copy existing values from user_plain_password if present\n"
                "UPDATE auth_user SET plain_password = upp.password FROM user_plain_password upp WHERE auth_user.id = upp.user_id;"
            ),
            reverse_sql=(
                "ALTER TABLE auth_user DROP COLUMN IF EXISTS plain_password;"
            )
        ),
    ]
