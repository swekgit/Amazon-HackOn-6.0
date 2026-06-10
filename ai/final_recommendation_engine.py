from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer('all-MiniLM-L6-v2')

customer = {
    "top_category": "Garden",
    "top_brand": "KitchenAid",
    "preferred_price_range": "budget",
    "top_cart_category": "Beauty"
}

user_profile = f"""
{customer['top_category']}
{customer['top_brand']}
{customer['preferred_price_range']}
{customer['top_cart_category']}
"""

products = [
    {
        "name": "KitchenAid Garden Tool Set",
        "description": "Garden KitchenAid Budget"
    },
    {
        "name": "Beauty Essentials Kit",
        "description": "Beauty Budget"
    },
    {
        "name": "Premium Garden Sprayer",
        "description": "Garden Premium"
    },
    {
        "name": "KitchenAid Mixer",
        "description": "KitchenAid Budget"
    }
]

user_embedding = model.encode(user_profile)

for product in products:
    product["embedding"] = model.encode(
        product["description"]
    )

scores = []

for product in products:

    similarity = cosine_similarity(
        [user_embedding],
        [product["embedding"]]
    )[0][0]

    scores.append({
        "name": product["name"],
        "score": similarity
    })

scores.sort(
    key=lambda x: x["score"],
    reverse=True
)

print("\nTOP RECOMMENDATIONS\n")

for item in scores:
    print(
        item["name"],
        round(item["score"], 4)
    )