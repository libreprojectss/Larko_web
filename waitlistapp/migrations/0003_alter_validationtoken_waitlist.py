# Generated by Django 4.1.6 on 2023-05-13 08:52

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('waitlistapp', '0002_waitlist_validated_validationtoken'),
    ]

    operations = [
        migrations.AlterField(
            model_name='validationtoken',
            name='waitlist',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='waitlist', to='waitlistapp.waitlist'),
        ),
    ]
