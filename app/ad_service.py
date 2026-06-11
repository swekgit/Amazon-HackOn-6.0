from app.database import products_collection


def get_ads_for_customer(tags, audiences):

    ads = []

    # ==========================================
    # BRAND LOVER ADS
    # ==========================================

    for tag in tags:

        if tag.endswith("_lover"):

            brand = tag.replace("_lover", "").title()

            products = list(
                products_collection.find(
                    {"brand": brand}
                ).limit(3)
            )

            for product in products:

                ads.append({
                    "product_id": product["product_id"],
                    "product_name": product["product_name"],
                    "brand": product["brand"],
                    "reason": f"Customer likes {brand}"
                })

    # ==========================================
    # HIGH INTENT BUYER
    # ==========================================

    if "high_intent_buyer" in tags:

        products = list(
            products_collection.find()
            .sort("purchase_count", -1)
            .limit(3)
        )

        for product in products:

            ads.append({
                "product_id": product["product_id"],
                "product_name": product["product_name"],
                "brand": product["brand"],
                "reason": "Popular product for high-intent buyers"
            })

    # ==========================================
    # GOLD CUSTOMER
    # ==========================================

    if "gold_customer" in tags:

        products = list(
            products_collection.find(
                {"rating": {"$gte": 4}}
            ).limit(3)
        )

        for product in products:

            ads.append({
                "product_id": product["product_id"],
                "product_name": product["product_name"],
                "brand": product["brand"],
                "reason": "Premium recommendation for gold customers"
            })

    # ==========================================
    # INACTIVE CUSTOMER
    # ==========================================

    if "inactive_customer" in tags:

        products = list(
            products_collection.find()
            .sort("discount_percentage", -1)
            .limit(3)
        )

        for product in products:

            ads.append({
                "product_id": product["product_id"],
                "product_name": product["product_name"],
                "brand": product["brand"],
                "reason": "Win-back offer for inactive customers"
            })

    # ==========================================
    # GOOGLE ADS AUDIENCE TARGETING ENRICHMENT
    # ==========================================

    # Technology Enthusiasts
    if "Technology Enthusiasts" in audiences:

        products = list(
            products_collection.find(
                {"category": "Electronics"}
            ).limit(3)
        )

        for product in products:

            ads.append({
                "product_id": product["product_id"],
                "product_name": product["product_name"],
                "brand": product["brand"],
                "target_audience": "Technology Enthusiasts",
                "reason": "Google Ads Audience Match"
            })

    # Sports & Fitness Fans
    if "Sports & Fitness Fans" in audiences:

        products = list(
            products_collection.find(
                {"category": "Sports"}
            ).limit(3)
        )

        for product in products:

            ads.append({
                "product_id": product["product_id"],
                "product_name": product["product_name"],
                "brand": product["brand"],
                "target_audience": "Sports & Fitness Fans",
                "reason": "Google Ads Audience Match"
            })

    # Fashion Enthusiasts
    if "Fashion Enthusiasts" in audiences:

        products = list(
            products_collection.find(
                {"category": "Fashion"}
            ).limit(3)
        )

        for product in products:

            ads.append({
                "product_id": product["product_id"],
                "product_name": product["product_name"],
                "brand": product["brand"],
                "target_audience": "Fashion Enthusiasts",
                "reason": "Google Ads Audience Match"
            })

    # Frequent Shoppers
    if "Frequent Shoppers" in audiences:

        products = list(
            products_collection.find()
            .sort("purchase_count", -1)
            .limit(3)
        )

        for product in products:

            ads.append({
                "product_id": product["product_id"],
                "product_name": product["product_name"],
                "brand": product["brand"],
                "target_audience": "Frequent Shoppers",
                "reason": "Top products for frequent shoppers"
            })

    # High Value Customers
    if "High Value Customers" in audiences:

        products = list(
            products_collection.find(
                {"rating": {"$gte": 4.5}}
            ).limit(3)
        )

        for product in products:

            ads.append({
                "product_id": product["product_id"],
                "product_name": product["product_name"],
                "brand": product["brand"],
                "target_audience": "High Value Customers",
                "reason": "Premium products for high value customers"
            })

    # In-Market Buyers
    if "In-Market Buyers" in audiences:

        products = list(
            products_collection.find()
            .sort("purchase_count", -1)
            .limit(3)
        )

        for product in products:

            ads.append({
                "product_id": product["product_id"],
                "product_name": product["product_name"],
                "brand": product["brand"],
                "target_audience": "In-Market Buyers",
                "reason": "High demand products for buyers"
            })

    # Re-engagement Audience
    if "Re-engagement Audience" in audiences:

        products = list(
            products_collection.find()
            .sort("discount_percentage", -1)
            .limit(3)
        )

        for product in products:

            ads.append({
                "product_id": product["product_id"],
                "product_name": product["product_name"],
                "brand": product["brand"],
                "target_audience": "Re-engagement Audience",
                "reason": "Special offer for re-engagement"
            })

    # ==========================================
    # REMOVE DUPLICATES
    # ==========================================

    unique_ads = []
    seen_products = set()

    for ad in ads:

        product_id = ad["product_id"]

        if product_id not in seen_products:

            unique_ads.append(ad)
            seen_products.add(product_id)

    return unique_ads

    # return ads