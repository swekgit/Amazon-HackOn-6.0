from rainforest_client import search_products
from comparison_engine import compare_products
from query_understanding import understand_query
from product_intelligence import analyze_product
from category_validator import category_match

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

import json
import os

# =====================
# PATHS
# =====================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

CUSTOMER_TAGS_FILE = os.path.join(
    BASE_DIR,
    "datasets",
    "customer_tags.json"
)

RESULTS_FILE = os.path.join(
    BASE_DIR,
    "datasets",
    "rainforest_results.json"
)

# =====================
# LOAD MODEL
# =====================

print("Loading Model...")
model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

# =====================
# USER INPUT
# =====================

query = input(
    "Search Query: "
).strip().lower()

# =====================
# LOAD CUSTOMER TAGS
# =====================

try:

    with open(
        CUSTOMER_TAGS_FILE,
        "r",
        encoding="utf-8"
    ) as f:

        tag_data = json.load(f)

    customer_tags = tag_data.get(
        "tags",
        []
    )

except Exception as e:

    print(
        f"\nError loading customer tags: {e}"
    )

    customer_tags = []

print("\nCustomer Tags Loaded:")
print(customer_tags)

# =====================
# QUERY UNDERSTANDING
# =====================

print("\nUnderstanding Query...")

try:

    parsed_query = understand_query(
        query,
        customer_tags
    )

except Exception as e:

    print(
        f"\nGemini Error: {e}"
    )

    parsed_query = {
        "product_type": query,
        "category": ""
    }

print("\nAI Query Understanding:")
print(parsed_query)

search_term = parsed_query.get(
    "product_type",
    query
)

if not search_term:
    search_term = query

# =====================
# AMAZON SEARCH
# =====================

print(
    f"\nSearching Amazon for: {search_term}"
)

try:

    data = search_products(
        search_term
    )

    products = data.get(
        "search_results",
        []
    )

except Exception as e:

    print(
        f"\nRainforest Error: {e}"
    )

    products = []

print(
    f"Found {len(products)} products"
)

# =====================
# USER PROFILE
# =====================

user_profile = f"""
Query:
{query}

Tags:
{' '.join(customer_tags)}
"""

user_embedding = model.encode(
    user_profile
)

# =====================
# PRODUCT RANKING
# =====================

results = []

for product in products:

    title = str(
        product.get(
            "title",
            ""
        )
    )

    asin = product.get(
        "asin",
        ""
    )

    # Category Guardrail

    if not category_match(
        parsed_query.get(
            "category",
            ""
        ),
        title
    ):
        continue

    # Query Match

    query_words = query.split()

    matched_words = 0

    for word in query_words:

        if word in title.lower():
            matched_words += 1

    if matched_words == 0:
        continue

    # Embedding Similarity

    product_embedding = model.encode(
        title
    )

    embedding_score = cosine_similarity(
        [user_embedding],
        [product_embedding]
    )[0][0]

    score = embedding_score * 100

    # Query Bonus

    score += matched_words * 100

    reasons = []

    reasons.append(
        f"Matched {matched_words} query words"
    )

    # Tag Bonus

    tag_matches = 0

    for tag in customer_tags:

        if tag.lower() in title.lower():

            tag_matches += 1

            score += 30

            reasons.append(
                f"Matches tag: {tag}"
            )

    results.append({

        "title": title,
        "asin": asin,

        "score": round(
            float(score),
            2
        ),

        "rating": product.get(
            "rating"
        ),

        "price": product.get(
            "price"
        ),

        "link": product.get(
            "link"
        ),

        "tag_matches": tag_matches,

        "reasons": reasons
    })

# =====================
# SORT RESULTS
# =====================

results.sort(
    key=lambda x: x["score"],
    reverse=True
)
comparison_results = compare_products(
    results
)

# =====================
# PRODUCT INTELLIGENCE
# =====================

if len(results) > 0:

    try:

        results[0][
            "product_intelligence"
        ] = analyze_product(
            results[0]["title"],
            customer_tags,
            query
        )

    except Exception as e:

        results[0][
            "product_intelligence"
        ] = {
            "error": str(e)
        }

# =====================
# OUTPUT
# =====================

print("\n")
print("=" * 70)
print(f"RECOMMENDATIONS FOR '{query}'")
print("=" * 70)

if len(results) == 0:

    print(
        "\nNo relevant products found."
    )

for rank, item in enumerate(
    results,
    start=1
):

    print(
        f"\n{rank}. {item['title']}"
    )

    print(
        f"Score: {item['score']}"
    )

    if item.get("rating"):
        print(
            f"Rating: {item['rating']}"
        )

    if item.get("price"):
        print(
            f"Price: {item['price']}"
        )

    print("\nReasons:")

    for reason in item["reasons"]:
        print(f"✓ {reason}")

    if (
        rank == 1 and
        "product_intelligence" in item
    ):

        info = item[
            "product_intelligence"
        ]

        print("\nFit Score:")
        print(
            info.get(
                "fit_score",
                "N/A"
            )
        )

        print("\nBest For:")

        for x in info.get(
            "best_for",
            []
        ):
            print("-", x)

        print("\nPros:")

        for x in info.get(
            "pros",
            []
        ):
            print("-", x)

        print("\nCons:")

        for x in info.get(
            "cons",
            []
        ):
            print("-", x)

        print("\nAvoid If:")

        for x in info.get(
            "avoid_if",
            []
        ):
            print("-", x)

    print("\n" + "-" * 70)

print(
    f"\nTotal Matching Products: {len(results)}"
)
print("\n")
print("=" * 70)
print("WHY TOP PRODUCT WON")
print("=" * 70)

for item in comparison_results:

    print(
        f"\nCompared Against:"
    )

    print(
        item["loser"]
    )

    for reason in item["reasons"]:

        print(
            f"✓ {reason}"
        )

# =====================
# SAVE RESULTS
# =====================

try:

    with open(
        RESULTS_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            results,
            f,
            indent=4
        )

    print(
        "\nResults saved successfully."
    )

except Exception as e:

    print(
        f"\nCould not save results: {e}"
    )