from django.urls import path
from .views import (
    categories_view, listing_detail_view, listings_view,
    ParserSourceListView, ParserSourceDetailView,
    parser_run_view, parser_check_view, parser_run_all_view, parser_log_view,
)

urlpatterns = [
    # Listings
    path("listings/", listings_view),
    path("listings/<int:listing_id>/", listing_detail_view),
    path("categories/", categories_view),
    # Parser
    path("parser/sources/", ParserSourceListView.as_view()),
    path("parser/sources/<int:pk>/", ParserSourceDetailView.as_view()),
    path("parser/sources/<int:pk>/run/", parser_run_view),
    path("parser/sources/<int:pk>/check/", parser_check_view),
    path("parser/run-all/", parser_run_all_view),
    path("parser/logs/", parser_log_view),
]
