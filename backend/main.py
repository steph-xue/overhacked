from fastapi import APIRouter, FastAPI
from app.routes import mcq_router
# Create FastAPI instance
app = FastAPI()
router = APIRouter()

# Root Directory - Just for testing for now
@app.get("/")
def root():
    return {"message": "Welcome to the FastAPI backend!"}

# MCQ router
app.include_router(mcq_router)