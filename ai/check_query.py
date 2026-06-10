import json
import re

def normalize(text):
    text = text.lower()
    text = text.replace("-", "")
    text = text.replace("_", "")
    text = re.sub(r"[^a-z0-9 ]", "", text)
    return text

query = normalize(
    input("Query: ")
)

with open("datasets/product_data.json", "r", encoding="utf-8") as f:
    products = json.load(f)

count = 0

for p in products:

    text = normalize(
        str(p["product_name"]) + " " +
        str(p["category"]) + " " +
        str(p["subcategory"])
    )

    if query in text:
        count += 1
        print(p["product_name"])

print("\nMatches Found:", count)