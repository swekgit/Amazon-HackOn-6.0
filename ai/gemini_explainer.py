import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)

def explain_product(
    title,
    customer_tags,
    query
):

    prompt = f"""
    User Search Query:
    {query}

    Customer Tags:
    {customer_tags}

    Product:
    {title}

    Explain in 2 short sentences
    why this product matches
    the user.
    """

    response = model.generate_content(
        prompt
    )

    return response.text