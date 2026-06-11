from app.database import (
    customer_tags_collection,
    ad_audience_profiles_collection
)

from app.audience_service import get_google_ads_audiences


customers = list(customer_tags_collection.find())

for customer in customers:

    audiences = get_google_ads_audiences(
        customer["tags"]
    )

    profile = {
        "customer_id": customer["customer_id"],
        "full_name": customer["full_name"],
        "customer_tags": customer["tags"],
        "google_ads_audiences": audiences
    }

    ad_audience_profiles_collection.insert_one(
        profile
    )

print(f"{len(customers)} audience profiles generated")