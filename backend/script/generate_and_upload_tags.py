import json

from backend.app.database import db
from backend.app.tag_generator import generate_tags

collection = db["customer_tags"]

with open(
    "dataset/customers.json",
    "r",
    encoding="utf-8"
) as file:

    data = json.load(file)

customers = data["customers"]

for customer in customers:

    tagged_customer = {
        "customer_id": customer["customer_id"],
        "full_name": customer["full_name"],
        "tags": generate_tags(customer)
    }

    collection.insert_one(tagged_customer)

print("All customer tags uploaded successfully")