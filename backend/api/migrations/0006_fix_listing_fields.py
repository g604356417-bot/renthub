from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_parser_models'),
    ]

    operations = [
        migrations.AlterField(
            model_name='listing',
            name='city',
            field=models.CharField(blank=True, max_length=128),
        ),
        migrations.AlterField(
            model_name='listing',
            name='price_per_day',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
