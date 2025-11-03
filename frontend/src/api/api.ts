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
  company_name: string;
  company_yc_url: string;
  company_logo_url: string;
  characters: CompanyCharacter[];
}

// API functions
export const fetchCompanyCharacters = async (
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
