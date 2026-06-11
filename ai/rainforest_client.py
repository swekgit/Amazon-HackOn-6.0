import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("RAINFOREST_API_KEY")

def search_products(query):

    url = "https://api.rainforestapi.com/request"

    params = {
        "api_key": API_KEY,
        "type": "search",
        "amazon_domain": "amazon.in",
        "search_term": query
    }

    response = requests.get(
        url,
        params=params
    )

    return response.json()