from fastapi import APIRouter
from app.database import (
    customer_recovery_profiles_collection
)

router = APIRouter()


@router.get("/recovery-profiles")
def get_recovery_profiles():

    profiles = list(
        customer_recovery_profiles_collection.find(
            {},
            {"_id": 0}
        )
    )

    return profiles


@router.get("/recovery-profiles/{customer_id}")
def get_customer_recovery_profile(
    customer_id: str
):

    profile = (
        customer_recovery_profiles_collection.find_one(
            {
                "customer_id": customer_id
            },
            {
                "_id": 0
            }
        )
    )

    if profile:
        return profile

    return {
        "message": "Customer not found"
    }


@router.get("/dashboard-summary")
def get_dashboard_summary():

    total_customers = (
        customer_recovery_profiles_collection.count_documents({})
    )

    easy_to_recover = (
        customer_recovery_profiles_collection.count_documents(
            {
                "risk_level": "Easy To Recover"
            }
        )
    )

    medium_risk = (
        customer_recovery_profiles_collection.count_documents(
            {
                "risk_level": "Medium Risk"
            }
        )
    )

    high_risk = (
        customer_recovery_profiles_collection.count_documents(
            {
                "risk_level": "High Churn Risk"
            }
        )
    )

    return {
        "total_customers": total_customers,
        "easy_to_recover": easy_to_recover,
        "medium_risk": medium_risk,
        "high_risk": high_risk
    }