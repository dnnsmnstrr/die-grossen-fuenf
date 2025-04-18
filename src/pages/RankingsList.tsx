import { useState, useMemo, useEffect } from "react";
import { Filter, ChevronDown } from "lucide-react";
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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
        ranking.episode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ranking.guest_name?.toLowerCase().includes(searchQuery.toLowerCase());

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
        <div
          className={`flex ${
            isFiltersOpen ? "mb-4" : ""
          } justify-between items-center`}
        >
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
          >
            <Filter size={20} className="text-gray-500" />
            <h2 className="text-lg font-semibold">Filter</h2>
            <ChevronDown
              size={20}
              className={`text-gray-500 transform transition-transform duration-200 ${
                isFiltersOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Search bar - hidden on mobile, shown between buttons on desktop */}
          <div className="hidden md:block flex-1 mx-4 max-w-md">
            <input
              type="text"
              className="w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nach Thema oder Folge suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="sort"
              className="hidden sm:block text-sm font-medium text-gray-700"
            >
              Sortierung
            </label>
            <select
              id="sort"
              className="w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value as "newest" | "oldest")
              }
            >
              <option value="newest">Neueste zuerst</option>
              <option value="oldest">Älteste zuerst</option>
            </select>
          </div>
        </div>

        {isFiltersOpen && (
          <div className="grid md:grid-cols-8 gap-4">
            {/* Search bar - shown only on mobile */}
            <div className="md:hidden col-span-full">
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

            <div className="md:col-span-4">
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Jahr
              </label>
              <select
                id="year"
                className="w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
                value={yearFilter}
                onChange={(e) => {
                  setYearFilter(e.target.value);
                  setSearchQuery("");
                }}
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
                onChange={(e) => {
                  setGuestFilter(e.target.value);
                  setSearchQuery("");
                }}
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
        )}
      </div>

      <div className="space-y-6">
        {filteredRankings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Keine Ergebnisse gefunden
          </div>
        ) : (
          filteredRankings.map((ranking) => (
            <RankingCard ranking={ranking} />
          ))
        )}
      </div>
    </>
  );
}
