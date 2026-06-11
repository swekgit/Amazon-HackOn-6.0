# Amazon ReConnect - Project Context

## Project Overview

Amazon ReConnect is an AI-powered customer win-back engine built for Amazon HackOn.

The goal is to identify inactive customers, understand why they may have churned, and create personalized recovery strategies to bring them back.

---

# Tech Stack

## Frontend
- React

## Backend
- FastAPI

## Database
- MongoDB Atlas

## AI
- Groq API
- Llama 3.3 70B Versatile

## Python Libraries
- PyMongo
- OpenAI SDK (configured with Groq endpoint)
- python-dotenv

---

# Current Project Structure

app/

- main.py
- database.py
- ai_service.py
- recovery_service.py
- audience_service.py
- ad_service.py

routes/

- ads.py

script/

- import_customers.py
- import_products.py
- generate_and_upload_tags.py
- generate_audiences.py
- generate_ads.py
- generate_recovery_profiles.py

dataset/

- customers.json
- amazon_products_2000.json

---

# MongoDB Collections

## customers

Stores customer information.

Important fields:

- customer_id
- full_name
- customer_tier
- prime_member_flag
- wishlist_count
- total_orders
- total_spend
- average_order_value
- top_brand
- top_category
- days_since_last_order
- signup_channel

---

## customer_tags

Stores generated customer tags.

Examples:

- high_intent_buyer
- gold_customer
- inactive_customer
- brand_lover

---

## ad_audience_profiles

Maps customers to Google Ads style audiences.

Examples:

- Frequent Shoppers
- High Value Customers
- In-Market Buyers
- Re-engagement Audience
- Technology Enthusiasts

---

## ad_recommendations

Stores product recommendations.

Contains:

- customer_id
- customer_tags
- google_ads_audiences
- recommended_ads

---

## customer_recovery_profiles

Stores recovery intelligence for inactive customers.

Contains:

- customer_id
- full_name
- recovery_score
- risk_level
- recommended_channel
- reward
- churn_category
- churn_reason

---

# Completed Features

## 1. Customer Tagging Engine

Generated behavioral tags from customer data.

Output stored in:

customer_tags

---

## 2. Audience Mapping Engine

Mapped customers into Google Ads style audiences.

Output stored in:

ad_audience_profiles

---

## 3. Ad Recommendation Engine

Generated product recommendations using:

- customer tags
- audience profiles

Output stored in:

ad_recommendations

---

## 4. Recovery Score Engine

Implemented deterministic scoring logic.

Factors:

- inactivity
- wishlist activity
- prime membership
- customer tier

Output:

0-100 score

---

## 5. Risk Classification

Rules:

Score >= 80

Easy To Recover

Score >= 50

Medium Risk

Otherwise

High Churn Risk

---

## 6. Channel Recommendation

Rules:

Gold Customer
→ Call

High Wishlist Activity
→ WhatsApp

Prime Member
→ Email

Others
→ SMS

---

## 7. Reward Recommendation

Rules:

Gold Customer
→ 500 Reward Points

Others
→ 200 Reward Points

---

## 8. AI Churn Prediction

Implemented using:

Groq + Llama 3.3 70B

AI receives:

- customer tier
- inactivity
- wishlist activity
- top brand
- top category
- spend
- order history
- signup channel

AI returns:

{
  "churn_category": "...",
  "churn_reason": "..."
}

Example:

{
  "churn_category": "Reduced Shopping Activity",
  "churn_reason": "Customer has not ordered in 42 days despite frequent past purchases."
}

Stored in:

customer_recovery_profiles

---

# Important Design Decisions

## AI Usage Philosophy

We do NOT want AI to do everything.

Deterministic Logic Handles:

- recovery score
- risk level
- channel selection
- rewards

AI Handles:

- churn reason prediction
- personalized messaging
- customer communication

This keeps the system practical and explainable.

---

## Dataset Policy

Do not heavily modify the dataset.

Use existing customer and product data as much as possible.

This is a hackathon prototype, not a production system.

---

# Current Status

Completed:

✅ Customer Tagging

✅ Audience Mapping

✅ Ad Recommendation Engine

✅ Recovery Score

✅ Risk Level

✅ Channel Recommendation

✅ Reward Recommendation

✅ AI Churn Category

✅ AI Churn Reason

---

# Next Planned Feature

## AI Personalized Recovery Message Generator

Input:

- Customer Name
- Churn Category
- Churn Reason
- Reward
- Recommended Channel

AI Output:

Example:

Hi Lisa,

We've missed you.

As one of our valued customers, we have added 500 Reward Points to your account.

Explore your favorite products and enjoy exclusive offers waiting for you.

We look forward to seeing you again.

Output will be stored in:

customer_recovery_profiles

Field:

recovery_message

---

# Instructions For Future Chats

1. Continue from the current project state.
2. Do not redesign the architecture.
3. Do not repeat completed features.
4. Prefer practical hackathon-friendly implementations.
5. Use FastAPI + MongoDB + Groq.
6. Give complete code when requested.
7. Clearly specify which file needs modification.
8. Preserve existing project structure.



Read the PROJECT_CONTEXT below and continue from the current project state.