import { LarkClient } from "lark-billing";

const lark = new LarkClient({
  apiKey: import.meta.env.VITE_LARK_PUBLIC_API_KEY,
});

export type BillingState = {
  subscriptionId: string;
  subscribedRateCardId: string;
  creditsRemaining: number;
};
export async function getBillingState({
  subjectId,
}: {
  subjectId: string;
}): Promise<BillingState> {
  try {
    const billingState = await lark.customerAccess.getBillingState(subjectId);

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

    return {
      subscriptionId,
      subscribedRateCardId,
      creditsRemaining: includedCredits - usedCredits,
    };
  } catch (err) {
    console.error("Error fetching billing state:", err);
    throw new Error("Error fetching billing state");
  }
}
