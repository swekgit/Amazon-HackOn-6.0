import re

def normalize(text):
    text = text.lower()
    text = text.replace("-", "")
    text = text.replace("_", "")
    text = re.sub(r"[^a-z0-9 ]", "", text)
    return text
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import json
import pickle

print("Loading Model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

# ==========================
# LOAD CUSTOMER
# ==========================

with open("datasets/customer_data.json", "r", encoding="utf-8") as f:
    customer_data = json.load(f)

customer = customer_data["customers"][0]

# ==========================
# SEARCH QUERY
# ==========================

query = normalize(
    input("Enter Search Query: ")
)
print(f"Searching for: {query}")
# ==========================
# USER PROFILE
# ==========================

user_profile = f"""
Search Query: {query}

Top Category: {customer['top_category']}
Top Brand: {customer['top_brand']}
Price Preference: {customer['preferred_price_range']}
Cart Category: {customer['top_cart_category']}
Customer Tier: {customer['customer_tier']}
Prime Member: {customer['prime_member_flag']}
"""

# ==========================
# USER EMBEDDING
# ==========================

user_embedding = model.encode(user_profile)

# ==========================
# LOAD PRODUCTS
# ==========================

with open("datasets/product_data.json", "r", encoding="utf-8") as f:
    products = json.load(f)

# ==========================
# LOAD PRECOMPUTED EMBEDDINGS
# ==========================

with open("datasets/product_embeddings.pkl", "rb") as f:
    product_embeddings = pickle.load(f)

print("Embeddings Loaded Successfully")

# ==========================
# EMBEDDING SCORES
# ==========================

embedding_scores = cosine_similarity(
    [user_embedding],
    product_embeddings
)[0]

# ==========================
# HYBRID RANKING
# ==========================

results = []

for i in range(len(products)):

    product = products[i]

    product_name = normalize(
        str(product["product_name"])
    )

    category = normalize(
        str(product["category"])
    )

    subcategory = normalize(
        str(product["subcategory"])
    )

    brand = normalize(
        str(product["brand"])
    )

    searchable_text = (
        product_name + " " +
        category + " " +
        subcategory + " " +
        brand
    )

    # STRICT QUERY FILTER

    if query not in searchable_text:
        continue

    embedding_score = float(
        embedding_scores[i]
    )

    personalization_score = 0

    if customer["top_category"].lower() == category:
        personalization_score += 0.10

    if customer["top_brand"].lower() == brand:
        personalization_score += 0.10

    final_score = (
        embedding_score +
        personalization_score
    )

    results.append({
        "product_id": product["product_id"],
        "product_name": product["product_name"],
        "brand": product["brand"],
        "category": product["category"],
        "score": final_score
    })

# ==========================
# TOP 10
# ==========================

print("\n")
print("=" * 60)
print(f"TOP 10 RESULTS FOR '{query}'")
print("=" * 60)

for rank, item in enumerate(results[:10], start=1):

    print(
        f"{rank}. "
        f"{item['product_name']} | "
        f"{item['brand']} | "
        f"{item['category']} | "
        f"Score: {item['score']:.2f}"
    )

# ==========================
# SAVE RESULTS
# ==========================

with open(
    "datasets/recommendations.json",
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        results[:10],
        f,
        indent=4
    )

print("\nRecommendations saved.")