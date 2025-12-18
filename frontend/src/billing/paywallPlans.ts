export interface PricingPlan {
  rateCardId: string;
  name: string;
  price: number;
  description: string;
  credits: number;
  features: string[];
}

const FREE_PLAN_RATE_CARD_ID =
  import.meta.env.VITE_FREE_PLAN_RATE_CARD_ID || "rc_MRdNmrqTPTXZWiNINmj4YVAX";
const STARTER_PLAN_RATE_CARD_ID =
  import.meta.env.VITE_STARTER_PLAN_RATE_CARD_ID ||
  "rc_7WpF3Yi69QGpgzrGdS3Uyggd";
const PREMIUM_PLAN_RATE_CARD_ID =
  import.meta.env.VITE_PREMIUM_PLAN_RATE_CARD_ID ||
  "rc_hSIYwdT1RBhELkIAR256qVW3";

export const plans: PricingPlan[] = [
  {
    rateCardId: FREE_PLAN_RATE_CARD_ID,
    name: "Free",
    price: 0,
    description: "Perfect for trying out our AI character generator",
    credits: 5,
    features: [
      "5 credits per month",
      "Basic character generation",
      "Community support",
    ],
  },
  {
    rateCardId: STARTER_PLAN_RATE_CARD_ID,
    name: "Starter",
    price: 20,
    description: "Best for individ  uals and small projects",
    credits: 25,
    features: [
      "25 credits per month",
      "Premium character generation",
      "Priority support",
    ],
  },
  {
    rateCardId: PREMIUM_PLAN_RATE_CARD_ID,
    name: "Premium",
    price: 100,
    description: "Unlimited power for professionals and teams",
    credits: 105,
    features: [
      "105 included credits, $0.90 per additional generation",
      "Premium character generation",
      "Priority support",
    ],
  },
];

export function isOverageAllowedForRateCardId(rateCardId: string): boolean {
  return rateCardId === PREMIUM_PLAN_RATE_CARD_ID;
}

export function getPricingPlanForRateCardId(rateCardId: string): PricingPlan {
  const plan = plans.find((plan) => plan.rateCardId === rateCardId);
  if (!plan) {
    throw new Error(`Plan not found for rate card ID: ${rateCardId}`);
  }
  return plan;
}

export function getPlanChangeType({
  currentRateCardId,
  newRateCardId,
}: {
  currentRateCardId: string;
  newRateCardId: string;
}): "upgrade" | "downgrade" | "no-change" {
  const currentPlan = getPricingPlanForRateCardId(currentRateCardId);
  const newPlan = getPricingPlanForRateCardId(newRateCardId);
  if (currentPlan.rateCardId === newPlan.rateCardId) {
    return "no-change";
  }
  if (currentPlan.price > newPlan.price) {
    return "downgrade";
  } else if (currentPlan.price < newPlan.price) {
    return "upgrade";
  }
  throw new Error("Invalid plan change");
}
