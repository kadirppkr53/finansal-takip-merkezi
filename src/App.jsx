import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <main className="flex-1">
        <Dashboard />
      </main>
      <footer className="py-6 text-center text-[11px] text-gray-400">
        Verileriniz yalnızca bu tarayıcıda saklanır · Finansal Takip Merkezi
      </footer>
    </div>
  );
}
