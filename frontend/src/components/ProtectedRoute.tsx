import { useStytchSession } from "@stytch/react";
import { LoginOrSignup } from "../auth/LoginOrSignup";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session } = useStytchSession();

  // If no session exists, show the login page
  if (!session) {
    return <LoginOrSignup />;
  }

  // If session exists, render the protected content
  return <>{children}</>;
}
