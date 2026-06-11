import json
from backend.app.database import db

products_collection = db["products"]

with open("dataset/amazon_products_2000.json", "r", encoding="utf-8") as file:
    products = json.load(file)

products_collection.insert_many(products)

print(f"{len(products)} products imported successfully")