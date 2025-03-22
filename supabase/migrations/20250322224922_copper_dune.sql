/*
  # Create user rankings tables

  1. New Tables
    - `user_rankings`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with timezone)
      - `topic` (text)
      - `items` (text array) - Stores the 5 ranked items
      - `user_id` (uuid) - References auth.users
      - `likes` (integer) - Number of likes for this ranking

  2. Security
    - Enable RLS on `user_rankings` table
    - Add policies for:
      - Anyone can read rankings
      - Authenticated users can create rankings
      - Users can only update/delete their own rankings
*/

CREATE TABLE user_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  topic text NOT NULL,
  items text[] NOT NULL CHECK (array_length(items, 1) = 5),
  user_id uuid REFERENCES auth.users(id),
  likes integer DEFAULT 0
);

ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rankings
CREATE POLICY "Anyone can read rankings"
  ON user_rankings
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to create rankings
CREATE POLICY "Authenticated users can create rankings"
  ON user_rankings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own rankings
CREATE POLICY "Users can update own rankings"
  ON user_rankings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own rankings
CREATE POLICY "Users can delete own rankings"
  ON user_rankings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);