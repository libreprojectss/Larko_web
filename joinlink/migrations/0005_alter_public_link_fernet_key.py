# Generated by Django 4.1.6 on 2023-05-05 04:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('joinlink', '0004_alter_public_link_fernet_key_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='public_link',
            name='fernet_key',
            field=models.BinaryField(default=b'deOG-sU2ObS-okJZ90Zp1IMKuUIZwLiWRpDsjpOi74w='),
        ),
    ]
