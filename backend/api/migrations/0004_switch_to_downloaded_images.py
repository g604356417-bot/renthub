from django.db import migrations


IMAGE_MAP = {
    1: {
        "image": "/images/listings/tesla-model-3.jpg",
        "images": ["/images/listings/tesla-model-3.jpg", "/images/listings/tesla-model-3-2.jpg"],
    },
    2: {
        "image": "/images/listings/bmw-m4.jpg",
        "images": ["/images/listings/bmw-m4.jpg"],
    },
    3: {
        "image": "/images/listings/sailing-yacht.jpg",
        "images": ["/images/listings/sailing-yacht.jpg"],
    },
    4: {
        "image": "/images/listings/ducati-v4s.svg",
        "images": ["/images/listings/ducati-v4s.svg"],
    },
    5: {
        "image": "/images/listings/sea-view-apartment.jpg",
        "images": ["/images/listings/sea-view-apartment.jpg"],
    },
    6: {
        "image": "/images/listings/g-class-amg.jpg",
        "images": ["/images/listings/g-class-amg.jpg"],
    },
    7: {
        "image": "/images/listings/mountain-bike.jpg",
        "images": ["/images/listings/mountain-bike.jpg"],
    },
    8: {
        "image": "/images/listings/spot-robot.jpg",
        "images": ["/images/listings/spot-robot.jpg"],
    },
}


def switch_to_downloaded_images(apps, schema_editor):
    Listing = apps.get_model("api", "Listing")

    for listing_id, payload in IMAGE_MAP.items():
        Listing.objects.filter(id=listing_id).update(
            image=payload["image"],
            images=payload["images"],
        )


class Migration(migrations.Migration):
    dependencies = [("api", "0003_localize_listing_images")]

    operations = [migrations.RunPython(switch_to_downloaded_images, migrations.RunPython.noop)]
