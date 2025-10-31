import { useState } from "react";
import axios from "axios";
import { useStytch, useStytchUser } from "@stytch/react";

interface RouletteNumber {
  number: number;
  color: "red" | "black" | "green";
}

export function Dashboard() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<RouletteNumber | null>(null);
  const [spinningNumber, setSpinningNumber] = useState<number>(0);
  const stytchClient = useStytch();
  const { user } = useStytchUser();

  const spinRoulette = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // Animate through random numbers quickly
    const animationInterval = setInterval(() => {
      setSpinningNumber(Math.floor(Math.random() * 37));
    }, 50);

    try {
      // Get the session token from Stytch session
      const sessionToken = stytchClient.session.getTokens()?.session_token;

      if (!sessionToken) {
        console.error("No session token available");
        clearInterval(animationInterval);
        setIsSpinning(false);
        return;
      }

      // Call the backend API to get the result
      const response = await axios.post<RouletteNumber>(
        "/api/spin",
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );

      // Stop animation after 3 seconds and show the API result
      setTimeout(() => {
        clearInterval(animationInterval);
        setResult(response.data);
        setSpinningNumber(response.data.number);
        setIsSpinning(false);
      }, 3000);
    } catch (error) {
      console.error("Error spinning roulette:", error);
      clearInterval(animationInterval);
      setIsSpinning(false);
    }
  };

  const handleLogout = async () => {
    try {
      await stytchClient.session.revoke();
      // Session revocation will trigger a re-render via useStytchSession
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">🎰 Roulette Game</h1>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-600">
                {user.emails?.[0]?.email || "User"}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
                🎰 Roulette Game
              </h2>

              {/* Roulette Wheel Display */}
              <div className="flex flex-col items-center gap-8">
                {/* Number Display */}
                <div
                  className={`
                    w-48 h-48 rounded-full flex items-center justify-center
                    text-white text-6xl font-bold shadow-2xl transition-all duration-300
                    ${isSpinning ? "animate-spin" : result ? "scale-110" : ""}
                    ${
                      result?.color === "red"
                        ? "bg-red-600"
                        : result?.color === "black"
                        ? "bg-gray-900"
                        : result?.color === "green"
                        ? "bg-green-600"
                        : "bg-gradient-to-br from-indigo-500 to-purple-600"
                    }
                  `}
                >
                  {isSpinning ? spinningNumber : result ? result.number : "?"}
                </div>

                {/* Result Message */}
                {result && !isSpinning && (
                  <div className="text-center animate-fade-in">
                    <p className="text-2xl font-semibold text-gray-900 mb-2">
                      Winner!
                    </p>
                    <p className="text-xl text-gray-600">
                      {result.number} •{" "}
                      <span
                        className={`font-bold ${
                          result.color === "red"
                            ? "text-red-600"
                            : result.color === "black"
                            ? "text-gray-900"
                            : "text-green-600"
                        }`}
                      >
                        {result.color.toUpperCase()}
                      </span>
                    </p>
                  </div>
                )}

                {/* Spin Button */}
                <button
                  onClick={spinRoulette}
                  disabled={isSpinning}
                  className={`
                    px-8 py-4 text-lg font-semibold rounded-lg
                    transition-all duration-200 transform
                    ${
                      isSpinning
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 active:scale-95"
                    }
                    text-white shadow-lg
                  `}
                >
                  {isSpinning ? "Spinning..." : "Spin the Wheel"}
                </button>

                {/* Status Text */}
                {isSpinning && (
                  <p className="text-gray-600 animate-pulse">
                    The wheel is spinning...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
