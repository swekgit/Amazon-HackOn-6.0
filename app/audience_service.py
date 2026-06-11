AUDIENCE_MAP = {
    "prime_user": "Frequent Shoppers",
    "high_intent_buyer": "In-Market Buyers",
    "inactive_customer": "Re-engagement Audience",

    "gold_customer": "High Value Customers",
    "silver_customer": "Regular Customers",
    "bronze_customer": "Budget Customers",

    "apple_lover": "Technology Enthusiasts",
    "samsung_lover": "Technology Enthusiasts",
    "oneplus_lover": "Technology Enthusiasts",
    "sony_lover": "Technology Enthusiasts",

    "nike_lover": "Sports & Fitness Fans",
    "adidas_lover": "Sports & Fitness Fans",
    "puma_lover": "Sports & Fitness Fans",

    "zara_lover": "Fashion Enthusiasts",
    "hm_lover": "Fashion Enthusiasts"
}


def get_google_ads_audiences(tags):

    audiences = set()

    for tag in tags:
        if tag in AUDIENCE_MAP:
            audiences.add(AUDIENCE_MAP[tag])

    return list(audiences)