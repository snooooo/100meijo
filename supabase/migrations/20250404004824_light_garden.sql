/*
  # Initial Schema Setup for Whisky Distillery Tracker

  1. New Tables
    - `regions`: Whisky regions (e.g., Highland, Speyside)
    - `sub_regions`: Sub-regions within main regions
    - `distilleries`: Distillery information including location
    - `bottles`: Whisky bottles produced by distilleries
    - `user_notes`: User notes for distilleries and bottles
    - `user_tastings`: User tasting records

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow public read access to regions" ON regions;
    DROP POLICY IF EXISTS "Allow public read access to sub_regions" ON sub_regions;
    DROP POLICY IF EXISTS "Allow public read access to distilleries" ON distilleries;
    DROP POLICY IF EXISTS "Allow insert/update for authenticated users for distilleries" ON distilleries;
    DROP POLICY IF EXISTS "Allow read access to all authenticated users for bottles" ON bottles;
    DROP POLICY IF EXISTS "Allow insert/update for authenticated users for bottles" ON bottles;
    DROP POLICY IF EXISTS "Allow read access to all authenticated users for notes" ON user_notes;
    DROP POLICY IF EXISTS "Allow insert/update for authenticated users for notes" ON user_notes;
    DROP POLICY IF EXISTS "Users can read their own tastings" ON user_tastings;
    DROP POLICY IF EXISTS "Users can manage their own tastings" ON user_tastings;
EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_tastings;
DROP TABLE IF EXISTS user_notes;
DROP TABLE IF EXISTS bottles;
DROP TABLE IF EXISTS distilleries;
DROP TABLE IF EXISTS sub_regions;
DROP TABLE IF EXISTS regions;

-- Drop existing enum if it exists
DROP TYPE IF EXISTS bottle_status;

-- Create regions table
CREATE TABLE regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to regions"
  ON regions
  FOR SELECT
  TO public
  USING (true);

-- Create sub_regions table
CREATE TABLE sub_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region_id uuid REFERENCES regions(id),
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sub_regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to sub_regions"
  ON sub_regions
  FOR SELECT
  TO public
  USING (true);

-- Create distilleries table
CREATE TABLE distilleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region_id uuid REFERENCES regions(id),
  sub_region_id uuid REFERENCES sub_regions(id),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_distilleries_location ON distilleries (latitude, longitude);

ALTER TABLE distilleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to distilleries"
  ON distilleries
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow insert/update for authenticated users for distilleries"
  ON distilleries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create bottles table with status enum
CREATE TYPE bottle_status AS ENUM ('not_tasted', 'tasted', 'owned');

CREATE TABLE bottles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age_statement text,
  distillery_id uuid REFERENCES distilleries(id) ON DELETE CASCADE,
  status bottle_status DEFAULT 'not_tasted',
  tasting_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_bottles_distillery ON bottles (distillery_id);

ALTER TABLE bottles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all authenticated users for bottles"
  ON bottles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert/update for authenticated users for bottles"
  ON bottles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create user_notes table
CREATE TABLE user_notes (
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

CREATE INDEX idx_notes_references ON user_notes (distillery_id, bottle_id);

ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all authenticated users for notes"
  ON user_notes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert/update for authenticated users for notes"
  ON user_notes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create user_tastings table
CREATE TABLE user_tastings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  distillery_id uuid REFERENCES distilleries(id),
  expression text NOT NULL,
  notes text,
  tasting_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_tastings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own tastings"
  ON user_tastings
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tastings"
  ON user_tastings
  FOR ALL
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert initial data for Japanese distilleries
INSERT INTO regions (id, name, description)
VALUES 
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Japan', 'Japanese whisky distilleries');

INSERT INTO distilleries (id, name, region_id, latitude, longitude, description)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Yamazaki Distillery', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 34.8932, 135.6742, 'Japan''s first whisky distillery, established in 1923'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Hakushu Distillery', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 35.8219, 138.5053, 'A distillery surrounded by forests at the foot of Mt. Kaikomagatake'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Yoichi Distillery', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 43.1871, 140.7846, 'Nikka''s first distillery, known for its peated whisky'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Miyagikyo Distillery', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 38.4456, 140.8906, 'Nikka''s second distillery, producing lighter and more elegant whisky');

-- Insert initial bottles data
INSERT INTO bottles (name, age_statement, distillery_id)
VALUES
  -- Yamazaki
  ('Yamazaki', 'NAS', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('Yamazaki', '12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('Yamazaki', '18', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('Yamazaki', '25', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  
  -- Hakushu
  ('Hakushu', 'NAS', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
  ('Hakushu', '12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
  ('Hakushu', '18', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
  ('Hakushu', '25', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
  
  -- Yoichi
  ('Yoichi', 'NAS', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
  ('Yoichi', 'Single Malt', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
  ('Yoichi', '10', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
  ('Yoichi', '15', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
  
  -- Miyagikyo
  ('Miyagikyo', 'NAS', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'),
  ('Miyagikyo', 'Single Malt', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'),
  ('Miyagikyo', '10', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'),
  ('Miyagikyo', '15', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14');