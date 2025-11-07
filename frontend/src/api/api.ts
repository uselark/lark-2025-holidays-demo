// Base API URL constant
const API_BASE_URL = "http://localhost:8001";

// Types
export interface CompanyCharacter {
  founder_name: string;
  character_name: string;
  character_image_url: string;
  reasoning: string;
}

export interface CompanyCharacterInfo {
  id: string;
  company_name: string;
  company_yc_url: string;
  company_logo_url: string;
  characters: CompanyCharacter[];
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

  return response.json();
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
