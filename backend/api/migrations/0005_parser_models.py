from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_switch_to_downloaded_images'),
    ]

    operations = [
        # Add parser fields to Listing
        migrations.AddField(
            model_name='listing',
            name='source_url',
            field=models.URLField(blank=True, db_index=True, max_length=2048),
        ),
        migrations.AddField(
            model_name='listing',
            name='source_id',
            field=models.CharField(blank=True, db_index=True, max_length=255),
        ),
        migrations.AddField(
            model_name='listing',
            name='source_name',
            field=models.CharField(blank=True, max_length=128),
        ),
        migrations.AddField(
            model_name='listing',
            name='address',
            field=models.CharField(blank=True, max_length=512),
        ),
        migrations.AddField(
            model_name='listing',
            name='phone',
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name='listing',
            name='email',
            field=models.EmailField(blank=True),
        ),
        migrations.AddField(
            model_name='listing',
            name='seller_name',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='listing',
            name='currency',
            field=models.CharField(default='USD', max_length=8),
        ),
        migrations.AddField(
            model_name='listing',
            name='published_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='listing',
            name='imported_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        # Fix city to allow blank
        migrations.AlterField(
            model_name='listing',
            name='city',
            field=models.CharField(blank=True, max_length=128),
        ),
        # Fix price to allow 0
        migrations.AlterField(
            model_name='listing',
            name='price_per_day',
            field=models.PositiveIntegerField(default=0),
        ),
        # ParserSource model
        migrations.CreateModel(
            name='ParserSource',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=128)),
                ('url', models.URLField(max_length=2048)),
                ('category', models.CharField(default='cars', max_length=64)),
                ('method', models.CharField(choices=[('rss', 'RSS'), ('xml', 'XML Feed'), ('json_api', 'JSON API'), ('html', 'HTML Scraper')], default='rss', max_length=16)),
                ('status', models.CharField(choices=[('active', 'Active'), ('disabled', 'Disabled')], default='active', max_length=16)),
                ('moderation', models.CharField(choices=[('auto', 'Auto-publish'), ('review', 'Send to review')], default='auto', max_length=16)),
                ('interval', models.CharField(default='1h', max_length=16)),
                ('custom_cron', models.CharField(blank=True, max_length=64)),
                ('field_map', models.JSONField(blank=True, default=dict)),
                ('dup_check', models.JSONField(blank=True, default=dict)),
                ('stat_total', models.PositiveIntegerField(default=0)),
                ('stat_new_today', models.PositiveIntegerField(default=0)),
                ('stat_updated', models.PositiveIntegerField(default=0)),
                ('stat_errors', models.PositiveIntegerField(default=0)),
                ('last_run', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={'ordering': ['name']},
        ),
        # ParserLog model
        migrations.CreateModel(
            name='ParserLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(default='run', max_length=32)),
                ('status', models.CharField(choices=[('ok', 'OK'), ('warn', 'Warning'), ('error', 'Error'), ('running', 'Running')], default='running', max_length=16)),
                ('message', models.TextField(blank=True)),
                ('new_count', models.PositiveIntegerField(default=0)),
                ('updated_count', models.PositiveIntegerField(default=0)),
                ('error_count', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('finished_at', models.DateTimeField(blank=True, null=True)),
                ('source', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='logs', to='api.parsersource')),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
