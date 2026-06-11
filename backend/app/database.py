from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

client = MongoClient(MONGO_URL)

db = client["amazon_reconnect"]

customers_collection = db["customers"]
customer_tags_collection = db["customer_tags"]
products_collection = db["products"]

ad_recommendations_collection = db["ad_recommendations"]
ad_audience_profiles_collection = db["ad_audience_profiles"]
customer_recovery_profiles_collection = db["customer_recovery_profiles"]

print("MongoDB Connected Successfully")