import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { StytchProvider } from "@stytch/react";
import { StytchUIClient } from "@stytch/vanilla-js";

// Set favicon and title based on app mode
const APP_MODE = import.meta.env.VITE_APP_MODE;
const faviconPath = APP_MODE === "vibes" ? "/fire.svg" : "/turkey.svg";
const pageTitle = APP_MODE === "vibes" ? "Vibes AI" : "Lark Thanksgiving 2025";

// Update favicon
const faviconLink = document.getElementById("favicon") as HTMLLinkElement;
if (faviconLink) {
  faviconLink.href = faviconPath;
}

// Update page title
document.title = pageTitle;

const stytchOptions = {
  cookieOptions: {
    opaqueTokenCookieName: "stytch_session",
    jwtCookieName: "stytch_session_jwt",
    path: "/",
    availableToSubdomains: false,
  },
};

const stytchPublicKey = import.meta.env.VITE_STYTCH_PUBLIC_TOKEN;

const stytchClient = new StytchUIClient(stytchPublicKey, stytchOptions);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StytchProvider stytch={stytchClient}>
      <App />
    </StytchProvider>
  </React.StrictMode>
);
