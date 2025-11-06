import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CharacterGenerator } from "../components/CharacterGenerator";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4">
        <CharacterGenerator
          subText={"We allow unlimited character generations for now. Enjoy!"}
        />
      </main>
      <Footer />
    </div>
  );
}
