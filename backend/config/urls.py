from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def root_view(request):
    return JsonResponse({
        "service": "renthub-django",
        "status": "ok"
    })


def health_view(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("", root_view),
    path("health/", health_view),
    path("api/", include("api.urls")),
    path("admin/", admin.site.urls),
]
