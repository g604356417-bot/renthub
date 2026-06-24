from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Listing",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("category", models.CharField(max_length=64)),
                ("city", models.CharField(max_length=128)),
                ("price_per_day", models.PositiveIntegerField()),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("active", "Active"),
                            ("pending", "Pending"),
                            ("rejected", "Rejected"),
                        ],
                        default="active",
                        max_length=32,
                    ),
                ),
                ("image", models.URLField(blank=True)),
                ("description", models.TextField(blank=True)),
                ("specs", models.JSONField(blank=True, default=list)),
                ("tags", models.JSONField(blank=True, default=list)),
                ("images", models.JSONField(blank=True, default=list)),
                ("rating", models.DecimalField(decimal_places=1, default=0, max_digits=3)),
                ("review_count", models.PositiveIntegerField(default=0)),
                ("featured_rank", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["id"]},
        ),
    ]
