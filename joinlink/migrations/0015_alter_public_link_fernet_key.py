# Generated by Django 4.1.6 on 2023-05-21 14:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('joinlink', '0014_alter_public_link_fernet_key'),
    ]

    operations = [
        migrations.AlterField(
            model_name='public_link',
            name='fernet_key',
            field=models.BinaryField(default=b'4BUl4Poh3zSws_7fo0xrsujlJ7s6IP2UUuCheq-_fS4='),
        ),
    ]