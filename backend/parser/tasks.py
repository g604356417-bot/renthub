"""
Celery tasks for the parser.
"""
import logging
from datetime import datetime, timezone

from celery import shared_task
from celery.utils.log import get_task_logger

from api.models import ParserLog, ParserSource

from .engine import fetch_source
from .importer import import_items

logger = get_task_logger(__name__)


@shared_task(bind=True, max_retries=2, default_retry_delay=30)
def run_source(self, source_id: int) -> dict:
    """Fetch and import a single source. Called manually or by beat scheduler."""
    try:
        source = ParserSource.objects.get(pk=source_id)
    except ParserSource.DoesNotExist:
        return {"error": f"Source {source_id} not found"}

    if source.status != "active":
        return {"skipped": True, "reason": "source disabled"}

    # Create running log entry
    log = ParserLog.objects.create(source=source, action="run", status=ParserLog.Status.RUNNING, message="Parser started…")

    try:
        items = fetch_source(source)
        new_c, upd_c, err_c = import_items(source, items, log)
        logger.info("Source %s: +%d new, ~%d updated, %d errors", source.name, new_c, upd_c, err_c)
        return {"source": source.name, "new": new_c, "updated": upd_c, "errors": err_c}

    except Exception as exc:
        log.status = ParserLog.Status.ERROR
        log.message = f"Fatal error: {exc}"
        log.finished_at = datetime.now(tz=timezone.utc)
        log.save()
        logger.exception("Parser fatal error for source %s: %s", source.name, exc)
        raise self.retry(exc=exc)


@shared_task
def run_all_sources() -> dict:
    """Run all active sources. Triggered by Celery Beat."""
    sources = ParserSource.objects.filter(status="active")
    for src in sources:
        run_source.delay(src.id)
    return {"queued": [s.name for s in sources]}


@shared_task(bind=True)
def check_source(self, source_id: int) -> dict:
    """Verify a source is reachable and feed is valid."""
    import requests

    try:
        source = ParserSource.objects.get(pk=source_id)
    except ParserSource.DoesNotExist:
        return {"error": "not found"}

    log = ParserLog.objects.create(source=source, action="check", status=ParserLog.Status.RUNNING, message="Checking reachability…")

    try:
        r = requests.get(source.url, timeout=10, headers={"User-Agent": "RentHubBot/1.0"})
        r.raise_for_status()
        items = fetch_source(source)
        msg = f"Source reachable. Feed valid — {len(items)} items found."
        log.status = ParserLog.Status.OK
    except Exception as exc:
        msg = f"Check failed: {exc}"
        log.status = ParserLog.Status.ERROR

    log.message = msg
    log.finished_at = datetime.now(tz=timezone.utc)
    log.save()
    return {"status": log.status, "message": msg}
