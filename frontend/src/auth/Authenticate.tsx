import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStytch } from "@stytch/react";
import axios from "axios";
import { Footer } from "../components/Footer";

export function Authenticate() {
  const navigate = useNavigate();
  const stytchClient = useStytch();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticateUser = async () => {
      // Get the token from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!token) {
        setError("No authentication token found");
        return;
      }

      try {
        // Authenticate the OAuth token with Stytch
        await stytchClient.oauth.authenticate(token, {
          session_duration_minutes: 60,
        });

        // Create a customer with the Stytch user ID
        const sessionToken = stytchClient.session.getTokens()?.session_token;
        if (!sessionToken) {
          return;
        }

        await axios.post<string>(
          "/api/customers",
          {},
          {
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          }
        );

        // Redirect to dashboard on success
        navigate("/", { replace: true });
      } catch (err) {
        setError("Authentication failed. Please try again.");
      }
    };

    authenticateUser();
  }, [stytchClient, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error ? (
              <>
                <div className="mb-4 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <h2 className="mt-4 text-2xl font-bold text-gray-900">
                    Authentication Failed
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">{error}</p>
                </div>
                <button
                  onClick={() => navigate("/", { replace: true })}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Try Again
                </button>
              </>
            ) : (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Authenticating...
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Please wait while we log you in
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
