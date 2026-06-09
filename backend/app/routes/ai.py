from fastapi import APIRouter

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)

@router.post("/chat")
def chat():
    return {"response": "AI Chat"}

@router.post("/recommend")
def recommend():
    return {"response": "Recommendation"}

@router.post("/analyze")
def analyze():
    return {"response": "Analysis"}