import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CompanyCharacterInfo } from "../api/api";
import { Header } from "../components/Header";
import { CompanyResult } from "../components/CompanyResult";
import { Footer } from "../components/Footer";

export function GenerationResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [companyCharacterInfo, setCompanyCharacterInfo] =
    useState<CompanyCharacterInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Retrieve the data from localStorage using the id
    if (id) {
      const storedData = localStorage.getItem(`generation-${id}`);
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setCompanyCharacterInfo(data);
        } catch (err) {
          setError("Failed to load generation data");
        }
      } else {
        setError("Generation not found");
      }
    }
  }, [id]);

  const handleGenerateNew = () => {
    navigate("/");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
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

  if (!companyCharacterInfo) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
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

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Animated Ghost Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <style>{`
          @keyframes floatUp {
            0% {
              transform: translateY(100vh) translateX(0) rotate(0deg);
              opacity: 0;
            }
            5% {
              opacity: 0.3;
            }
            95% {
              opacity: 0.3;
            }
            100% {
              transform: translateY(-150vh) translateX(30px) rotate(10deg);
              opacity: 0;
            }
          }
          
          .ghost-icon {
            position: absolute;
            bottom: 0;
            transform: translateY(100vh);
            animation: floatUp linear infinite;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
          }
          
          .ghost-icon:nth-child(1) { left: 5%; animation-duration: 25s; animation-delay: -2s; }
          .ghost-icon:nth-child(2) { left: 15%; animation-duration: 30s; animation-delay: -10s; }
          .ghost-icon:nth-child(3) { left: 25%; animation-duration: 27s; animation-delay: -18s; }
          .ghost-icon:nth-child(4) { left: 35%; animation-duration: 32s; animation-delay: -24s; }
          .ghost-icon:nth-child(5) { left: 45%; animation-duration: 28s; animation-delay: -5s; }
          .ghost-icon:nth-child(6) { left: 55%; animation-duration: 31s; animation-delay: -15s; }
          .ghost-icon:nth-child(7) { left: 65%; animation-duration: 26s; animation-delay: -20s; }
          .ghost-icon:nth-child(8) { left: 75%; animation-duration: 29s; animation-delay: -8s; }
          .ghost-icon:nth-child(9) { left: 85%; animation-duration: 28s; animation-delay: -22s; }
          .ghost-icon:nth-child(10) { left: 95%; animation-duration: 30s; animation-delay: -12s; }
          .ghost-icon:nth-child(11) { left: 10%; animation-duration: 27s; animation-delay: -16s; }
          .ghost-icon:nth-child(12) { left: 20%; animation-duration: 29s; animation-delay: -4s; }
          .ghost-icon:nth-child(13) { left: 30%; animation-duration: 31s; animation-delay: -25s; }
          .ghost-icon:nth-child(14) { left: 40%; animation-duration: 26s; animation-delay: -7s; }
          .ghost-icon:nth-child(15) { left: 50%; animation-duration: 28s; animation-delay: -19s; }
          .ghost-icon:nth-child(16) { left: 60%; animation-duration: 30s; animation-delay: -13s; }
          .ghost-icon:nth-child(17) { left: 70%; animation-duration: 32s; animation-delay: -28s; }
          .ghost-icon:nth-child(18) { left: 80%; animation-duration: 27s; animation-delay: -21s; }
          .ghost-icon:nth-child(19) { left: 90%; animation-duration: 29s; animation-delay: -11s; }
          .ghost-icon:nth-child(20) { left: 12%; animation-duration: 31s; animation-delay: -26s; }
          .ghost-icon:nth-child(21) { left: 8%; animation-duration: 28s; animation-delay: -3s; }
          .ghost-icon:nth-child(22) { left: 18%; animation-duration: 30s; animation-delay: -14s; }
          .ghost-icon:nth-child(23) { left: 28%; animation-duration: 26s; animation-delay: -9s; }
          .ghost-icon:nth-child(24) { left: 38%; animation-duration: 29s; animation-delay: -23s; }
          .ghost-icon:nth-child(25) { left: 48%; animation-duration: 27s; animation-delay: -6s; }
          .ghost-icon:nth-child(26) { left: 58%; animation-duration: 31s; animation-delay: -17s; }
          .ghost-icon:nth-child(27) { left: 68%; animation-duration: 28s; animation-delay: -27s; }
          .ghost-icon:nth-child(28) { left: 78%; animation-duration: 30s; animation-delay: -1s; }
          .ghost-icon:nth-child(29) { left: 88%; animation-duration: 29s; animation-delay: -29s; }
          .ghost-icon:nth-child(30) { left: 3%; animation-duration: 27s; animation-delay: -11s; }
        `}</style>

        {[...Array(35)].map((_, i) => (
          <svg
            key={i}
            className="ghost-icon"
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="#d1d5db"
            opacity="0.4"
          >
            <path d="M12 2C8.134 2 5 5.134 5 9v7c0 .552-.448 1-1 1s-1-.448-1-1v-2c0-.552-.448-1-1-1s-1 .448-1 1v2c0 1.654 1.346 3 3 3 .552 0 1 .448 1 1v1c0 .552.448 1 1 1h.268c.305.591.901 1 1.732 1 .83 0 1.427-.409 1.732-1h3.536c.305.591.901 1 1.732 1 .83 0 1.427-.409 1.732-1H19c.552 0 1-.448 1-1v-1c0-.552.448-1 1-1 1.654 0 3-1.346 3-3v-2c0-.552-.448-1-1-1s-1 .448-1 1v2c0 .552-.448 1-1 1s-1-.448-1-1V9c0-3.866-3.134-7-7-7zm-2 7c0-.552.448-1 1-1s1 .448 1 1-.448 1-1 1-1-.448-1-1zm3 0c0-.552.448-1 1-1s1 .448 1 1-.448 1-1 1-1-.448-1-1zm-1 3c-.552 0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1z" />
          </svg>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center px-4">
          <div className="pt-10">
            <CompanyResult companyCharacterInfo={companyCharacterInfo} />
            <div className="flex justify-center mt-8 mb-8">
              <button
                onClick={handleGenerateNew}
                className="text-gray-500 hover:text-gray-700 hover:underline text-lg transition-colors cursor-pointer"
              >
                Generate more characters?
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
