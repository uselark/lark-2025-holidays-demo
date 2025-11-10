import { StytchLogin } from "@stytch/react";
import { OAuthProviders, Products } from "@stytch/vanilla-js";
import { Footer } from "../components/Footer";

export function LoginOrSignup() {
  const config = {
    products: [Products.oauth],
    oauthOptions: {
      providers: [{ type: OAuthProviders.Google }],
      loginRedirectURL: `${window.location.origin}/authenticate`,
      signupRedirectURL: `${window.location.origin}/authenticate`,
    },
  };

  const styles = {
    container: {
      width: "100%",
    },
    colors: {
      primary: "#6B7280",
      secondary: "#9CA3AF",
      success: "#22C55E",
      error: "#EF4444",
    },
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    hideHeaderText: true,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
            <img src="/turkey.svg" alt="Turkey" className="w-10 h-10" />
            Lark Thanksgiving 2025
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Sign in for a fun thanksgiving experience!
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <StytchLogin
            config={config}
            styles={styles}
            strings={{
              "login.title": "Lark Thanksgiving 2025!",
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
