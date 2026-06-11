from openai import OpenAI
from dotenv import load_dotenv
import os
import json

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)


def generate_predicted_churn_reason(customer):

    prompt = f"""
You are an Amazon customer retention expert.

Analyze the customer data and predict the MOST LIKELY churn reason.

Customer Details:

Customer Tier: {customer.get("customer_tier")}
Days Since Last Order: {customer.get("days_since_last_order")}
Wishlist Count: {customer.get("wishlist_count")}
Prime Member: {customer.get("prime_member_flag")}
Favorite Brand: {customer.get("top_brand")}
Favorite Category: {customer.get("top_category")}
Total Orders: {customer.get("total_orders")}
Total Spend: {customer.get("total_spend")}
Average Order Value: {customer.get("average_order_value")}
Signup Channel: {customer.get("signup_channel")}

Customer Tags:
{customer.get("customer_tags", [])}

Google Ads Audiences:
{customer.get("google_ads_audiences", [])}

Possible Categories:

1. Price Sensitive
2. Waiting For Better Offers
3. Reduced Shopping Activity
4. Lost Interest
5. Brand Switch
6. Seasonal Buyer
7. Competitor Attraction
8. Low Engagement
9. Category Saturation

Rules:

- Use ONLY the provided customer information.
- Do NOT invent facts.
- Do NOT use placeholders.
- Do NOT mention missing data.
- Reason must be a complete sentence.
- Keep reason under 20 words.
- Do not simply repeat customer data.
- Explain the likely behavioral reason.
- Focus on why the customer may stop purchasing.

Return ONLY valid JSON.

Example:

{{
    "churn_category": "Reduced Shopping Activity",
    "churn_reason": "Previously active customer has recently reduced purchasing frequency despite strong historical engagement."
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7
    )

    result = response.choices[0].message.content.strip()

    try:
        return json.loads(result)

    except Exception:
        return {
            "churn_category": "Unknown",
            "churn_reason": result
        }


def generate_recovery_message(
    customer_name,
    churn_category,
    churn_reason,
    reward,
    channel
):

    message_type_map = {
        "Call": "Call Script",
        "WhatsApp": "WhatsApp Message",
        "Email": "Email Draft",
        "SMS": "SMS Message"
    }

    message_type = message_type_map.get(
        channel,
        "Recovery Message"
    )

    prompt = f"""
You are an Amazon customer retention specialist.

Generate a {message_type}.

Customer Name: {customer_name}

Recommended Channel: {channel}

Churn Category: {churn_category}

Churn Reason: {churn_reason}

Reward: {reward}

Instructions:

- If channel is Call:
  Generate a natural call script for a customer support agent.

- If channel is WhatsApp:
  Generate a friendly WhatsApp-style message.

- If channel is Email:
  Generate a professional email body.

- If channel is SMS:
  Generate a concise SMS message under 160 characters.

- Mention the reward naturally.
- Encourage the customer to return.
- Be warm and persuasive.
- Return ONLY the message text.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7
    )

    return {
        "message_type": message_type,
        "message": response.choices[0].message.content.strip()
    }