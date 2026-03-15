import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-6 transition-all duration-300">
      <div className="w-full max-w-6xl">
        {/* Başlık Bölümü */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Finansal Takip Merkezi
          </h1>
          <p className="text-gray-500 font-medium">
            Bütçeni kontrol altında tut.
          </p>
        </header>

        {/* Ana İçerik */}
        <main>
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
