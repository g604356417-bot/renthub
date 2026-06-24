from django.db import models


class Listing(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        PENDING = "pending", "Pending"
        REJECTED = "rejected", "Rejected"

    title = models.CharField(max_length=255)
    category = models.CharField(max_length=64)
    city = models.CharField(max_length=128, blank=True)
    price_per_day = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.ACTIVE)
    image = models.URLField(blank=True, max_length=2048)
    description = models.TextField(blank=True)
    specs = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    images = models.JSONField(default=list, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    review_count = models.PositiveIntegerField(default=0)
    featured_rank = models.PositiveSmallIntegerField(null=True, blank=True)
    # Parser fields
    source_url = models.URLField(blank=True, max_length=2048, db_index=True)
    source_id = models.CharField(max_length=255, blank=True, db_index=True)
    source_name = models.CharField(max_length=128, blank=True)
    address = models.CharField(max_length=512, blank=True)
    phone = models.CharField(max_length=64, blank=True)
    email = models.EmailField(blank=True)
    seller_name = models.CharField(max_length=255, blank=True)
    currency = models.CharField(max_length=8, default="USD")
    published_at = models.DateTimeField(null=True, blank=True)
    imported_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.title


class ParserSource(models.Model):
    class Method(models.TextChoices):
        RSS = "rss", "RSS"
        XML = "xml", "XML Feed"
        JSON_API = "json_api", "JSON API"
        HTML = "html", "HTML Scraper"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        DISABLED = "disabled", "Disabled"

    class Moderation(models.TextChoices):
        AUTO = "auto", "Auto-publish"
        REVIEW = "review", "Send to review"

    name = models.CharField(max_length=128)
    url = models.URLField(max_length=2048)
    category = models.CharField(max_length=64, default="cars")
    method = models.CharField(max_length=16, choices=Method.choices, default=Method.RSS)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    moderation = models.CharField(max_length=16, choices=Moderation.choices, default=Moderation.AUTO)
    interval = models.CharField(max_length=16, default="1h")
    custom_cron = models.CharField(max_length=64, blank=True)
    field_map = models.JSONField(default=dict, blank=True)
    dup_check = models.JSONField(default=dict, blank=True)
    # Stats
    stat_total = models.PositiveIntegerField(default=0)
    stat_new_today = models.PositiveIntegerField(default=0)
    stat_updated = models.PositiveIntegerField(default=0)
    stat_errors = models.PositiveIntegerField(default=0)
    last_run = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class ParserLog(models.Model):
    class Status(models.TextChoices):
        OK = "ok", "OK"
        WARN = "warn", "Warning"
        ERROR = "error", "Error"
        RUNNING = "running", "Running"

    source = models.ForeignKey(ParserSource, on_delete=models.CASCADE, related_name="logs")
    action = models.CharField(max_length=32, default="run")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.RUNNING)
    message = models.TextField(blank=True)
    new_count = models.PositiveIntegerField(default=0)
    updated_count = models.PositiveIntegerField(default=0)
    error_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.source.name} [{self.status}] {self.created_at:%Y-%m-%d %H:%M}"
