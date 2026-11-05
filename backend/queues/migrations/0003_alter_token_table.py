from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('queues', '0002_alter_queue_table'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='token',
            table='Patients',
        ),
    ]

