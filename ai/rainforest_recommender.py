from rainforest_client import search_products
from query_understanding import understand_query
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import json

print("Loading Model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

# =====================
# USER INPUT
# =====================

query = input("Search Query: ").lower()

# =====================
# LOAD CUSTOMER TAGS
# =====================

with open("datasets/customer_tags.json", "r", encoding="utf-8") as f:
    tag_data = json.load(f)

customer_tags = tag_data["tags"]

print("\nCustomer Tags Loaded:")
print(customer_tags)

# =====================
# FETCH PRODUCTS
# =====================

print("\nFetching Products...")

parsed = understand_query(
    query,
    customer_tags
)

search_term = parsed["product_type"]
if not search_term:
    search_term = query

parsed_query = understand_query(
    query,
    customer_tags
)

print("\nAI Query Understanding:")
print(parsed_query)

search_term = parsed_query["product_type"]

print(
    f"\nSearching Amazon for: {search_term}"
)

data = search_products(
    search_term
)

products = data["search_results"]

print(f"Found {len(products)} products")

# =====================
# USER PROFILE
# =====================

user_profile = f"""
Query: {query}

Tags:
{' '.join(customer_tags)}
"""

user_embedding = model.encode(user_profile)

# =====================
# RANK PRODUCTS
# =====================

results = []

for product in products:

    title = str(product.get("title", ""))
    asin = product.get("asin", "")

    query_words = query.split()

    relevant = True

    for word in query_words:
        if word not in title.lower():
            relevant = False
            break

    if not relevant:
        continue

    product_embedding = model.encode(title)

    embedding_score = cosine_similarity(
        [user_embedding],
        [product_embedding]
    )[0][0]

    score = embedding_score * 100

    matched_words = 0

    for word in query_words:
        if word in title.lower():
            matched_words += 1

    score += matched_words * 100

    reasons = []

    if matched_words > 0:
        reasons.append("Matches search query")

    for tag in customer_tags:

        if tag.lower() in title.lower():

            score += 30

            reasons.append(
                f"Matches tag: {tag}"
            )

    results.append({
        "title": title,
        "asin": asin,
        "score": float(score),
        "reasons": reasons
    })

# =====================
# SORT RESULTS
# =====================

results.sort(
    key=lambda x: x["score"],
    reverse=True
)
from gemini_explainer import explain_product
for item in results[:3]:

    item["ai_explanation"] = explain_product(
        item["title"],
        customer_tags,
        query
    )
# =====================
# OUTPUT
# =====================

print("\n")
print("=" * 70)
print(f"ALL MATCHING PRODUCTS FOR '{query}'")
print("=" * 70)

for rank, item in enumerate(results, start=1):

    print(f"\n{rank}. {item['title']}")
    print(f"Score: {item['score']:.2f}")

    for reason in item["reasons"]:
        print(f"✓ {reason}")

print("\nTotal Matching Products:", len(results))

# =====================
# SAVE RESULTS
# =====================

with open(
    "datasets/rainforest_results.json",
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        results,
        f,
        indent=4
    )

print("\nResults saved successfully.")