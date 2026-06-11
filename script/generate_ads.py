from app.database import (
    ad_audience_profiles_collection,
    ad_recommendations_collection
)

from app.ad_service import get_ads_for_customer


customers = list(ad_audience_profiles_collection.find())

# Purane recommendations delete
ad_recommendations_collection.delete_many({})

for customer in customers:

    ads = get_ads_for_customer(
        customer["customer_tags"],
        customer["google_ads_audiences"]
    )

    recommendation_doc = {
        "customer_id": customer["customer_id"],
        "full_name": customer["full_name"],
        "customer_tags": customer["customer_tags"],
        "google_ads_audiences": customer["google_ads_audiences"],
        "recommended_ads": ads
    }

    ad_recommendations_collection.insert_one(
        recommendation_doc
    )

print(f"{len(customers)} recommendations generated successfully")