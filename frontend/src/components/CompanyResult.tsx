import { CompanyCharacterInfo } from "../api/api";

export function CompanyResult({
  companyCharacterInfo,
}: {
  companyCharacterInfo: CompanyCharacterInfo;
}) {
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Company Logo and Name Section */}
      <div className="flex flex-col items-center mb-8">
        <img
          src={companyCharacterInfo.company_logo_url}
          alt={companyCharacterInfo.company_name}
          className="w-32 h-32 object-contain mb-4 rounded-xl"
        />
        <a
          href={companyCharacterInfo.company_yc_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xl font-bold text-blue-600 hover:text-blue-800 hover:underline"
        >
          {companyCharacterInfo.company_name}
        </a>
      </div>

      {/* Founders Character Cards - Horizontal Layout */}
      <div className="flex flex-wrap justify-center gap-6">
        {companyCharacterInfo.characters.map((character) => (
          <div
            key={character.founder_name}
            className="flex flex-col items-center bg-white rounded-lg shadow-lg p-6 w-80 border-2 border-gray-200 hover:shadow-xl transition-shadow"
          >
            {/* Character Image */}
            <img
              src={character.character_image_url}
              alt={character.character_name}
              className="w-64 h-64 object-cover rounded-lg mb-4"
            />

            {/* Founder Name */}
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {character.founder_name}
            </h2>

            {/* Character Name and Reasoning */}
            <p className="text-gray-600 text-center">
              <span className="font-medium text-gray-800">
                {character.character_name}
              </span>
              {" - "}
              {character.reasoning}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
