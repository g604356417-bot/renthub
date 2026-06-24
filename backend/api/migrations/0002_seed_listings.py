from django.db import migrations


LISTINGS = [
    {
        "id": 1,
        "title": "Tesla Model 3 Long Range",
        "category": "cars",
        "city": "Moscow",
        "price_per_day": 89,
        "status": "active",
        "image": "/images/listings/tesla-model-3.svg",
        "description": "Electric sedan with 500km range. Level 2 Autopilot, panoramic roof, premium audio.",
        "specs": [
            {"l": "Type", "v": "Electric"},
            {"l": "Seats", "v": "5"},
            {"l": "0-60", "v": "3.6s"},
            {"l": "Range", "v": "500km"},
        ],
        "tags": ["Autopilot", "Supercharging", "Climate Control"],
        "images": ["/images/listings/tesla-model-3.svg"],
        "rating": "4.9",
        "review_count": 38,
        "featured_rank": 1,
    },
    {
        "id": 2,
        "title": "BMW M4 Competition",
        "category": "cars",
        "city": "St. Petersburg",
        "price_per_day": 195,
        "status": "active",
        "image": "/images/listings/bmw-m4.svg",
        "description": "510hp sports coupe. Adaptive M suspension, carbon exterior, Harman Kardon sound.",
        "specs": [
            {"l": "Power", "v": "510 hp"},
            {"l": "Gearbox", "v": "8-spd"},
            {"l": "0-60", "v": "3.9s"},
            {"l": "Fuel", "v": "Petrol"},
        ],
        "tags": ["Sport+", "Carbon", "HK Audio"],
        "images": ["/images/listings/bmw-m4.svg"],
        "rating": "4.8",
        "review_count": 21,
        "featured_rank": None,
    },
    {
        "id": 3,
        "title": "Sun Odyssey 410 Sailing Yacht",
        "category": "boats",
        "city": "Montenegro",
        "price_per_day": 450,
        "status": "active",
        "image": "/images/listings/sailing-yacht.svg",
        "description": "Adriatic cruising yacht with 3 cabins, GPS, and fully equipped galley.",
        "specs": [
            {"l": "Length", "v": "12.5m"},
            {"l": "Cabins", "v": "3"},
            {"l": "Guests", "v": "8"},
            {"l": "Year", "v": "2021"},
        ],
        "tags": ["Captain", "Kitchen", "GPS"],
        "images": ["/images/listings/sailing-yacht.svg"],
        "rating": "4.7",
        "review_count": 14,
        "featured_rank": 2,
    },
    {
        "id": 4,
        "title": "Ducati Panigale V4S",
        "category": "motorcycles",
        "city": "Krasnodar",
        "price_per_day": 120,
        "status": "active",
        "image": "/images/listings/ducati-v4s.svg",
        "description": "214hp Italian superbike with race-grade electronics.",
        "specs": [
            {"l": "Power", "v": "214 hp"},
            {"l": "Engine", "v": "1103cc"},
            {"l": "0-60", "v": "2.8s"},
            {"l": "Type", "v": "Supersport"},
        ],
        "tags": ["Helmet", "Gloves", "Insurance"],
        "images": ["/images/listings/ducati-v4s.svg"],
        "rating": "5.0",
        "review_count": 9,
        "featured_rank": None,
    },
    {
        "id": 5,
        "title": "Sea View Apartment",
        "category": "apartments",
        "city": "Budva",
        "price_per_day": 135,
        "status": "active",
        "image": "/images/listings/sea-view-apartment.svg",
        "description": "Seafront apartment with panoramic Adriatic views. Pool, terrace, smart home.",
        "specs": [
            {"l": "Bedrooms", "v": "2"},
            {"l": "Area", "v": "85 m2"},
            {"l": "Guests", "v": "4"},
            {"l": "Floor", "v": "7th"},
        ],
        "tags": ["Pool", "Wi-Fi", "A/C", "Balcony"],
        "images": ["/images/listings/sea-view-apartment.svg"],
        "rating": "4.9",
        "review_count": 52,
        "featured_rank": 3,
    },
    {
        "id": 6,
        "title": "Mercedes G-Class AMG",
        "category": "cars",
        "city": "Dubai",
        "price_per_day": 320,
        "status": "active",
        "image": "/images/listings/g-class-amg.svg",
        "description": "AMG G63 with 585hp. Luxury meets extreme off-road capability.",
        "specs": [
            {"l": "Power", "v": "585 hp"},
            {"l": "Drive", "v": "4x4"},
            {"l": "Gearbox", "v": "9-spd"},
            {"l": "Fuel", "v": "Petrol"},
        ],
        "tags": ["AWD", "Delivery", "Navigation"],
        "images": ["/images/listings/g-class-amg.svg"],
        "rating": "4.8",
        "review_count": 27,
        "featured_rank": None,
    },
    {
        "id": 7,
        "title": "Trek Fuel EX Mountain Bike",
        "category": "bicycles",
        "city": "Sochi",
        "price_per_day": 22,
        "status": "active",
        "image": "/images/listings/mountain-bike.svg",
        "description": "Full-suspension MTB. Fox suspension, Shimano hydraulics.",
        "specs": [
            {"l": "Type", "v": "MTB"},
            {"l": "Wheels", "v": "29\""},
            {"l": "Gears", "v": "12-spd"},
            {"l": "Brakes", "v": "Hydraulic"},
        ],
        "tags": ["Helmet", "Gloves", "Pump"],
        "images": ["/images/listings/mountain-bike.svg"],
        "rating": "4.6",
        "review_count": 18,
        "featured_rank": None,
    },
    {
        "id": 8,
        "title": "Boston Dynamics Spot Robot",
        "category": "robots",
        "city": "Moscow",
        "price_per_day": 290,
        "status": "active",
        "image": "/images/listings/spot-robot.svg",
        "description": "Quadruped robot for inspection, security, and events.",
        "specs": [
            {"l": "Type", "v": "Quadruped"},
            {"l": "Battery", "v": "90 min"},
            {"l": "Purpose", "v": "Business"},
            {"l": "Payload", "v": "14 kg"},
        ],
        "tags": ["Programmable", "SDK Access", "Operator Available"],
        "images": ["/images/listings/spot-robot.svg"],
        "rating": "4.8",
        "review_count": 7,
        "featured_rank": None,
    },
]


def seed_listings(apps, schema_editor):
    Listing = apps.get_model("api", "Listing")
    for item in LISTINGS:
        Listing.objects.update_or_create(id=item["id"], defaults=item)


def unseed_listings(apps, schema_editor):
    Listing = apps.get_model("api", "Listing")
    Listing.objects.filter(id__in=[item["id"] for item in LISTINGS]).delete()


class Migration(migrations.Migration):
    dependencies = [("api", "0001_initial")]

    operations = [migrations.RunPython(seed_listings, unseed_listings)]
