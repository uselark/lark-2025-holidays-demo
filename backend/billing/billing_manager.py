from typing import Literal
from lark import CheckoutCallback, Lark
from lark.core.api_error import ApiError as LarkApiError
import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

PRICING_METRIC_EVENT_NAME = (
    os.getenv("PRICING_METRIC_EVENT_NAME") or "character_generation"
)
FREE_PLAN_RATE_CARD_ID = (
    os.getenv("FREE_PLAN_RATE_CARD_ID") or "rc_boNfcQ2JRwzRZCil5oMneaCB"
)


LARK_BASE_URL = os.getenv("LARK_BASE_URL")
LARK_API_KEY = os.getenv("LARK_API_KEY")


class UpdateSubscriptionResponse(BaseModel):
    type: Literal["success", "checkout_action_required"]
    checkout_url: str | None


class BillingManager:
    def __init__(self):
        assert LARK_API_KEY is not None
        self.lark = Lark(
            api_key=LARK_API_KEY,
            base_url=LARK_BASE_URL if LARK_BASE_URL else None,
        )

    def potentially_create_free_plan_billing_customer(
        self, subject_external_id: str, name: str | None, email: str | None
    ):
        try:
            subject = self.lark.subjects.get_subject(subject_id=subject_external_id)
            print(
                f"Subject already exists: {subject.id} for external id: {subject_external_id}"
            )

            return
        except LarkApiError as e:
            if e.status_code != 404:
                raise e
            # eat yup 404 and continue creating subject below

        subject = self.lark.subjects.create_subject(
            external_id=subject_external_id,
            name=name,
            email=email,
        )

        self.lark.subscriptions.create_subscription(
            subject_id=subject.id,
            rate_card_id=FREE_PLAN_RATE_CARD_ID,
        )

    def report_usage(
        self,
        subject_external_id: str,
        usage: int,
        idempotency_key: str,
    ):
        self.lark.usage_events.create_usage_event(
            idempotency_key=idempotency_key,
            subject_id=subject_external_id,
            event_name=PRICING_METRIC_EVENT_NAME,
            data={
                "value": usage,
            },
        )

    def update_subscription(
        self,
        subscription_id: str,
        new_rate_card_id: str,
        checkout_success_callback_url: str,
        checkout_cancel_callback_url: str,
    ):
        response = self.lark.subscriptions.change_subscription_rate_card(
            subscription_id=subscription_id,
            rate_card_id=new_rate_card_id,
            upgrade_behavior="rate_difference",
            checkout_callback_urls=CheckoutCallback(
                success_url=checkout_success_callback_url,
                cancelled_url=checkout_cancel_callback_url,
            ),
        )

        if response.result.type == "requires_action":
            return UpdateSubscriptionResponse(
                type="checkout_action_required",
                checkout_url=response.result.action.checkout_url,
            )
        elif response.result.type == "success":
            return UpdateSubscriptionResponse(
                type="success",
                checkout_url=None,
            )
        else:
            raise ValueError(f"Unexpected response type: {response.result.type}")

    def create_customer_portal_session(self, subject_external_id: str, return_url: str):
        customer_portal_session = (
            self.lark.customer_portal.create_customer_portal_session(
                subject_id=subject_external_id,
                return_url=return_url,
            )
        )
        return customer_portal_session.url
