import { updateSubscription } from "../api/api";
import { Paywall } from "../components/Paywall";
import { plans } from "../billing/paywallPlans";
import { useBillingManager } from "../billing/useBillingManager";

export function Plans() {
  const { getBillingState } = useBillingManager();

  const upgradeSubscriptionPlan = async ({
    subscriptionId,
    newRateCardId,
    sessionToken,
  }: {
    subscriptionId: string;
    newRateCardId: string;
    sessionToken: string;
  }): Promise<{ result_type: "redirected_for_checkout" | "success" }> => {
    const currentUrl = `${window.location.href}`;
    const updateSubscriptionResponse = await updateSubscription({
      subscriptionId,
      newRateCardId,
      sessionToken,
      checkoutSuccessCallbackUrl: `${currentUrl}?upgrade_success=true`,
      checkoutCancelCallbackUrl: currentUrl,
    });

    if (updateSubscriptionResponse.type === "checkout_action_required") {
      if (!updateSubscriptionResponse.checkout_url) {
        throw new Error(
          "Unexpected response type: checkout_action_required but checkout_url is null"
        );
      }

      window.location.href = updateSubscriptionResponse.checkout_url;
      return { result_type: "redirected_for_checkout" };
    } else if (updateSubscriptionResponse.type === "success") {
      return { result_type: "success" };
    } else {
      throw new Error("Unexpected response type");
    }
  };

  return (
    // Shows a list of plans and manages upgrades through the passed in handler function
    <Paywall
      plans={plans}
      billingStateLoader={getBillingState}
      upgradeSubscriptionPlan={upgradeSubscriptionPlan}
    />
  );
}
