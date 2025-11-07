import { useStytch, useStytchUser } from "@stytch/react";
import { BillingState, getBillingState } from "./larkClient";
import { createCustomerPortalSession } from "../api/api";

export function useBillingManager(): {
  createCustomerPortalSession: ({
    returnUrl,
  }: {
    returnUrl: string;
  }) => Promise<string>;
  getBillingState: () => Promise<BillingState>;
} {
  const stytchClient = useStytch();
  const sessionToken = stytchClient.session.getTokens()?.session_token;
  const { user: stytchUser } = useStytchUser();
  const stytchUserId = stytchUser?.user_id;

  if (!sessionToken || !stytchUserId) {
    throw new Error("No active session. Please log in again.");
  }

  const createCustomerPortalSessionWrapper = async ({
    returnUrl,
  }: {
    returnUrl: string;
  }): Promise<string> => {
    const response = await createCustomerPortalSession({
      returnUrl,
      sessionToken: sessionToken,
    });
    return response.url;
  };

  const getBillingStateWrapper = async (): Promise<BillingState> => {
    return await getBillingState({
      subjectId: stytchUserId,
    });
  };

  return {
    createCustomerPortalSession: createCustomerPortalSessionWrapper,
    getBillingState: getBillingStateWrapper,
  };
}
