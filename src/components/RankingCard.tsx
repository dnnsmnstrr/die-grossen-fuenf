import { PodcastRanking } from "../lib/types";
import { RankingItem } from "./RankingItem";

interface RankingCardProps {
  ranking: PodcastRanking;
}

export function RankingCard({ ranking }: RankingCardProps) {
  return (
    <div key={ranking.id} className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{ranking.topic}</h2>
        <div className="flex items-center gap-2 text-gray-600 mt-2">
          <span className="text-sm">{ranking.episode}</span>
          <span className="text-sm">•</span>
          <span className="text-sm">{ranking.year}</span>
        </div>
      </div>

      <div
        className={`grid md:grid-cols-2 ${
          ranking.guest_name ? "lg:grid-cols-3" : "lg:grid-cols-2"
        } gap-6`}
      >
        {ranking.jan_items?.length > 0 && (
          <div
            className={`space-y-4 ${
              !ranking.guest_name ? "lg:col-span-1" : ""
            }`}
          >
            <h3 className="text-xl font-semibold text-blue-600">Jan</h3>
            <ol className="space-y-3">
              {ranking.jan_items.map((item, index) => (
                <RankingItem
                  key={index}
                  index={index}
                  content={item}
                  color="blue"
                />
              ))}
            </ol>
          </div>
        )}

        {ranking.olli_items?.length > 0 && (
          <div
            className={`space-y-4 ${
              !ranking.guest_name ? "lg:col-span-1" : ""
            }`}
          >
            <h3 className="text-xl font-semibold text-green-600">Olli</h3>
            <ol className="space-y-3">
              {ranking.olli_items.map((item, index) => (
                <RankingItem
                  key={index}
                  index={index}
                  content={item}
                  color="green"
                />
              ))}
            </ol>
          </div>
        )}

        {ranking.guest_items && ranking.guest_items?.length > 0 && (
          <div className="space-y-4">
            {ranking.guest_name && (
              <h3 className="text-xl font-semibold text-purple-600">
                {ranking.guest_name || "Gast"}
              </h3>
            )}
            <ol className="space-y-3">
              {ranking.guest_items.map((item, index) => (
                <RankingItem
                  key={index}
                  index={index}
                  content={item}
                  color="purple"
                />
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
