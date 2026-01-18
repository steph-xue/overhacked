from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import mcq_router
# Create FastAPI instance
app = FastAPI()
# Configure CORS
origins = [
    "http://localhost:3000",  # frontend URL
    # Add other origins if needed, e.g., "https://yourdomain.com"
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