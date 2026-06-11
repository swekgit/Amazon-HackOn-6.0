from rainforest_client import search_products

print("Searching Amazon...")

data = search_products("nike tshirt")

results = data["search_results"]

for item in results[:10]:

    print("\n------------------")

    print(
        item.get("title")
    )

    print(
        item.get("asin")
    )