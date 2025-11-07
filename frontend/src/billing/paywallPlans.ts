export interface PricingPlan {
  rateCardId: string;
  name: string;
  price: number;
  description: string;
  credits: number;
  features: string[];
}

export const plans: PricingPlan[] = [
  {
    rateCardId: "rc_yFSBwgtdxdcuezEMSnIvggBV",
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
    rateCardId: "rc_bpZnNK1HYe717KiCLhl4X25c",
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
    rateCardId: "rc_GxmptwUrUv5OzI1NdNYQpRNZ",
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
  return rateCardId === "rc_kpB7YTPyQRiOoix0fjusp55E";
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
