import React from 'react';
import { Trophy } from 'lucide-react';
import type { Ranking } from '../data/rankings';

interface RankingCardProps {
  ranking: Ranking;
}

export function RankingCard({ ranking }: RankingCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{ranking.Thema}</h2>
        <div className="flex items-center gap-2 text-gray-600 mt-2">
          <span className="text-sm">{ranking.Folge}</span>
          <span className="text-sm">•</span>
          <span className="text-sm">{ranking.Jahr}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-blue-600">Jan</h3>
          <ol className="space-y-3">
            {ranking.Jan.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mr-3">
                  {5 - index}
                </span>
                <span className="text-gray-700 pt-1">{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-green-600">Olli</h3>
          <ol className="space-y-3">
            {ranking.Olli.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 text-sm font-semibold mr-3">
                  {5 - index}
                </span>
                <span className="text-gray-700 pt-1">{item}</span>
              </li>
            ))}
          </ol>
        </div>

        {ranking.Gast && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-purple-600">
              {ranking.GastName}
            </h3>
            <ol className="space-y-3">
              {ranking.Gast.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 text-sm font-semibold mr-3">
                    {5 - index}
                  </span>
                  <span className="text-gray-700 pt-1">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}