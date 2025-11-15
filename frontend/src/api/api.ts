// Base API URL constant
const API_BASE_URL = import.meta.env.VITE_API_URL;
const APP_MODE = import.meta.env.VITE_APP_MODE;
// Types
export interface CompanyCharacter {
  founder_name: string;
  character_name: string;
  character_image_url: string;
  reasoning: string;
}

export type CompanyCharacterInfo =
  | YcCompanyCharacterInfo
  | CompanyVibesCharacterInfo;
export interface YcCompanyCharacterInfo {
  type: "yc_company";
  id: string;
  company_name: string;
  company_yc_url: string;
  company_logo_url: string;
  characters: CompanyCharacter[];
}

export interface CompanyVibesCharacterInfo {
  type: "company_vibes";
  id: string;
  company_name: string;
  character_name: string;
  character_image_url: string;
  reasoning: string;
}

// API functions
export const generateCompanyCharacters = async (
  companyUrl: string,
  sessionToken: string
): Promise<CompanyCharacterInfo> => {
  const response = await fetch(`${API_BASE_URL}/api/company_characters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({
      company_url: companyUrl,
      mode: APP_MODE === "vibes" ? "any_url" : "yc_company",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Request failed with status ${response.status}`
    );
  }

  const jsonResponse = await response.json();
  if (APP_MODE === "vibes") {
    return {
      ...jsonResponse,
      type: "company_vibes",
    } as CompanyVibesCharacterInfo;
  } else {
    return {
      ...jsonResponse,
      type: "yc_company",
    } as YcCompanyCharacterInfo;
  }
};

export const getCompanyCharacters = async (
  generationId: string
): Promise<CompanyCharacterInfo> => {
  const response = await fetch(
    `${API_BASE_URL}/api/company_characters/${generationId}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Request failed with status ${response.status}`
    );
  }

  const jsonResponse = await response.json();
  if (APP_MODE === "vibes") {
    return {
      ...jsonResponse,
      type: "company_vibes",
    } as CompanyVibesCharacterInfo;
  } else {
    return {
      ...jsonResponse,
      type: "yc_company",
    } as YcCompanyCharacterInfo;
  }
};

export const getOrCreateCustomer = async ({
  stytchUserId,
  sessionToken,
}: {
  stytchUserId: string;
  sessionToken: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/api/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ stytch_user_id: stytchUserId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Request failed with status ${response.status}`
    );
  }

  return response.json();
};

export interface UpdateSubscriptionResponse {
  type: "success" | "checkout_action_required";
  checkout_url: string | null;
}

export const updateSubscription = async ({
  subscriptionId,
  newRateCardId,
  checkoutSuccessCallbackUrl,
  checkoutCancelCallbackUrl,
  sessionToken,
}: {
  subscriptionId: string;
  newRateCardId: string;
  checkoutSuccessCallbackUrl: string;
  checkoutCancelCallbackUrl: string;
  sessionToken: string;
}): Promise<UpdateSubscriptionResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/update_subscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({
      subscription_id: subscriptionId,
      new_rate_card_id: newRateCardId,
      checkout_success_callback_url: checkoutSuccessCallbackUrl,
      checkout_cancel_callback_url: checkoutCancelCallbackUrl,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Request failed with status ${response.status}`
    );
  }

  return response.json();
};

export interface CustomerPortalSessionResponse {
  url: string;
}

export const createCustomerPortalSession = async ({
  sessionToken,
  returnUrl,
}: {
  sessionToken: string;
  returnUrl: string;
}): Promise<CustomerPortalSessionResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/customer_portal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ return_url: returnUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Request failed with status ${response.status}`
    );
  }

  return response.json();
};
