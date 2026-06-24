from django.contrib import admin
from .models import Listing, ParserSource, ParserLog


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "city", "price_per_day", "status", "source_name", "imported_at")
    list_filter = ("category", "status", "source_name")
    search_fields = ("title", "city", "description", "phone", "source_url")


@admin.register(ParserSource)
class ParserSourceAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "method", "status", "moderation", "interval", "stat_total", "last_run")
    list_filter = ("status", "method", "category", "moderation")
    search_fields = ("name", "url")


@admin.register(ParserLog)
class ParserLogAdmin(admin.ModelAdmin):
    list_display = ("source", "action", "status", "new_count", "updated_count", "error_count", "created_at")
    list_filter = ("status", "action")
    readonly_fields = ("created_at", "finished_at")
