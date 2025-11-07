import { useState, useEffect, useRef } from "react";
import { useStytch, useStytchUser } from "@stytch/react";
import { Link } from "react-router-dom";
import { useBillingManager } from "../billing/useBillingManager";
import { LoadingSpinner } from "./LoadingSpinner";

export function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isManageBillingLoading, setIsManageBillingLoading] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const stytchClient = useStytch();
  const { user } = useStytchUser();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { createCustomerPortalSession } = useBillingManager();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      await stytchClient.session.revoke();
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setIsManageBillingLoading(true);
    try {
      const url = await createCustomerPortalSession({
        returnUrl: `${window.location.href}`,
      });
      window.open(url, "_blank");
      setIsDropdownOpen(false);
    } catch (err) {
      console.error("Error opening billing portal:", err);
    } finally {
      setIsManageBillingLoading(false);
    }
  };

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to="/">
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors cursor-pointer">
            <img src="/turkey.svg" alt="Turkey" className="w-6 h-6" />
            Thanksgiving 2025
          </h1>
        </Link>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            {user?.emails?.[0]?.email || "User"}
            <svg
              className={`w-4 h-4 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={handleManageBilling}
                disabled={isManageBillingLoading || isLogoutLoading}
                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                  isManageBillingLoading || isLogoutLoading
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {isManageBillingLoading && <LoadingSpinner />}
                Manage Billing
              </button>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                disabled={isManageBillingLoading || isLogoutLoading}
                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                  isManageBillingLoading || isLogoutLoading
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {isLogoutLoading && <LoadingSpinner />}
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
