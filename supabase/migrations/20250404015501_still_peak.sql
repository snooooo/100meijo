/*
  # Update bottle status enum to include combined state

  1. Changes
    - Add 'owned_and_tasted' to bottle_status enum to support combined state
    - This allows bottles to be both owned and tasted simultaneously

  2. Security
    - No changes to existing security policies
*/

ALTER TYPE bottle_status ADD VALUE IF NOT EXISTS 'owned_and_tasted';