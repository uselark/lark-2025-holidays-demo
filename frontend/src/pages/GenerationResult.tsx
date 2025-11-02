import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CompanyCharacterInfo } from "../api/api";
import { Header } from "../components/Header";
import { CompanyResult } from "../components/CompanyResult";

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
          console.error("Error parsing stored data:", err);
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4">
        <div className="pt-10">
          <CompanyResult companyCharacterInfo={companyCharacterInfo} />
          <div className="flex justify-center mt-8 mb-8">
            <button
              onClick={handleGenerateNew}
              className="text-gray-500 hover:text-gray-700 hover:underline text-lg transition-colors cursor-pointer"
            >
              Generate characters for a new company?
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
