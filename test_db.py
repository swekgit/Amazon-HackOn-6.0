from app.database import customer_tags_collection

print(customer_tags_collection.count_documents({}))