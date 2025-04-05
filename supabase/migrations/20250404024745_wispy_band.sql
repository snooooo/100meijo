/*
  # Fix user_visits RLS policies

  1. Changes
    - Drop existing RLS policies for user_visits table
    - Create new policies that properly handle user authentication and user_id
    
  2. Security
    - Enable RLS on user_visits table
    - Add policies for authenticated users to manage their own visits
    - Ensure user_id is set to auth.uid() for new records
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own visits" ON user_visits;

-- Create new policies
CREATE POLICY "Enable insert for authenticated users only"
ON public.user_visits
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Enable read for users own visits"
ON public.user_visits
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

CREATE POLICY "Enable update for users own visits"
ON public.user_visits
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Enable delete for users own visits"
ON public.user_visits
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
);