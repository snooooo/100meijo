/*
  # Add user visits tracking

  1. New Tables
    - `user_visits`: Track user visits to distilleries
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `distillery_id` (uuid, references distilleries)
      - `visit_date` (date)
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on user_visits table
    - Add policies for authenticated users
*/

-- Create user_visits table
CREATE TABLE user_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  distillery_id uuid REFERENCES distilleries(id) ON DELETE CASCADE,
  visit_date date DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, distillery_id)
);

-- Enable RLS
ALTER TABLE user_visits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own visits"
  ON user_visits
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_visits ON user_visits(user_id, distillery_id);