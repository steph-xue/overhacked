import os

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import mcq_router, coding_quiz_router
# Create FastAPI instance
app = FastAPI()
# Configure CORS
# ALLOWED_ORIGINS is a comma-separated list, e.g. "https://overhacked.onrender.com,https://example.com"
origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # allow specific origins
    allow_credentials=True,
    allow_methods=["*"],    # allow all HTTP methods
    allow_headers=["*"],    # allow all headers
)

router = APIRouter()


# Root Directory - Just for testing for now
@app.get("/")
def root():
    return {"message": "Welcome to the FastAPI backend!"}

# MCQ router
app.include_router(mcq_router)
app.include_router(coding_quiz_router)