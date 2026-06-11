from backend.app.database import (
    customers_collection,
    customer_recovery_profiles_collection
)

from backend.app.recovery_service import (
    calculate_recovery_score,
    get_risk_level,
    get_best_channel,
    generate_reward
)

from backend.app.ai_service import (
    generate_predicted_churn_reason,
    generate_recovery_message
)

customers = list(
    customers_collection.find()
)

# Uncomment only if you want a fresh rebuild
customer_recovery_profiles_collection.delete_many({})

for customer in customers:

    existing = customer_recovery_profiles_collection.find_one(
        {
            "customer_id": customer["customer_id"]
        }
    )

    if existing:
        print(
            f"Skipping {customer['customer_id']}"
        )
        continue

    recovery_score = calculate_recovery_score(
        customer
    )

    risk_level = get_risk_level(
        recovery_score
    )

    channel_data = get_best_channel(
        customer
    )

    recommended_channel = channel_data["channel"]

    channel_reason = channel_data["reason"]

    reward = generate_reward(
        customer
    )

    churn_data = generate_predicted_churn_reason(
        customer
    )

    message_data = generate_recovery_message(
        customer_name=customer["full_name"],
        churn_category=churn_data["churn_category"],
        churn_reason=churn_data["churn_reason"],
        reward=reward,
        channel=recommended_channel
    )

    profile = {

        "customer_id": customer["customer_id"],

        "full_name": customer["full_name"],

        "recovery_score": recovery_score,

        "risk_level": risk_level,

        "recommended_channel": recommended_channel,

        "channel_reason": channel_reason,

        "reward": reward,

        "churn_category":
            churn_data["churn_category"],

        "churn_reason":
            churn_data["churn_reason"],

        "message_type":
            message_data["message_type"],

        "recovery_message":
            message_data["message"]
    }

    customer_recovery_profiles_collection.insert_one(
        profile
    )

    print(
        f"Generated {customer['customer_id']}"
    )

print(
    "Recovery profile generation completed"
)