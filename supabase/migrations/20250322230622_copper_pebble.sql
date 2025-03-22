/*
  # Create podcast rankings tables

  1. New Tables
    - `podcast_rankings`
      - `id` (uuid, primary key)
      - `topic` (text, not null)
      - `episode` (text, not null)
      - `year` (integer, not null)
      - `jan_items` (text[], not null)
      - `olli_items` (text[], not null)
      - `guest_name` (text)
      - `guest_items` (text[])
      - Unique constraint on topic, episode, and year to prevent duplicates

  2. Security
    - Enable RLS on `podcast_rankings` table
    - Add policy for public read access
    - Add policy for authenticated users to insert data
*/

CREATE TABLE IF NOT EXISTS podcast_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  episode text NOT NULL,
  year integer NOT NULL,
  jan_items text[] NOT NULL,
  olli_items text[] NOT NULL,
  guest_name text,
  guest_items text[],
  created_at timestamptz DEFAULT now(),
  UNIQUE(topic, episode, year)
);

ALTER TABLE podcast_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read podcast rankings"
  ON podcast_rankings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert podcast rankings"
  ON podcast_rankings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);