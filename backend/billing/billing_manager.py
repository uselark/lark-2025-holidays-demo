from typing import Literal
from lark import Lark
from lark.core.api_error import ApiError as LarkApiError
import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

PRICING_METRIC_EVENT_NAME = "character_generation"
FREE_PLAN_RATE_CARD_ID = "rc_9R9cGOyGev7eDxTMbBBBt6Ts"

LARK_API_KEY = os.getenv("LARK_API_KEY")


class UpdateSubscriptionResponse(BaseModel):
    type: Literal["success", "checkout_action_required"]
    checkout_url: str | None


class BillingManager:
    def __init__(self):
        assert LARK_API_KEY is not None
        self.lark = Lark(
            api_key=LARK_API_KEY,
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
