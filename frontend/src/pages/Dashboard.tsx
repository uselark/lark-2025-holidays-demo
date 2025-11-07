import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CharacterGenerator } from "../components/CharacterGenerator";
import { BillingState } from "../billing/larkClient";
import { useEffect, useState } from "react";
import { useBillingManager } from "../billing/useBillingManager";
import { Navigate, Link } from "react-router-dom";

const BillingSubText = ({ billingState }: { billingState: BillingState }) => {
  const remainingCredits = billingState.creditsRemaining;
  const overageAllowed = billingState.overageAllowed;

  const remainingCreditsText = `${remainingCredits} credit${
    remainingCredits === 1 ? "" : "s"
  } remaining.`;

  return (
    <p className="text-gray-500 text-center">
      {remainingCreditsText}{" "}
      {overageAllowed ? (
        "You'll be charged a fixed fee per character generation after you use up all your credits."
      ) : (
        <>
          You can always{" "}
          <Link
            to="/plans"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            upgrade
          </Link>{" "}
          plan to get more credits.
        </>
      )}
    </p>
  );
};

export function CharacterGeneratorWrapper({
  billingState,
}: {
  billingState: BillingState;
}) {
  const isAllowedToUse =
    billingState.creditsRemaining > 0 || billingState.overageAllowed;

  if (!isAllowedToUse) {
    return <Navigate to="/plans" />;
  }

  return (
    <CharacterGenerator
      subText={<BillingSubText billingState={billingState} />}
    />
  );
}

export function Dashboard() {
  const { getBillingState } = useBillingManager();

  const [error, setError] = useState<string | null>(null);
  const [billingState, setBillingState] = useState<BillingState | null>(null);

  useEffect(() => {
    const getBillingStateWrapper = async () => {
      try {
        const billingState = await getBillingState();
        setBillingState(billingState);
      } catch (err) {
        setError("Error fetching billing state. Please try again.");
      }
    };
    getBillingStateWrapper();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4">
        {billingState && (
          <CharacterGeneratorWrapper billingState={billingState} />
        )}
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
      </main>
      <Footer />
    </div>
  );
}
