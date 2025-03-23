import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Mic2, Menu, X } from 'lucide-react';
import RankingsList from './pages/RankingsList';
import CreateRanking from './pages/CreateRanking';
import UserRankings from './pages/UserRankings';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between relative">
            <Link to='/' className="flex items-center gap-3">
              <Mic2 size={32} />
              <h1 className="text-3xl font-bold">Die Großen 5</h1>
            </Link>
            
            {/* Mobile menu button */}
            <button 
              className="sm:hidden z-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Navigation menu */}
            <nav className={`${isMenuOpen ? 'block' : 'hidden'} sm:block absolute sm:relative top-full left-0 right-0 sm:top-auto bg-gradient-to-r from-blue-600 to-purple-600 sm:bg-none p-6 pl-[60px] sm:p-0 mt-0 sm:mt-0 z-40 shadow-lg sm:shadow-none -mx-4 sm:mx-0 w-screen sm:w-auto`}>
              <div className="container mx-auto">
                <ul className="flex flex-col sm:flex-row gap-6 sm:p-0">
                  <li>
                    <Link 
                      to="/rankings" 
                      className="text-white hover:text-blue-200 transition block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Rankings
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/create" 
                      className="text-white hover:text-blue-200 transition block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Ranking erstellen
                    </Link>
                  </li>
                </ul>
              </div>
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