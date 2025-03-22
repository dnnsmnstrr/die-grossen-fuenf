export interface PodcastRanking {
  id: string;
  topic: string;
  episode: string;
  year: number;
  jan_items: string[];
  olli_items: string[];
  guest_name?: string;
  guest_items?: string[];
  created_at: string;
}