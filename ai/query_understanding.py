import json
from gemini_explainer import model

def understand_query(
    query,
    customer_tags
):

    prompt = f"""
    User Query:
    {query}

    Customer Tags:
    {customer_tags}

    Return JSON only:

    {{
        "intent":"",
        "product_type":"",
        "category":""
    }}
    """

    response = model.generate_content(
        prompt
    )

    text = response.text

    text = text.replace(
        "```json",
        ""
    )

    text = text.replace(
        "```",
        ""
    )

    return json.loads(text)