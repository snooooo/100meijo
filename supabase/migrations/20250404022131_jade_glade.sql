/*
  # Add Chita bottles

  1. Changes
    - Add Chita bottles to the bottles table
      - Chita (NAS)
      - Chita Single Grain
*/

-- Get Chita distillery ID
DO $$ 
DECLARE
  chita_id uuid;
BEGIN
  SELECT id INTO chita_id FROM distilleries WHERE name = 'Chita Distillery';

  -- Insert Chita bottles
  INSERT INTO bottles (name, age_statement, distillery_id)
  VALUES
    ('知多', 'NAS', chita_id),
    ('知多', 'Single Grain', chita_id);
END $$;