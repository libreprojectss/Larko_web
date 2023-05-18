# Generated by Django 4.1.6 on 2023-05-14 18:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('waitlistapp', '0003_alter_validationtoken_waitlist'),
    ]

    operations = [
        migrations.AlterField(
            model_name='waitlist',
            name='resource',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='resource', to='waitlistapp.resources'),
        ),
    ]