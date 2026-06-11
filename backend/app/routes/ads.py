from fastapi import APIRouter
from backend.app.database import ad_recommendations_collection

router = APIRouter()

@router.get("/ads/{customer_id}")
def get_customer_ads(customer_id: str):

    recommendation = ad_recommendations_collection.find_one(
        {"customer_id": customer_id},
        {"_id": 0}
    )

    if recommendation:
        return recommendation

    return {"message": "Customer not found"}