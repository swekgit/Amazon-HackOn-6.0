from sentence_transformers import SentenceTransformer
import json
import pickle

print("Loading Model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Loading Products...")

with open("datasets/product_data.json", "r", encoding="utf-8") as f:
    products = json.load(f)

product_texts = []

for product in products:

    text = f"""
    {product['product_name']}
    {product['category']}
    {product['subcategory']}
    {product['brand']}
    """

    product_texts.append(text)

print("Generating Embeddings...")

product_embeddings = model.encode(
    product_texts,
    show_progress_bar=True
)

print("Saving Embeddings...")

with open("datasets/product_embeddings.pkl", "wb") as f:
    pickle.dump(product_embeddings, f)

print("Done!")
print(f"Saved {len(product_embeddings)} embeddings")