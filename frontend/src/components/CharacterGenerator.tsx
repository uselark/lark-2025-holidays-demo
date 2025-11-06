import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStytch } from "@stytch/react";
import { generateCompanyCharacters } from "../api/api";

const loadingMessages = [
  "Generating disney characters (can take upto 30 seconds)...",
  "AI agents are hard at work...",
  "Crafting disney characters...",
  "Preparing the perfect character...",
];

export function CharacterGenerator({ subText }: { subText: React.ReactNode }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<{
    type: "validation" | "other";
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const stytchClient = useStytch();

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex(
          (prevIndex) => (prevIndex + 1) % loadingMessages.length
        );
      }, 8000);

      return () => clearInterval(interval);
    } else {
      setLoadingMessageIndex(0); // Reset to first message when not loading
    }
  }, [isLoading]);

  const validateYCUrl = (url: string): boolean => {
    const ycUrlPattern =
      /^https:\/\/www\.ycombinator\.com\/companies\/[a-zA-Z0-9\-]+$/;
    return ycUrlPattern.test(url);
  };

  const handleSubmit = async () => {
    if (!validateYCUrl(query)) {
      setError({
        type: "validation",
        message: "Please enter a valid YC company URL",
      });
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Get the session token from Stytch
      const sessionToken = stytchClient.session.getTokens()?.session_token;

      if (!sessionToken) {
        setError({
          type: "other",
          message: "No active session. Please log in again.",
        });
        setIsLoading(false);
        return;
      }

      // Call the API endpoint
      const data = await generateCompanyCharacters(query, sessionToken);

      // Generate a random UUID for this generation
      const generationId = data.id;

      // Navigate to the generation result page
      navigate(`/generation/${generationId}`);
    } catch (err) {
      setError({
        type: "other",
        message: "Oops something went wrong :(",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="w-full max-w-2xl pt-[30vh]">
      <h2 className="text-4xl font-normal text-gray-900 text-center mb-12">
        Enter a YC company URL
      </h2>

      {/* Input Container */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="https://www.ycombinator.com/companies/lark"
          className={`w-full px-6 py-4 pr-16 text-base text-gray-900 placeholder-gray-400 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent ${
            error
              ? "border-red-300 focus:ring-red-300"
              : "border-gray-300 focus:ring-gray-300"
          }`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!query.trim() || !!error}
          className="absolute top-1/2 -translate-y-1/2 right-4 w-10 h-10 flex items-center justify-center bg-black hover:bg-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-full transition-colors"
        >
          <svg
            className={`w-5 h-5 ${
              query.trim() && !error ? "text-white" : "text-gray-600"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      </div>

      {subText && !isLoading && !error && (
        <div className="mt-20">{subText}</div>
      )}

      {isLoading && (
        /* Loading State */
        <div className="flex flex-col items-center justify-center mt-16">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p
            key={loadingMessageIndex}
            className="text-lg text-gray-600 animate-fade-in"
          >
            {loadingMessages[loadingMessageIndex]}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center mt-16">
          <div className="px-8 py-6 max-w-md">
            <p className="text-red-600 text-center font-medium">
              {error.message}
            </p>
            {error.type === "other" && (
              <p className="text-sm text-red-500 text-center mt-2">
                Please try again or contact support if the issue persists.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
