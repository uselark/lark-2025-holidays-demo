import { useStytch, useStytchUser } from "@stytch/react";
import { BillingState, getBillingState } from "./larkClient";

export function useBillingManager(): {
  getBillingState: () => Promise<BillingState>;
} {
  const stytchClient = useStytch();
  const sessionToken = stytchClient.session.getTokens()?.session_token;
  const { user: stytchUser } = useStytchUser();
  const stytchUserId = stytchUser?.user_id;

  if (!sessionToken || !stytchUserId) {
    throw new Error("No active session. Please log in again.");
  }

  const getBillingStateWrapper = async (): Promise<BillingState> => {
    return await getBillingState({
      subjectId: stytchUserId,
    });
  };

  return {
    getBillingState: getBillingStateWrapper,
  };
}
