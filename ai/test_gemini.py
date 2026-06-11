from gemini_explainer import explain_product

result = explain_product(
    "Nike Mens Dri-FIT Training T-Shirt",
    ["fashion","nike","budget"],
    "nike tshirt"
)

print(result)