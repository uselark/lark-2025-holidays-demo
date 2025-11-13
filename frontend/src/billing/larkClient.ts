import Lark from "lark-billing";
import { isOverageAllowedForRateCardId } from "./paywallPlans";

const LARK_PUBLIC_API_KEY = import.meta.env.VITE_LARK_PUBLIC_API_KEY;
const LARK_BASE_URL = import.meta.env.VITE_LARK_BASE_URL;

const lark = new Lark({
  apiKey: LARK_PUBLIC_API_KEY,
  baseURL: LARK_BASE_URL ?? "https://api.uselark.ai",
});

export type BillingState = {
  subscriptionId: string;
  subscribedRateCardId: string;
  creditsRemaining: number;
  overageAllowed: boolean;
};
export async function getBillingState({
  subjectId,
}: {
  subjectId: string;
}): Promise<BillingState> {
  try {
    const billingState = await lark.customerAccess.retrieveBillingState(
      subjectId
    );

    if (billingState.active_subscriptions.length !== 1) {
      throw new Error(
        "We always expect a user to have a single active subscription since we subscribe them to free plan on signup"
      );
    }
    const subscribedRateCardId =
      billingState.active_subscriptions[0].rate_card_id;
    const subscriptionId = billingState.active_subscriptions[0].subscription_id;

    if (billingState.usage_data.length !== 1) {
      throw new Error(
        "We always expect a user to have a single usage data since we track usage for a single pricing metric"
      );
    }

    const includedCredits = billingState.usage_data[0].included_units;
    const usedCredits = parseInt(billingState.usage_data[0].used_units);
    const overageAllowed = isOverageAllowedForRateCardId(subscribedRateCardId);

    return {
      subscriptionId,
      subscribedRateCardId,
      creditsRemaining: includedCredits - usedCredits,
      overageAllowed,
    };
  } catch (err) {
    console.error("Error fetching billing state:", err);
    throw new Error("Error fetching billing state");
  }
}
