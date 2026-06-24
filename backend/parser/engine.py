"""
Real parser engine.
Supports: RSS/Atom, XML feeds, JSON API, HTML (BeautifulSoup).
"""
import hashlib
import logging
import re
from datetime import datetime, timezone
from urllib.parse import urljoin

import feedparser
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

TIMEOUT = 15
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; RentHubBot/1.0; +https://renthub.app)",
    "Accept": "text/html,application/xhtml+xml,application/xml,application/json;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,ru;q=0.8",
}


# ─── helpers ─────────────────────────────────────────────────────────────────

def _get(url: str) -> requests.Response:
    r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    r.raise_for_status()
    return r


def _map(item: dict, field_map: dict, key: str, default="") -> str:
    """Resolve mapped field from item dict."""
    src_key = field_map.get(key, key)
    if not src_key:
        return default
    # support dot notation: "media.price"
    parts = src_key.split(".")
    val = item
    for p in parts:
        if isinstance(val, dict):
            val = val.get(p, "")
        else:
            val = ""
            break
    return str(val).strip() if val else default


def _price(raw: str) -> int:
    """Extract integer price from raw string like '$1,200/mo' → 1200."""
    digits = re.sub(r"[^\d]", "", raw)
    return int(digits) if digits else 0


def _img_list(raw) -> list[str]:
    """Normalise images field to list of URL strings."""
    if not raw:
        return []
    if isinstance(raw, list):
        return [str(x) for x in raw if x]
    if isinstance(raw, str):
        return [raw] if raw.startswith("http") else []
    return []


def _slug(source_url: str, title: str, price: int) -> str:
    """Fallback dedup key when no source_url or source_id."""
    base = f"{title.lower().strip()}:{price}"
    return hashlib.md5(base.encode()).hexdigest()[:16]


# ─── parsers ─────────────────────────────────────────────────────────────────

def parse_rss(source) -> list[dict]:
    """Parse RSS/Atom feed via feedparser."""
    fm = source.field_map or {}
    feed = feedparser.parse(source.url)
    if feed.bozo and not feed.entries:
        raise ValueError(f"feedparser: {feed.bozo_exception}")

    items = []
    for e in feed.entries:
        # Build a flat dict from feedparser entry
        raw: dict = {
            "title": e.get("title", ""),
            "description": e.get("summary", "") or e.get("description", ""),
            "link": e.get("link", ""),
            "pubDate": e.get("published", "") or e.get("updated", ""),
            "author": e.get("author", ""),
            "id": e.get("id", "") or e.get("link", ""),
            "price": "",
            "currency": "EUR",
            "city": "",
            "phone": "",
            "email": "",
            "address": "",
            "enclosure": "",
            "images": [],
        }
        # tags / categories
        raw["tags"] = [t.term for t in e.get("tags", [])]

        # enclosures (images in RSS)
        if e.get("enclosures"):
            raw["enclosure"] = e.enclosures[0].get("url", "")
            raw["images"] = [enc.get("url", "") for enc in e.enclosures if enc.get("type", "").startswith("image")]

        # media:content
        for m in e.get("media_content", []):
            if m.get("type", "").startswith("image") or m.get("url", "").endswith((".jpg", ".png", ".webp")):
                raw["images"].append(m["url"])

        # yandex/custom price field
        for ns_key in list(vars(e).keys()):
            if "price" in ns_key.lower():
                raw["price"] = str(getattr(e, ns_key, ""))
            if "city" in ns_key.lower() or "region" in ns_key.lower():
                raw["city"] = str(getattr(e, ns_key, ""))
            if "phone" in ns_key.lower():
                raw["phone"] = str(getattr(e, ns_key, ""))

        items.append(_normalise(raw, fm, source))

    return items


def parse_json(source) -> list[dict]:
    """Parse JSON API endpoint."""
    fm = source.field_map or {}
    r = _get(source.url)
    data = r.json()

    # support both list and {results: [...]} / {data: [...]} / {items: [...]}
    if isinstance(data, list):
        entries = data
    elif isinstance(data, dict):
        for key in ("results", "data", "items", "listings", "ads", "offers"):
            if key in data and isinstance(data[key], list):
                entries = data[key]
                break
        else:
            entries = [data]
    else:
        raise ValueError("Unexpected JSON structure")

    return [_normalise(e, fm, source) for e in entries]


def parse_xml(source) -> list[dict]:
    """Parse generic XML feed."""
    fm = source.field_map or {}
    r = _get(source.url)
    soup = BeautifulSoup(r.content, "lxml-xml")

    # Try common item tags
    items = soup.find_all("offer") or soup.find_all("item") or soup.find_all("ad") or soup.find_all("listing")
    result = []
    for item in items:
        raw = {}
        for child in item.children:
            if hasattr(child, "name") and child.name:
                raw[child.name] = child.get_text(strip=True)
        # images
        raw["images"] = [img.get_text(strip=True) for img in item.find_all(["image", "photo", "picture", "img"]) if img.get_text(strip=True).startswith("http")]
        result.append(_normalise(raw, fm, source))
    return result


def parse_html(source) -> list[dict]:
    """HTML scraper — extracts structured data (JSON-LD, microdata, og: tags)."""
    fm = source.field_map or {}
    r = _get(source.url)
    soup = BeautifulSoup(r.content, "lxml")
    items = []

    # 1. JSON-LD
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            import json
            data = json.loads(script.string or "")
            if isinstance(data, list):
                items.extend(data)
            elif isinstance(data, dict):
                items.append(data)
        except Exception:
            pass

    # 2. og: meta fallback — single item
    if not items:
        og: dict = {}
        for m in soup.find_all("meta"):
            prop = m.get("property", "") or m.get("name", "")
            content = m.get("content", "")
            if prop.startswith("og:") and content:
                og[prop[3:]] = content
        if og.get("title"):
            items.append({
                "title": og.get("title", ""),
                "description": og.get("description", ""),
                "image": og.get("image", ""),
                "url": og.get("url", source.url),
                "price": og.get("price:amount", ""),
                "currency": og.get("price:currency", "EUR"),
            })

    return [_normalise(item, fm, source) for item in items if item]


# ─── normaliser ──────────────────────────────────────────────────────────────

def _normalise(raw: dict, fm: dict, source) -> dict:
    """Convert any raw dict → standard listing dict using field_map."""
    def f(key, default=""):
        return _map(raw, fm, key, default) or raw.get(key, default) or default

    title = f("title")
    price_raw = f("price")
    price = _price(price_raw)
    source_url = f("sourceUrl") or f("link") or f("url") or ""
    source_id = f("source_id") or f("id") or ""

    # images
    photos_field = fm.get("photos", "images")
    imgs_raw = raw.get(photos_field) or raw.get("images") or raw.get("enclosure") or ""
    imgs = _img_list(imgs_raw)
    single_img = f("image") or f("img") or f("enclosure") or (imgs[0] if imgs else "")

    # date
    pub_date_raw = f("pubDate") or f("date") or f("published_at") or ""
    pub_date = None
    for fmt in ("%a, %d %b %Y %H:%M:%S %z", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            pub_date = datetime.strptime(pub_date_raw[:25], fmt).replace(tzinfo=timezone.utc)
            break
        except (ValueError, TypeError):
            pass

    return {
        "title": title,
        "description": f("description") or f("desc"),
        "price": price,
        "currency": f("currency") or "EUR",
        "city": f("city") or f("location") or f("region") or "",
        "address": f("address") or "",
        "phone": f("phone") or f("contact_phone") or "",
        "email": f("email") or "",
        "seller_name": f("seller") or f("author") or f("agent_name") or "",
        "image": single_img,
        "images": imgs,
        "category": source.category,
        "source_url": source_url,
        "source_id": source_id,
        "source_name": source.name,
        "published_at": pub_date,
        "tags": raw.get("tags") or [],
        "_dedup_key": source_url or source_id or _slug(source_url, title, price),
    }


# ─── entry point ─────────────────────────────────────────────────────────────

def fetch_source(source) -> list[dict]:
    """Dispatch to the right parser based on source.method."""
    method = source.method
    if method == "rss":
        return parse_rss(source)
    elif method == "json_api":
        return parse_json(source)
    elif method == "xml":
        return parse_xml(source)
    elif method == "html":
        return parse_html(source)
    else:
        raise ValueError(f"Unknown method: {method}")
