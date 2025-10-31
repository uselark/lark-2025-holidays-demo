import { StytchLogin } from "@stytch/react";
import { OAuthProviders, Products } from "@stytch/vanilla-js";

export function LoginOrSignup() {
  const config = {
    products: [Products.oauth],
    oauthOptions: {
      providers: [{ type: OAuthProviders.Google }],
      loginRedirectURL: `${window.location.origin}/authenticate`,
      signupRedirectURL: `${window.location.origin}/authenticate`,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Lark - YC Halloween 2025
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Log in or create an account to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <StytchLogin config={config} />
      </div>
    </div>
  );
}
