/*
  # Create cookie logs table

  1. New Tables
    - `cookie_logs`
      - `id` (uuid, primary key)
      - `cookie_value` (text, not null)
      - `timestamp` (timestamptz, default now())
      
  2. Security
    - Enable RLS on `cookie_logs` table
    - Add policy for authenticated users to insert data
*/

CREATE TABLE IF NOT EXISTS cookie_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cookie_value text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE cookie_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert cookie logs"
  ON cookie_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);