import json
import logging

from django.http import Http404, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from .models import Listing, ParserLog, ParserSource

logger = logging.getLogger(__name__)


# ── helpers ───────────────────────────────────────────────────────────────────

def json_body(request) -> dict:
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return {}


def serialize_listing(l):
    return {
        "id": l.id, "t": l.title, "cat": l.category, "city": l.city,
        "p": l.price_per_day, "status": l.status, "img": l.image,
        "desc": l.description, "specs": l.specs, "tags": l.tags,
        "imgs": l.images, "r": float(l.rating), "rc": l.review_count,
        "featuredRank": l.featured_rank,
        "sourceUrl": l.source_url, "sourceName": l.source_name,
        "phone": l.phone, "email": l.email, "sellerName": l.seller_name,
        "currency": l.currency, "address": l.address,
        "importedAt": l.imported_at.isoformat() if l.imported_at else None,
    }


def serialize_source(s):
    return {
        "id": s.id, "name": s.name, "url": s.url, "category": s.category,
        "method": s.method, "status": s.status, "moderation": s.moderation,
        "interval": s.interval, "customCron": s.custom_cron,
        "fieldMap": s.field_map, "dupCheck": s.dup_check,
        "stats": {
            "total": s.stat_total, "newToday": s.stat_new_today,
            "updated": s.stat_updated, "errors": s.stat_errors,
            "lastRun": s.last_run.isoformat() if s.last_run else None,
        },
    }


def serialize_log(lg):
    return {
        "id": lg.id, "source": lg.source.name, "sourceId": lg.source_id,
        "action": lg.action, "status": lg.status, "message": lg.message,
        "newCount": lg.new_count, "updatedCount": lg.updated_count,
        "errorCount": lg.error_count,
        "ts": lg.created_at.isoformat(),
        "finishedAt": lg.finished_at.isoformat() if lg.finished_at else None,
    }


# ── Listings ──────────────────────────────────────────────────────────────────

def listings_view(request):
    qs = Listing.objects.all().order_by("id")
    if s := request.GET.get("status"):
        qs = qs.filter(status=s)
    if c := request.GET.get("category"):
        qs = qs.filter(category=c)
    if request.GET.get("featured") == "1":
        qs = qs.exclude(featured_rank__isnull=True).order_by("featured_rank", "id")
    return JsonResponse({"results": [serialize_listing(l) for l in qs]})


def listing_detail_view(request, listing_id):
    try:
        return JsonResponse(serialize_listing(Listing.objects.get(pk=listing_id)))
    except Listing.DoesNotExist:
        raise Http404


def categories_view(request):
    cats = list(Listing.objects.values_list("category", flat=True).distinct().order_by("category"))
    return JsonResponse({"results": cats})


# ── Parser Sources ────────────────────────────────────────────────────────────

@method_decorator(csrf_exempt, name="dispatch")
class ParserSourceListView(View):
    def get(self, request):
        return JsonResponse({"results": [serialize_source(s) for s in ParserSource.objects.all()]})

    def post(self, request):
        data = json_body(request)
        src = ParserSource.objects.create(
            name=data.get("name", ""),
            url=data.get("url", ""),
            category=data.get("category", "cars"),
            method=data.get("method", "rss"),
            status=data.get("status", "active"),
            moderation=data.get("moderation", "auto"),
            interval=data.get("interval", "1h"),
            custom_cron=data.get("customCron", ""),
            field_map=data.get("fieldMap", {}),
            dup_check=data.get("dupCheck", {}),
        )
        return JsonResponse(serialize_source(src), status=201)


@method_decorator(csrf_exempt, name="dispatch")
class ParserSourceDetailView(View):
    def _get(self, pk):
        try:
            return ParserSource.objects.get(pk=pk)
        except ParserSource.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        return JsonResponse(serialize_source(self._get(pk)))

    def patch(self, request, pk):
        src = self._get(pk)
        data = json_body(request)
        for attr, model_attr in [
            ("name","name"),("url","url"),("category","category"),
            ("method","method"),("status","status"),("moderation","moderation"),
            ("interval","interval"),("customCron","custom_cron"),
            ("fieldMap","field_map"),("dupCheck","dup_check"),
        ]:
            if attr in data:
                setattr(src, model_attr, data[attr])
        src.save()
        return JsonResponse(serialize_source(src))

    def delete(self, request, pk):
        self._get(pk).delete()
        return JsonResponse({"deleted": True})


# ── Parser Actions ────────────────────────────────────────────────────────────

@csrf_exempt
def parser_run_view(request, pk):
    """POST /api/parser/sources/<pk>/run/ — enqueue parse task."""
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    try:
        source = ParserSource.objects.get(pk=pk)
    except ParserSource.DoesNotExist:
        raise Http404

    try:
        from parser.tasks import run_source
        task = run_source.delay(source.id)
        return JsonResponse({"queued": True, "taskId": task.id, "source": source.name})
    except Exception as exc:
        # Fallback: run synchronously if Celery not available
        logger.warning("Celery unavailable, running sync: %s", exc)
        from parser.engine import fetch_source
        from parser.importer import import_items
        from datetime import datetime, timezone
        log = ParserLog.objects.create(source=source, action="run", status=ParserLog.Status.RUNNING)
        try:
            items = fetch_source(source)
            n, u, e = import_items(source, items, log)
            return JsonResponse({"sync": True, "new": n, "updated": u, "errors": e})
        except Exception as exc2:
            log.status = ParserLog.Status.ERROR
            log.message = str(exc2)
            log.finished_at = datetime.now(tz=timezone.utc)
            log.save()
            return JsonResponse({"error": str(exc2)}, status=500)


@csrf_exempt
def parser_check_view(request, pk):
    """POST /api/parser/sources/<pk>/check/"""
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    try:
        source = ParserSource.objects.get(pk=pk)
    except ParserSource.DoesNotExist:
        raise Http404

    try:
        from parser.tasks import check_source
        task = check_source.delay(source.id)
        return JsonResponse({"queued": True, "taskId": task.id})
    except Exception:
        # sync fallback
        import requests as req_lib
        try:
            r = req_lib.get(source.url, timeout=10)
            r.raise_for_status()
            return JsonResponse({"ok": True, "status": r.status_code})
        except Exception as exc:
            return JsonResponse({"ok": False, "error": str(exc)}, status=502)


@csrf_exempt
def parser_run_all_view(request):
    """POST /api/parser/run-all/"""
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    sources = ParserSource.objects.filter(status="active")
    queued = []
    for src in sources:
        try:
            from parser.tasks import run_source
            run_source.delay(src.id)
            queued.append(src.name)
        except Exception:
            pass
    return JsonResponse({"queued": queued})


def parser_log_view(request):
    """GET /api/parser/logs/"""
    limit = int(request.GET.get("limit", 100))
    source_id = request.GET.get("source")
    qs = ParserLog.objects.select_related("source").order_by("-created_at")
    if source_id:
        qs = qs.filter(source_id=source_id)
    return JsonResponse({"results": [serialize_log(lg) for lg in qs[:limit]]})
