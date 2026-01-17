from fastapi import APIRouter, FastAPI

# Create FastAPI instance
app = FastAPI()
router = APIRouter()

# Root Directory - Just for testing for now
@app.get("/")
def root():
    return {"message": "Welcome to the FastAPI backend!"}

