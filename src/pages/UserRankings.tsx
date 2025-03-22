import React, { useEffect, useState } from 'react';
import { Clock, ThumbsUp } from 'lucide-react';
import { supabase, type UserRanking } from '../lib/supabase';

export default function UserRankings() {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  async function fetchRankings() {
    try {
      const { data, error } = await supabase
        .from('user_rankings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRankings(data || []);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Community Rankings</h2>
      
      {rankings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Noch keine Community Rankings. Sei der Erste, der eines erstellt!
        </div>
      ) : (
        rankings.map((ranking) => (
          <div key={ranking.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">{ranking.topic}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{new Date(ranking.created_at).toLocaleDateString('de-DE')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp size={16} />
                  <span>{ranking.likes}</span>
                </div>
              </div>
            </div>

            <ol className="space-y-3">
              {ranking.items.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mr-3">
                    {5 - index}
                  </span>
                  <span className="text-gray-700 pt-1">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        ))
      )}
    </div>
  );
}