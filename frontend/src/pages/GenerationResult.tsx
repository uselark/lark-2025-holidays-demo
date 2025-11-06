import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CompanyCharacterInfo, getCompanyCharacters } from "../api/api";
import { Header } from "../components/Header";
import { CompanyResult } from "../components/CompanyResult";
import { Footer } from "../components/Footer";
import { useStytchSession } from "@stytch/react";

export function GenerationResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [companyCharacterInfo, setCompanyCharacterInfo] =
    useState<CompanyCharacterInfo | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const { session } = useStytchSession();
  const isLoggedIn = !!session;

  useEffect(() => {
    const fetchGenerationData = async () => {
      if (!id) {
        setError("No generation ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getCompanyCharacters(id);
        setCompanyCharacterInfo(data);
      } catch (err) {
        console.error("Error fetching generation:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load generation data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenerationData();
  }, [id]);

  const handleGenerateNew = () => {
    navigate("/");
  };

  const handleShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {isLoggedIn && <Header />}
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-center">
            <p className="text-xl text-red-600 mb-6">{error}</p>
            <button
              onClick={handleGenerateNew}
              className="text-gray-500 hover:text-gray-700 hover:underline text-lg transition-colors cursor-pointer"
            >
              Go back to dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {isLoggedIn && <Header />}
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!companyCharacterInfo) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {isLoggedIn && <Header />}
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-6">
              No generation data found
            </p>
            <button
              onClick={handleGenerateNew}
              className="text-gray-500 hover:text-gray-700 hover:underline text-lg transition-colors cursor-pointer"
            >
              Go back to dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Thanksgiving Background Image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/fall-thanksgiving-wallpaper.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
        }}
      />

      {/* Animated Thanksgiving Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <style>{`
          @keyframes fallDown {
            0% {
              transform: translateY(-150vh) translateX(0) rotate(0deg);
              opacity: 0;
            }
            5% {
              opacity: 0.3;
            }
            95% {
              opacity: 0.3;
            }
            100% {
              transform: translateY(100vh) translateX(30px) rotate(10deg);
              opacity: 0;
            }
          }
          
          .thanksgiving-icon {
            position: absolute;
            top: 0;
            transform: translateY(-150vh);
            animation: fallDown linear infinite;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
          }
          
          .thanksgiving-icon:nth-child(1) { left: 5%; animation-duration: 25s; animation-delay: -2s; }
          .thanksgiving-icon:nth-child(2) { left: 15%; animation-duration: 30s; animation-delay: -10s; }
          .thanksgiving-icon:nth-child(3) { left: 25%; animation-duration: 27s; animation-delay: -18s; }
          .thanksgiving-icon:nth-child(4) { left: 35%; animation-duration: 32s; animation-delay: -24s; }
          .thanksgiving-icon:nth-child(5) { left: 45%; animation-duration: 28s; animation-delay: -5s; }
          .thanksgiving-icon:nth-child(6) { left: 55%; animation-duration: 31s; animation-delay: -15s; }
          .thanksgiving-icon:nth-child(7) { left: 65%; animation-duration: 26s; animation-delay: -20s; }
          .thanksgiving-icon:nth-child(8) { left: 75%; animation-duration: 29s; animation-delay: -8s; }
          .thanksgiving-icon:nth-child(9) { left: 85%; animation-duration: 28s; animation-delay: -22s; }
          .thanksgiving-icon:nth-child(10) { left: 95%; animation-duration: 30s; animation-delay: -12s; }
          .thanksgiving-icon:nth-child(11) { left: 10%; animation-duration: 27s; animation-delay: -16s; }
          .thanksgiving-icon:nth-child(12) { left: 20%; animation-duration: 29s; animation-delay: -4s; }
          .thanksgiving-icon:nth-child(13) { left: 30%; animation-duration: 31s; animation-delay: -25s; }
          .thanksgiving-icon:nth-child(14) { left: 40%; animation-duration: 26s; animation-delay: -7s; }
          .thanksgiving-icon:nth-child(15) { left: 50%; animation-duration: 28s; animation-delay: -19s; }
          .thanksgiving-icon:nth-child(16) { left: 60%; animation-duration: 30s; animation-delay: -13s; }
          .thanksgiving-icon:nth-child(17) { left: 70%; animation-duration: 32s; animation-delay: -28s; }
          .thanksgiving-icon:nth-child(18) { left: 80%; animation-duration: 27s; animation-delay: -21s; }
          .thanksgiving-icon:nth-child(19) { left: 90%; animation-duration: 29s; animation-delay: -11s; }
          .thanksgiving-icon:nth-child(20) { left: 12%; animation-duration: 31s; animation-delay: -26s; }
          .thanksgiving-icon:nth-child(21) { left: 8%; animation-duration: 28s; animation-delay: -3s; }
          .thanksgiving-icon:nth-child(22) { left: 18%; animation-duration: 30s; animation-delay: -14s; }
          .thanksgiving-icon:nth-child(23) { left: 28%; animation-duration: 26s; animation-delay: -9s; }
          .thanksgiving-icon:nth-child(24) { left: 38%; animation-duration: 29s; animation-delay: -23s; }
          .thanksgiving-icon:nth-child(25) { left: 48%; animation-duration: 27s; animation-delay: -6s; }
          .thanksgiving-icon:nth-child(26) { left: 58%; animation-duration: 31s; animation-delay: -17s; }
          .thanksgiving-icon:nth-child(27) { left: 68%; animation-duration: 28s; animation-delay: -27s; }
          .thanksgiving-icon:nth-child(28) { left: 78%; animation-duration: 30s; animation-delay: -1s; }
          .thanksgiving-icon:nth-child(29) { left: 88%; animation-duration: 29s; animation-delay: -29s; }
          .thanksgiving-icon:nth-child(30) { left: 3%; animation-duration: 27s; animation-delay: -11s; }
        `}</style>

        {[...Array(35)].map((_, i) => {
          // Cycle through Thanksgiving food emojis
          const emojis = ["🦃", "🍂", "🌽", "🥧"];
          const emoji = emojis[i % emojis.length];

          return (
            <div
              key={i}
              className="thanksgiving-icon"
              style={{ fontSize: "40px" }}
            >
              {emoji}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {isLoggedIn && <Header />}
        <main className="flex-1 flex flex-col items-center px-4">
          <div className="pt-10">
            <CompanyResult companyCharacterInfo={companyCharacterInfo} />
            <div className="flex justify-center items-center gap-3 mt-8 mb-8">
              <button
                onClick={handleShareUrl}
                className="text-gray-500 hover:text-gray-700 hover:underline text-lg transition-colors cursor-pointer"
              >
                Share result with others
              </button>
              <span className="text-gray-400 text-lg">or</span>
              <button
                onClick={handleGenerateNew}
                className="text-gray-500 hover:text-gray-700 hover:underline text-lg transition-colors cursor-pointer"
              >
                generate more characters?
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300">
          URL copied to clipboard!
        </div>
      )}
    </div>
  );
}
