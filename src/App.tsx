import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Mic2 } from 'lucide-react';
import RankingsList from './pages/RankingsList';
import CreateRanking from './pages/CreateRanking';
import UserRankings from './pages/UserRankings';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to='/' className="flex items-center gap-3">
              <Mic2 size={32} />
              <h1 className="text-3xl font-bold">Die Großen 5</h1>
            </Link>
            <nav>
              <ul className="flex gap-6">
                <li>
                  <Link to="/rankings" className="text-white hover:text-blue-200 transition">
                    Rankings
                  </Link>
                </li>
                <li>
                  <Link to="/create" className="text-white hover:text-blue-200 transition">
                    Ranking erstellen
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <p className="text-lg opacity-90 mt-4">
            Definiert von Böhmermann und Schulz
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<RankingsList />} />
          <Route path="/create" element={<CreateRanking />} />
          <Route path="/rankings" element={<UserRankings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;