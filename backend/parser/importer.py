"""
Dedup logic + import into Listing model.
"""
import logging
from datetime import datetime, timezone

from django.db import transaction
from django.db.models import Q

from api.models import Listing, ParserLog, ParserSource

logger = logging.getLogger(__name__)


def _find_duplicate(item: dict, dup_check: dict) -> Listing | None:
    """Return existing Listing if duplicate found, else None."""
    q = Q()

    if dup_check.get("url") and item.get("source_url"):
        q |= Q(source_url=item["source_url"])

    if dup_check.get("source_id") and item.get("source_id"):
        q |= Q(source_id=item["source_id"])

    if dup_check.get("phone") and item.get("phone"):
        q |= Q(phone=item["phone"])

    if dup_check.get("title_price") and item.get("title") and item.get("price"):
        q |= Q(title=item["title"], price_per_day=item["price"])

    if not q:
        return None

    return Listing.objects.filter(q).first()


@transaction.atomic
def import_items(source: ParserSource, items: list[dict], log: ParserLog) -> tuple[int, int, int]:
    """
    Import/update listings from parsed items.
    Returns (new_count, updated_count, error_count).
    """
    new_count = updated_count = error_count = 0
    dup_check = source.dup_check or {}
    auto_publish = source.moderation == "auto"

    for item in items:
        try:
            existing = _find_duplicate(item, dup_check)

            listing_status = Listing.Status.ACTIVE if auto_publish else Listing.Status.PENDING

            if existing:
                # Update only non-empty fields
                changed = False
                for field, model_field in [
                    ("title", "title"), ("description", "description"),
                    ("price", "price_per_day"), ("city", "city"),
                    ("address", "address"), ("phone", "phone"),
                    ("email", "email"), ("seller_name", "seller_name"),
                    ("image", "image"), ("currency", "currency"),
                    ("source_url", "source_url"), ("source_id", "source_id"),
                ]:
                    val = item.get(field)
                    if val and val != getattr(existing, model_field, None):
                        setattr(existing, model_field, val)
                        changed = True

                if item.get("images"):
                    existing.images = item["images"]
                    changed = True

                if item.get("tags"):
                    existing.tags = item["tags"]
                    changed = True

                if changed:
                    existing.save()
                    updated_count += 1
            else:
                Listing.objects.create(
                    title=item.get("title", "Untitled"),
                    description=item.get("description", ""),
                    category=item.get("category", source.category),
                    city=item.get("city", ""),
                    address=item.get("address", ""),
                    price_per_day=item.get("price", 0),
                    currency=item.get("currency", "EUR"),
                    image=item.get("image", ""),
                    images=item.get("images", []),
                    tags=item.get("tags", []),
                    phone=item.get("phone", ""),
                    email=item.get("email", ""),
                    seller_name=item.get("seller_name", ""),
                    source_url=item.get("source_url", ""),
                    source_id=item.get("source_id", ""),
                    source_name=item.get("source_name", source.name),
                    published_at=item.get("published_at"),
                    imported_at=datetime.now(tz=timezone.utc),
                    status=listing_status,
                )
                new_count += 1

        except Exception as exc:
            logger.exception("Error importing item: %s", exc)
            error_count += 1

    # Update source stats
    source.stat_total += new_count
    source.stat_new_today = new_count
    source.stat_updated = updated_count
    source.stat_errors = error_count
    source.last_run = datetime.now(tz=timezone.utc)
    source.save(update_fields=["stat_total", "stat_new_today", "stat_updated", "stat_errors", "last_run"])

    # Finalise log
    log.new_count = new_count
    log.updated_count = updated_count
    log.error_count = error_count
    log.status = ParserLog.Status.WARN if error_count else ParserLog.Status.OK
    log.message = f"Imported {new_count} new, {updated_count} updated, {error_count} errors."
    log.finished_at = datetime.now(tz=timezone.utc)
    log.save()

    return new_count, updated_count, error_count
