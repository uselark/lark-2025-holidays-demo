import { CompanyCharacterInfo } from "../api/api";

export function CompanyResult({
  companyCharacterInfo,
}: {
  companyCharacterInfo: CompanyCharacterInfo;
}) {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      {/* Company Logo and Name Section */}
      <div className="flex flex-col items-center mb-12">
        <div className="mb-6">
          <div className="bg-white rounded-2xl ring-1 ring-gray-200">
            <img
              src={companyCharacterInfo.company_logo_url}
              alt={companyCharacterInfo.company_name}
              className="w-24 h-24 object-contain rounded-lg"
            />
          </div>
        </div>
        <a
          href={companyCharacterInfo.company_yc_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-3xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200"
        >
          {companyCharacterInfo.company_name}
        </a>
      </div>

      {/* Founders Character Cards - Modern Layout */}
      <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
        {companyCharacterInfo.characters.map((character, index) => (
          <div
            key={character.founder_name}
            className="group relative w-full sm:w-[360px]"
            style={{
              animationDelay: `${index * 0.1}s`,
              animation: "fadeInUp 0.6s ease-out forwards",
              opacity: 0,
            }}
          >
            <style>{`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>

            {/* Subtle gradient glow on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 rounded-2xl opacity-0 group-hover:opacity-30 blur-sm transition duration-300"></div>

            {/* Card content */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl ring-1 ring-gray-200 hover:ring-2 hover:ring-blue-300 transition-all duration-300">
              {/* Character Image */}
              <div className="flex justify-center items-center bg-gray-50 p-6">
                <img
                  src={character.character_image_url}
                  alt={character.character_name}
                  className="w-64 h-64 object-cover rounded-lg"
                />
              </div>

              {/* Text content */}
              <div className="p-6 space-y-3">
                {/* Founder Name with animated underline */}
                <div className="relative inline-block">
                  <h2 className="text-2xl font-bold text-gray-900 inline-block">
                    {character.founder_name}
                  </h2>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></div>
                </div>

                {/* Character Name with badge style */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700">
                    {character.character_name}
                  </span>
                </div>

                {/* Reasoning with better typography */}
                <p className="text-gray-600 leading-relaxed text-base">
                  {character.reasoning}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
