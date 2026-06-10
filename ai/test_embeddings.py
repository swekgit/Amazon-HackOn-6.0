from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer('all-MiniLM-L6-v2')

user_profile = """
Garden
KitchenAid
Budget
Beauty
"""

products = [
    "KitchenAid Garden Tool Set Budget Garden",
    "Beauty Essentials Kit Budget Beauty",
    "Premium Garden Sprayer Premium Garden",
    "KitchenAid Mixer Budget KitchenAid"
]

user_embedding = model.encode(user_profile)

product_embeddings = model.encode(products)

scores = cosine_similarity(
    [user_embedding],
    product_embeddings
)

for product, score in zip(products, scores[0]):
    print(product)
    print("Score:", round(score, 4))
    print()