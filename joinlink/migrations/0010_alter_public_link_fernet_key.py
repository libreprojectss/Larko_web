# Generated by Django 4.1.6 on 2023-05-19 14:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('joinlink', '0009_alter_public_link_fernet_key'),
    ]

    operations = [
        migrations.AlterField(
            model_name='public_link',
            name='fernet_key',
            field=models.BinaryField(default=b'kknh4tPUH33mGcfEs3YtPWvIFKS6zzzmxH3-UorSrMA='),
        ),
    ]