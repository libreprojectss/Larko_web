# Generated by Django 4.1.6 on 2023-05-16 07:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('joinlink', '0007_alter_public_link_fernet_key'),
    ]

    operations = [
        migrations.AlterField(
            model_name='public_link',
            name='fernet_key',
            field=models.BinaryField(default=b'25aS8tFwOGW-8mSYuzuAS9S6FUFLcFJv6v3xUZdiTHY='),
        ),
    ]