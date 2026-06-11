from query_understanding import understand_query

result = understand_query(
    "ball",
    ["fitness","gym","workout"]
)

print(result)
print(type(result))