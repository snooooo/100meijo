/*
  # Add distillery tour information

  1. Changes
    - Add tour availability and information columns to distilleries table
    - Add Chita distillery as an example of a non-visitable distillery
    - Update existing distilleries with tour information

  2. Security
    - No changes to existing security policies
*/

-- Add tour information columns to distilleries
ALTER TABLE distilleries
ADD COLUMN IF NOT EXISTS tours_available boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tour_info text;

-- Update existing distilleries with tour information
UPDATE distilleries
SET 
  tours_available = true,
  tour_info = CASE name
    WHEN 'Yamazaki Distillery' THEN '要予約。ガイド付きツアーで蒸留所の歴史や製造工程を学べます。試飲も含まれます。'
    WHEN 'Hakushu Distillery' THEN '要予約。自然豊かな環境で蒸留所見学とウイスキーの試飲が楽しめます。'
    WHEN 'Yoichi Distillery' THEN '予約不要。無料で見学可能。試飲コーナーでは有料で様々なウイスキーを楽しめます。'
    WHEN 'Miyagikyo Distillery' THEN '予約推奨。見学ツアーでは製造工程の説明と試飲を体験できます。'
  END
WHERE name IN ('Yamazaki Distillery', 'Hakushu Distillery', 'Yoichi Distillery', 'Miyagikyo Distillery');

-- Add Chita distillery
INSERT INTO distilleries (
  name,
  region_id,
  latitude,
  longitude,
  description,
  tours_available,
  tour_info
)
VALUES (
  'Chita Distillery',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  34.8744,
  136.8167,
  'サントリーのグレーンウイスキー蒸留所。知多半島の工業地帯に位置し、高品質なグレーンウイスキーを生産。',
  false,
  '工場地帯にある蒸留所のため、一般見学は受け付けていません。'
);