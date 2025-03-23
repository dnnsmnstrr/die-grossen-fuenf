import { useState, useMemo, useEffect } from "react";
import { Filter } from "lucide-react";
import { RankingCard } from "../components/RankingCard";
import { supabase } from "../lib/supabase";
import type { PodcastRanking } from "../lib/types";

export default function RankingsList() {
  const [yearFilter, setYearFilter] = useState<string>("");
  const [guestFilter, setGuestFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [rankings, setRankings] = useState<PodcastRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  async function fetchRankings() {
    try {
      const { data, error } = await supabase
        .from("podcast_rankings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRankings(data || []);
    } catch (error) {
      console.error("Error fetching rankings:", error);
    } finally {
      setLoading(false);
    }
  }

  const years = useMemo(() => {
    return Array.from(new Set(rankings.map((r) => r.year)))
      .sort()
      .reverse();
  }, [rankings]);

  const guests = useMemo(() => {
    return Array.from(
      new Set(
        rankings.filter((r) => r.guest_name).map((r) => r.guest_name as string)
      )
    ).sort();
  }, [rankings]);

  const filteredRankings = useMemo(() => {
    let results = rankings.filter((ranking) => {
      const matchesYear = !yearFilter || ranking.year.toString() === yearFilter;
      const matchesGuest = !guestFilter || ranking.guest_name === guestFilter;
      const matchesSearch =
        !searchQuery ||
        ranking.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ranking.episode.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesYear && matchesGuest && matchesSearch;
    });

    // Apply sorting
    results = [...results].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === "newest"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

    return results;
  }, [rankings, yearFilter, guestFilter, searchQuery, sortOrder]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex mb-4 justify-between">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <h2 className="text-lg font-semibold">Filter</h2>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sortierung
            </label>
            <select
              id="sort"
              className="w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            >
              <option value="newest">Neueste zuerst</option>
              <option value="oldest">Älteste zuerst</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Suche
            </label>
            <input
              type="text"
              id="search"
              className="w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nach Thema oder Folge suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <label
              htmlFor="year"
              className="block text-sm font-medium  text-gray-700 mb-1"
            >
              Jahr
            </label>
            <select
              id="year"
              className="w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="">Alle Jahre</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <label
              htmlFor="guest"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gast
            </label>
            <select
              id="guest"
              className="w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
              value={guestFilter}
              onChange={(e) => setGuestFilter(e.target.value)}
            >
              <option value="">Alle Gäste</option>
              {guests.map((guest) => (
                <option key={guest} value={guest}>
                  {guest}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredRankings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Keine Ergebnisse gefunden
          </div>
        ) : (
          filteredRankings.map((ranking) => (
            <div key={ranking.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {ranking.topic}
                </h2>
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <span className="text-sm">{ranking.episode}</span>
                  <span className="text-sm">•</span>
                  <span className="text-sm">{ranking.year}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-blue-600">Jan</h3>
                  <ol className="space-y-3">
                    {ranking.jan_items.map((item, index) => (
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
                    {ranking.olli_items.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 text-sm font-semibold mr-3">
                          {5 - index}
                        </span>
                        <span className="text-gray-700 pt-1">{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {ranking.guest_name && ranking.guest_items && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-purple-600">
                      {ranking.guest_name}
                    </h3>
                    <ol className="space-y-3">
                      {ranking.guest_items.map((item, index) => (
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
          ))
        )}
      </div>
    </>
  );
}
