import os
import re
from asgi_correlation_id import CorrelationIdMiddleware
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import Optional
from stytch import Client
from stytch.consumer.models.sessions import AuthenticateResponse
from stytch.core.response_base import StytchError
from billing.billing_manager import BillingManager, UpdateSubscriptionResponse
from character_generator import CharacterGenerator, CompanyCharacterInfo

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Lark Demo API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5176"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(CorrelationIdMiddleware)

STYTCH_PROJECT_ID = os.getenv("STYTCH_PROJECT_ID")
STYTCH_SECRET = os.getenv("STYTCH_SECRET")
if not STYTCH_PROJECT_ID or not STYTCH_SECRET:
    raise ValueError("STYTCH_PROJECT_ID and STYTCH_SECRET must be set")

stytch_client = Client(
    project_id=STYTCH_PROJECT_ID,
    secret=STYTCH_SECRET,
    environment="test",
)

character_generator = CharacterGenerator()
billing_manager = BillingManager()


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
    user_email = session.user.emails[0].email if session.user.emails else None
    user_name = (
        (
            (session.user.name.first_name or "")
            + " "
            + (session.user.name.last_name or "")
        )
        if session.user.name
        else None
    )

    billing_manager.potentially_create_free_plan_billing_customer(
        subject_external_id=stytch_user_id,
        name=user_name,
        email=user_email,
    )
    return stytch_user_id


class CompanyCharacterRequest(BaseModel):
    company_url: str

    @field_validator("company_url")
    @classmethod
    def validate_yc_url(cls, yc_company_url: str) -> str:
        """Validate that the URL matches the Y Combinator companies format."""
        pattern = r"^https://www\.ycombinator\.com/companies/[a-zA-Z0-9\-]+$"
        if not re.match(pattern, yc_company_url):
            raise ValueError(
                "URL must match the format: https://www.ycombinator.com/companies/{company_name}"
            )
        return yc_company_url


@app.post("/api/company_characters", response_model=CompanyCharacterInfo)
async def generate_company_characters(
    company_request: CompanyCharacterRequest,
    request: Request,
    session: AuthenticateResponse = Depends(verify_session_token),
) -> CompanyCharacterInfo:
    company_characters = await character_generator.generate_characters_for_company(
        company_request.company_url
    )

    request_id = request.headers.get("X-Request-ID")
    assert request_id is not None
    billing_manager.report_usage(
        subject_external_id=session.user.user_id,
        usage=1,
        idempotency_key=request_id,
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


class UpdateSubscriptionRequest(BaseModel):
    subscription_id: str
    new_rate_card_id: str
    checkout_success_callback_url: str
    checkout_cancel_callback_url: str


@app.post("/api/update_subscription", response_model=UpdateSubscriptionResponse)
async def update_subscription(
    update_subscription_request: UpdateSubscriptionRequest,
    session: AuthenticateResponse = Depends(verify_session_token),
):
    update_subscription_response = billing_manager.update_subscription(
        subscription_id=update_subscription_request.subscription_id,
        new_rate_card_id=update_subscription_request.new_rate_card_id,
        checkout_success_callback_url=update_subscription_request.checkout_success_callback_url,
        checkout_cancel_callback_url=update_subscription_request.checkout_cancel_callback_url,
    )
    return update_subscription_response


class CustomerPortalRequest(BaseModel):
    return_url: str


class CustomerPortalSessionResponse(BaseModel):
    url: str


@app.post("/api/customer_portal", response_model=CustomerPortalSessionResponse)
async def create_customer_portal_session(
    customer_portal_request: CustomerPortalRequest,
    session: AuthenticateResponse = Depends(verify_session_token),
):
    customer_portal_session_url = billing_manager.create_customer_portal_session(
        subject_external_id=session.user.user_id,
        return_url=customer_portal_request.return_url,
    )
    return CustomerPortalSessionResponse(url=customer_portal_session_url)
