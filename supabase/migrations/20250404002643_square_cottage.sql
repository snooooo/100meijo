/*
  # Initial Whisky Tracking Schema

  1. New Tables
    - `distilleries`: Stores distillery information
      - Basic info (name, region, country, coordinates)
      - Visit status and date
      - Tasted bottle count
    - `bottles`: Stores bottle information
      - Name, age statement
      - Distillery reference
      - Tasting status and date
    - `user_notes`: Stores user notes for distilleries and bottles
      - Reference to either distillery or bottle
      - Note content and timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create enum for bottle status
CREATE TYPE bottle_status AS ENUM ('not_tasted', 'tasted', 'owned');

-- Create distilleries table
CREATE TABLE IF NOT EXISTS distilleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region text NOT NULL,
  country text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  visited boolean DEFAULT false,
  visit_date timestamptz,
  tasted_bottles_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bottles table
CREATE TABLE IF NOT EXISTS bottles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age_statement text,
  distillery_id uuid REFERENCES distilleries(id) ON DELETE CASCADE,
  status bottle_status DEFAULT 'not_tasted',
  tasting_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_notes table
CREATE TABLE IF NOT EXISTS user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  distillery_id uuid REFERENCES distilleries(id) ON DELETE CASCADE,
  bottle_id uuid REFERENCES bottles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT note_reference CHECK (
    (distillery_id IS NOT NULL AND bottle_id IS NULL) OR
    (distillery_id IS NULL AND bottle_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE distilleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bottles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to all authenticated users for distilleries"
  ON distilleries FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users for bottles"
  ON bottles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users for notes"
  ON user_notes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert/update for authenticated users for distilleries"
  ON distilleries FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow insert/update for authenticated users for bottles"
  ON bottles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow insert/update for authenticated users for notes"
  ON user_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_distilleries_location ON distilleries(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_bottles_distillery ON bottles(distillery_id);
CREATE INDEX IF NOT EXISTS idx_notes_references ON user_notes(distillery_id, bottle_id);