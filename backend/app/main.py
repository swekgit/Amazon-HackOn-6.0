print("APP MAIN LOADED")
from fastapi import FastAPI
from app.routes import auth, users, ai

app = FastAPI(title="AmazonNexus API")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {"message": "AmazonNexus Running"}

@app.get("/health")
def health():
    return {"status": "healthy"}