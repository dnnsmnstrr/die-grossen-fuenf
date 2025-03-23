interface RankingItemProps {
  index: number;
  content: string;
  color: "blue" | "green" | "purple";
  maxItems?: number;
}

export function RankingItem({
  index,
  content,
  color,
  maxItems = 5,
}: RankingItemProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  const number = Math.max(1, maxItems - (index % maxItems));

  return (
    <li className="flex items-start">
      <span
        className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${colorClasses[color]} text-sm font-semibold mr-3`}
      >
        {number}
      </span>
      <span className="text-gray-700 pt-1">{content}</span>
    </li>
  );
}
