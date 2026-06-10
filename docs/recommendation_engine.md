# Personalized Product Recommendation Engine

## Goal

Show products in personalized order based on customer profile.

## Features Used

* top_category
* top_brand
* preferred_price_range
* top_cart_category
* customer_tier
* prime_member_flag
* purchase_frequency_90d
* wishlist_count

## User Profile

Example:

Garden
KitchenAid
Budget
Gold Customer
Prime Member

## Product Structure

Each product contains:

* product_id
* product_name
* category
* brand
* price_range
* tags

## Recommendation Scoring

Category Match = 40

Brand Match = 30

Price Match = 15

Cart Category Match = 10

Prime Bonus = 5

Total = 100

## Ranking

Products are sorted according to final score.

Higher score = Higher recommendation.

## Future AI Upgrade

V1 - Rule Based Recommendation

V2 - Embedding Based Recommendation

V3 - Gemini Explainable Recommendation

V4 - XGBoost Ranking Model
