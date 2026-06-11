from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.ads import (
    router as ads_router
)

from app.routes.recovery_profiles import (
    router as recovery_router
)

app = FastAPI(
    title="Amazon ReConnect API",
    description="AI Powered Customer Win-Back Engine",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check API
@app.get("/")
def health():

    return {
        "status": "running",
        "service": "Amazon ReConnect Backend"
    }


# Routes
app.include_router(
    ads_router
)

app.include_router(
    recovery_router
)