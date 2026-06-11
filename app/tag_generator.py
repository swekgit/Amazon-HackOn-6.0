def generate_tags(customer):

    tags = []

    # Prime
    if customer.get("prime_member_flag"):
        tags.append("prime_user")
    else:
        tags.append("non_prime_user")

    # Brand
    brand = customer.get("top_brand")
    if brand:
        tags.append(f"{brand.lower()}_lover")

    # Tier
    tier = customer.get("customer_tier")
    if tier:
        tags.append(f"{tier.lower()}_customer")

    # Lost Customer
    if customer.get("days_since_last_order", 0) > 90:
        tags.append("inactive_customer")

    # Wishlist
    if customer.get("wishlist_count", 0) >= 10:
        tags.append("high_intent_buyer")

    return tags