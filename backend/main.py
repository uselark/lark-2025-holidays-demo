import os
import random
import re
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import List, Optional, Literal
from stytch import Client
from stytch.consumer.models.sessions import AuthenticateResponse
from stytch.core.response_base import StytchError

from character_generator import CharacterGenerator, CompanyCharacterInfo

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Lark Demo API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


stytch_client = Client(
    project_id=os.getenv("STYTCH_PROJECT_ID"),
    secret=os.getenv("STYTCH_SECRET"),
    environment="test",
)

character_generator = CharacterGenerator()


# Authentication dependency
async def verify_session_token(
    authorization: Optional[str] = Header(None),
) -> AuthenticateResponse:
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


@app.get("/")
async def root():
    return {"message": "Yo :|"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/customers", response_model=str)
async def create_customer(
    session: AuthenticateResponse = Depends(verify_session_token),
):
    stytch_user_id = session.user.user_id
    user_email = session.user.emails[0] if session.user.emails else None
    user_name = session.user.name

    return stytch_user_id


class CompanyCharacterRequest(BaseModel):
    company_url: str

    @field_validator("company_url")
    @classmethod
    def validate_yc_url(cls, v: str) -> str:
        """Validate that the URL matches the Y Combinator companies format."""
        pattern = r"^https://www\.ycombinator\.com/companies/[a-zA-Z0-9\-]+$"
        if not re.match(pattern, v):
            raise ValueError(
                "URL must match the format: https://www.ycombinator.com/companies/{company_name}"
            )
        return v


@app.post("/api/company_characters", response_model=CompanyCharacterInfo)
async def generate_company_characters(
    request: CompanyCharacterRequest,
    session: AuthenticateResponse = Depends(verify_session_token),
):

    company_characters = await character_generator.generate_characters_for_company(
        request.company_url
    )
    return company_characters


@app.get("/api/company_characters/{generation_id}", response_model=CompanyCharacterInfo)
async def get_company_characters(
    generation_id: str,
) -> CompanyCharacterInfo:
    company_characters = await character_generator.get_character_generation(
        generation_id
    )
    return company_characters
