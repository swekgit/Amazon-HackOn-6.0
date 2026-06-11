def calculate_recovery_score(customer):

    score = 100

    # inactivity penalty
    score -= min(
        customer.get("days_since_last_order", 0) // 3,
        50
    )

    # wishlist interest
    if customer.get("wishlist_count", 0) >= 10:
        score += 15

    # prime member
    if customer.get("prime_member_flag"):
        score += 10

    # premium customer
    if customer.get("customer_tier", "").lower() == "gold":
        score += 10

    return max(0, min(score, 100))


def get_risk_level(score):

    if score >= 80:
        return "Easy To Recover"

    if score >= 50:
        return "Medium Risk"

    return "High Churn Risk"


def get_best_channel(customer):

    if customer.get("customer_tier", "").lower() == "gold":
        return {
            "channel": "Call",
            "reason": "Gold customers are high-value users and benefit from personalized outreach."
        }

    if customer.get("wishlist_count", 0) >= 10:
        return {
            "channel": "WhatsApp",
            "reason": "High wishlist activity indicates strong purchase intent and engagement."
        }

    if customer.get("prime_member_flag"):
        return {
            "channel": "Email",
            "reason": "Prime members are more likely to engage through digital communication."
        }

    return {
        "channel": "SMS",
        "reason": "SMS is a quick and cost-effective channel for re-engagement."
    }


def generate_reward(customer):

    if customer.get("customer_tier", "").lower() == "gold":
        return "500 Reward Points"

    return "200 Reward Points"