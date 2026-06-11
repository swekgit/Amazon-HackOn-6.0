import json
from app.database import db

customers_collection = db["customers"]

with open("dataset/customers.json", "r", encoding="utf-8") as file:
    data = json.load(file)

# Agar file me {"customers": [...]} format hai
customers = data["customers"]

customers_collection.insert_many(customers)

print(f"{len(customers)} customers imported successfully")