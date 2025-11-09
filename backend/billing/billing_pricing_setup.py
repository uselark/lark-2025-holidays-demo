import uuid
from lark import (
    Amount,
    CreateFixedRateRequest,
    CreateRateCardRequestUsageBasedRatesItem_Simple,
    Lark,
    Price_Flat,
    PricingMetricAggregation_Sum,
)
import os
from dotenv import load_dotenv

load_dotenv()

LARK_API_KEY = os.getenv("LARK_API_KEY")
assert LARK_API_KEY is not None

LARK_BASE_URL = os.getenv("LARK_BASE_URL")
assert LARK_BASE_URL is not None

lark = Lark(
    api_key=LARK_API_KEY,
    base_url=LARK_BASE_URL if LARK_BASE_URL else None,
)


# Note: All of this can also be done in the Lark Dashboard
class LarkPricingPlanGenerator:
    def __init__(self):
        pass

    def create_pricing_metric(self):
        # This helps us track usage and bill for it
        pricing_metric = lark.pricing_metrics.create_pricing_metric(
            name="Character Generation",
            event_name=f"character_generation_{uuid.uuid4().hex}",
            aggregation=PricingMetricAggregation_Sum(value_field="value"),
            unit="character generations",
        )
        print(f"Pricing metric created: {pricing_metric}")
        return pricing_metric

    def create_free_plan_rate_card(self, pricing_metric_id: str):
        rate_card = lark.rate_cards.create_rate_card(
            name="Free plan",
            description="Free plan that every new user gets subscribed to",
            billing_interval="monthly",
            usage_based_rates=[
                self._create_character_generation_usage_rate(
                    pricing_metric_id=pricing_metric_id,
                    # free users get 5 character generations per month
                    included_units=5,
                    # Since we don't allow users to go over included
                    # quantity on this plan, we just create a zero dollar
                    # price here since this won't really be used
                    per_unit_amount_in_cents=0,
                ),
            ],
        )
        print(f"Free plan rate card created: {rate_card}")

    def create_starter_plan_rate_card(self, pricing_metric_id: str):
        rate_card = lark.rate_cards.create_rate_card(
            name="Starter plan",
            description="Starter plan that provides 20 additional character generations per month",
            billing_interval="monthly",
            fixed_rates=[
                CreateFixedRateRequest(
                    name="Starter base rate",
                    price=Price_Flat(
                        amount=Amount(
                            value="2000",  # $20
                            currency_code="USD",
                        )
                    ),
                )
            ],
            usage_based_rates=[
                self._create_character_generation_usage_rate(
                    pricing_metric_id=pricing_metric_id,
                    # 5 carry over from free plan + 20 more
                    included_units=25,
                    # still zero dollars since we won't let users
                    # go over included quantity on this plan
                    per_unit_amount_in_cents=0,
                ),
            ],
        )
        print(f"Starter plan rate card created: {rate_card}")

    def create_premium_plan_rate_card(self, pricing_metric_id: str):
        rate_card = lark.rate_cards.create_rate_card(
            name="Premium plan",
            description="Premium plan that provides 100 additional character generations per month. Character generations after the included quantity are billed at 90 cents per generation.",
            billing_interval="monthly",
            fixed_rates=[
                CreateFixedRateRequest(
                    name="Premium base rate",
                    price=Price_Flat(
                        amount=Amount(
                            value="10000",  # $100
                            currency_code="USD",
                        )
                    ),
                )
            ],
            usage_based_rates=[
                self._create_character_generation_usage_rate(
                    pricing_metric_id=pricing_metric_id,
                    # 5 carry over from free plan + 100 more
                    included_units=105,
                    #  unlimited character generations are allowed in this plan.
                    # If users go over included quantity, they are billed at 80 cents per generation.
                    per_unit_amount_in_cents=90,
                ),
            ],
        )
        print(f"Premium plan rate card created: {rate_card}")

    def _create_character_generation_usage_rate(
        self,
        *,
        pricing_metric_id: str,
        included_units: int,
        per_unit_amount_in_cents: int,
    ):
        return CreateRateCardRequestUsageBasedRatesItem_Simple(
            name="Character generation usage rate",
            included_units=included_units,
            pricing_metric_id=pricing_metric_id,
            price=Price_Flat(
                amount=Amount(
                    value=str(per_unit_amount_in_cents),
                    currency_code="USD",
                )
            ),
        )


if __name__ == "__main__":
    lark_pricing_plan_generator = LarkPricingPlanGenerator()
    pricing_metric = lark_pricing_plan_generator.create_pricing_metric()
    lark_pricing_plan_generator.create_free_plan_rate_card(
        pricing_metric_id=pricing_metric.id
    )
    lark_pricing_plan_generator.create_starter_plan_rate_card(
        pricing_metric_id=pricing_metric.id
    )
    lark_pricing_plan_generator.create_premium_plan_rate_card(
        pricing_metric_id=pricing_metric.id
    )
