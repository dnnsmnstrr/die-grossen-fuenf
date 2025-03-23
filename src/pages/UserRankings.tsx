import { useEffect, useState } from 'react';
import { Clock, ThumbsUp } from 'lucide-react';
import { supabase, type UserRanking } from '../lib/supabase';

export default function UserRankings() {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortByLikes, setSortByLikes] = useState(false);

  useEffect(() => {
    fetchRankings();
  }, [sortByLikes]);

  async function fetchRankings() {
    try {
      const { data, error } = await supabase
        .from('user_rankings')
        .select('*')
        .order(sortByLikes ? 'likes' : 'created_at', { ascending: false });

      if (error) throw error;
      setRankings(data || []);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(rankingId: string) {
    try {
      // First, update the UI optimistically
      setRankings(rankings.map(ranking => 
        ranking.id === rankingId 
          ? { ...ranking, likes: ranking.likes + 1 }
          : ranking
      ));

      // Then, update the database
      const { error } = await supabase
        .from('user_rankings')
        .update({ likes: rankings.find(r => r.id === rankingId)!.likes + 1 })
        .eq('id', rankingId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating likes:', error);
      // Revert the optimistic update if there's an error
      await fetchRankings();
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Community Rankings</h2>
        <button
          onClick={() => {
            setSortByLikes(!sortByLikes);
            // fetchRankings();
          }}
          className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {sortByLikes ? 'Nach Beliebtheit' : 'Neueste zuerst'}
        </button>
      </div>
      
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
                <button 
                  onClick={() => handleLike(ranking.id)}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <ThumbsUp size={16} />
                  <span>{ranking.likes}</span>
                </button>
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