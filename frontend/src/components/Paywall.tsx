import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useEffect, useState } from "react";
import { BillingState } from "../billing/larkClient";
import { getPlanChangeType, PricingPlan } from "../billing/paywallPlans";
import { useStytch } from "@stytch/react";

function getPaywallSubText({
  billingState,
}: {
  billingState: BillingState;
}): string {
  if (billingState.creditsRemaining > 0 || billingState.overageAllowed) {
    return "Choose the plan that best fits your needs";
  } else {
    return "You're out of credits. Please upgrade to continue.";
  }
}

export function Paywall({
  plans,
  billingStateLoader,
  upgradeSubscriptionPlan,
}: {
  plans: PricingPlan[];
  billingStateLoader: () => Promise<BillingState>;
  upgradeSubscriptionPlan: ({
    subscriptionId,
    newRateCardId,
    sessionToken,
  }: {
    subscriptionId: string;
    newRateCardId: string;
    sessionToken: string;
  }) => Promise<{ result_type: "redirected_for_checkout" | "success" }>;
}) {
  const stytchClient = useStytch();
  const sessionToken = stytchClient.session.getTokens()?.session_token;

  if (!sessionToken) {
    throw new Error("No active session. Please log in again.");
  }

  const [error, setError] = useState<string | null>(null);
  const [billingState, setBillingState] = useState<BillingState | null>(null);
  const [loadingRateCardId, setLoadingRateCardId] = useState<string | null>(
    null
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUpgrade, setPendingUpgrade] = useState<{
    subscriptionId: string;
    newRateCardId: string;
    planName: string;
  } | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    // Check for upgrade_success query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const upgradeSuccess = urlParams.get("upgrade_success");

    if (upgradeSuccess === "true") {
      setShowSuccessToast(true);
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }, []);

  useEffect(() => {
    const getBillingStateWrapper = async () => {
      try {
        const billingState = await billingStateLoader();
        setBillingState(billingState);
      } catch (err) {
        setError("Error fetching billing state. Please try again.");
      }
    };
    getBillingStateWrapper();
  }, []);

  const handleSelectPlan = ({
    subscriptionId,
    newRateCardId,
    planName,
  }: {
    subscriptionId: string;
    newRateCardId: string;
    planName: string;
  }) => {
    setPendingUpgrade({ subscriptionId, newRateCardId, planName });
    setShowConfirmModal(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!pendingUpgrade) return;

    const { subscriptionId, newRateCardId } = pendingUpgrade;

    console.log(
      `Confirmed upgrade to: ${newRateCardId} for subscription: ${subscriptionId}`
    );

    setShowConfirmModal(false);

    try {
      setLoadingRateCardId(newRateCardId);

      const result = await upgradeSubscriptionPlan({
        subscriptionId,
        newRateCardId,
        sessionToken,
      });

      if (result.result_type === "success") {
        // Show success toast and redirect to home page
        setShowSuccessToast(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (err) {
      console.error("Error updating subscription:", err);
      setError("Failed to update subscription. Please try again.");
    } finally {
      setLoadingRateCardId(null);
      setPendingUpgrade(null);
    }
  };

  const handleCancelUpgrade = () => {
    setShowConfirmModal(false);
    setPendingUpgrade(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col">
      <Header />

      <main className="flex-1 px-4 py-16">
        {!billingState && error && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Oops! Something went wrong :(
            </h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              Try Again
            </button>
          </div>
        )}
        {!billingState && !error && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we fetch your account details
            </p>
          </div>
        )}

        {billingState && (
          <>
            <div className="max-w-7xl mx-auto text-center mb-16">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Pricing</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {getPaywallSubText({ billingState })}
              </p>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => {
                const subscribedRateCardId = billingState.subscribedRateCardId;
                const planChangeType = getPlanChangeType({
                  currentRateCardId: subscribedRateCardId,
                  newRateCardId: plan.rateCardId,
                });
                return (
                  <div
                    key={plan.name}
                    className="relative bg-white rounded-3xl shadow-xl p-8 flex flex-col transition-transform hover:scale-105"
                  >
                    {/* Plan Header */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 text-sm min-h-[40px]">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-5xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-gray-600 ml-2">per month</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    {planChangeType === "no-change" ? (
                      <div className="w-full py-4 px-6 rounded-xl font-semibold text-lg mb-6 bg-gray-200 text-gray-600 text-center cursor-not-allowed">
                        Current Plan
                      </div>
                    ) : planChangeType === "downgrade" ? (
                      <div
                        className="w-full py-4 px-6 rounded-xl font-semibold text-lg mb-6 bg-gray-200 text-gray-600 text-center cursor-not-allowed relative group"
                        title="Contact support for downgrade"
                      >
                        Downgrade
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          Contact support for downgrade
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleSelectPlan({
                            subscriptionId: billingState.subscriptionId,
                            newRateCardId: plan.rateCardId,
                            planName: plan.name,
                          })
                        }
                        disabled={loadingRateCardId !== null}
                        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg mb-6 transition-all flex items-center justify-center ${
                          loadingRateCardId !== null
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                            : "bg-gray-900 text-white hover:bg-gray-800"
                        }`}
                      >
                        {loadingRateCardId === plan.rateCardId ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          "Upgrade"
                        )}
                      </button>
                    )}

                    {/* Features List */}
                    <div className="flex-1">
                      <div className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start">
                            <svg
                              className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-gray-700 text-sm">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <Footer />

      {/* Confirmation Modal */}
      {showConfirmModal && pendingUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Confirm Upgrade
              </h3>
              <p className="text-gray-600">
                Are you sure you want to upgrade to the{" "}
                <span className="font-semibold text-gray-900">
                  {pendingUpgrade.planName}
                </span>{" "}
                plan?
              </p>
              <p className="text-gray-600 mt-3">
                You will be charged the new price for the current month and
                going forward.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelUpgrade}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpgrade}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors"
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in mb-20">
          <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <p className="font-semibold">Success!</p>
              <p className="text-sm">Your plan was upgraded successfully.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
