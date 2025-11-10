import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { StytchProvider } from "@stytch/react";
import { StytchUIClient } from "@stytch/vanilla-js";

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
