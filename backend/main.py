import os
import random
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal
from stytch import Client
from stytch.core.response_base import StytchError

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Lark Demo API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


stytch_client = Client(
    project_id=os.getenv("STYTCH_PROJECT_ID"),
    secret=os.getenv("STYTCH_SECRET"),
    environment="test",
)


# Authentication dependency
async def verify_session_token(authorization: Optional[str] = Header(None)) -> dict:
    """
    Verify the Stytch session token from the Authorization header.
    Returns the authenticated session data.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    # Extract token from "Bearer <token>" format
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(
            status_code=401, detail="Invalid authorization header format"
        )

    # Verify the session token with Stytch
    try:
        response = stytch_client.sessions.authenticate(session_token=token)
        return response
    except StytchError as e:
        raise HTTPException(
            status_code=401, detail=f"Invalid or expired session token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication error: {str(e)}")


class Item(BaseModel):
    id: int
    name: str
    description: str


class RouletteResult(BaseModel):
    number: int
    color: Literal["red", "black", "green"]


# In-memory storage (no database)
items: List[Item] = [
    Item(id=1, name="Sample Item 1", description="This is a sample item"),
    Item(id=2, name="Sample Item 2", description="Another sample item"),
]


# Roulette numbers with their colors
ROULETTE_NUMBERS = [
    {"number": 0, "color": "green"},
    {"number": 1, "color": "red"},
    {"number": 2, "color": "black"},
    {"number": 3, "color": "red"},
    {"number": 4, "color": "black"},
    {"number": 5, "color": "red"},
    {"number": 6, "color": "black"},
    {"number": 7, "color": "red"},
    {"number": 8, "color": "black"},
    {"number": 9, "color": "red"},
    {"number": 10, "color": "black"},
    {"number": 11, "color": "black"},
    {"number": 12, "color": "red"},
    {"number": 13, "color": "black"},
    {"number": 14, "color": "red"},
    {"number": 15, "color": "black"},
    {"number": 16, "color": "red"},
    {"number": 17, "color": "black"},
    {"number": 18, "color": "red"},
    {"number": 19, "color": "red"},
    {"number": 20, "color": "black"},
    {"number": 21, "color": "red"},
    {"number": 22, "color": "black"},
    {"number": 23, "color": "red"},
    {"number": 24, "color": "black"},
    {"number": 25, "color": "red"},
    {"number": 26, "color": "black"},
    {"number": 27, "color": "red"},
    {"number": 28, "color": "black"},
    {"number": 29, "color": "black"},
    {"number": 30, "color": "red"},
    {"number": 31, "color": "black"},
    {"number": 32, "color": "red"},
    {"number": 33, "color": "black"},
    {"number": 34, "color": "red"},
    {"number": 35, "color": "black"},
    {"number": 36, "color": "red"},
]


@app.get("/")
async def root():
    return {"message": "Welcome to Lark Demo API"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/items", response_model=List[Item])
async def get_items(session: dict = Depends(verify_session_token)):
    """Get all items (protected route)"""
    return items


@app.get("/api/items/{item_id}", response_model=Item)
async def get_item(item_id: int, session: dict = Depends(verify_session_token)):
    """Get a specific item by ID (protected route)"""
    for item in items:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")


@app.post("/api/items", response_model=Item)
async def create_item(item: Item, session: dict = Depends(verify_session_token)):
    """Create a new item (protected route)"""
    items.append(item)
    return item


@app.post("/api/customers", response_model=str)
async def create_customer(session: dict = Depends(verify_session_token)):
    # get stych user id
    stytch_user_id = session["user_id"]
    return stytch_user_id


@app.post("/api/spin", response_model=RouletteResult)
async def spin_roulette(session: dict = Depends(verify_session_token)):
    """Spin the roulette wheel and return a random result"""
    result = random.choice(ROULETTE_NUMBERS)
    return RouletteResult(**result)
