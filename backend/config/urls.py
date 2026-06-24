from django.contrib import admin
from django.db import connection
from django.http import JsonResponse
from django.urls import include, path


def root_view(request):
    return JsonResponse(
        {
            "service": "renthub-django",
            "message": "Django container is running",
            "healthcheck": "/health/"
        }
    )


def health_view(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        cursor.fetchone()

    return JsonResponse({"status": "ok", "database": "connected"})


urlpatterns = [
    path("", root_view),
    path("health/", health_view),
    path("api/", include("api.urls")),
    path("admin/", admin.site.urls),
]
