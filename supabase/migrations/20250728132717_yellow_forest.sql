/*
  # Initial Schema Setup for TestGenius

  1. New Tables
    - `profiles` - User profile information
      - `id` (uuid, references auth.users)
      - `name` (text)
      - `email` (text)
      - `initials` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `test_configs` - Test configuration templates
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `test_name` (text)
      - `input_method` (text)
      - `content` (text)
      - `num_questions` (integer)
      - `time_settings` (jsonb)
      - `negative_marking` (jsonb)
      - `mime_type` (text)
      - `original_filename` (text)
      - `selected_language` (text)
      - `difficulty_level` (integer)
      - `custom_instructions` (text)
      - `tita_enabled` (boolean)
      - `created_at` (timestamp)

    - `test_sessions` - Individual test attempts
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `config_id` (uuid, references test_configs)
      - `test_name` (text)
      - `score_percentage` (numeric)
      - `total_questions` (integer)
      - `correct_answers` (integer)
      - `attempted_questions` (integer)
      - `questions_data` (jsonb)
      - `was_corrected_by_user` (boolean)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)

    - `saved_tests` - Tests saved for later completion
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `test_name` (text)
      - `questions_data` (jsonb)
      - `current_question_index` (integer)
      - `time_remaining_seconds` (integer)
      - `test_duration_seconds` (integer)
      - `config_data` (jsonb)
      - `session_id` (text)
      - `saved_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for leaderboard read access

  3. Functions
    - Function to automatically create profile on user signup
    - Function to calculate leaderboard rankings
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  initials text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create test_configs table
CREATE TABLE IF NOT EXISTS test_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  test_name text NOT NULL,
  input_method text NOT NULL,
  content text NOT NULL,
  num_questions integer NOT NULL,
  time_settings jsonb NOT NULL,
  negative_marking jsonb NOT NULL,
  mime_type text,
  original_filename text,
  selected_language text,
  difficulty_level integer,
  custom_instructions text,
  tita_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create test_sessions table
CREATE TABLE IF NOT EXISTS test_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  config_id uuid REFERENCES test_configs(id) ON DELETE SET NULL,
  test_name text NOT NULL,
  score_percentage numeric(5,2) NOT NULL,
  total_questions integer NOT NULL,
  correct_answers integer NOT NULL,
  attempted_questions integer NOT NULL,
  questions_data jsonb NOT NULL,
  was_corrected_by_user boolean DEFAULT false,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create saved_tests table
CREATE TABLE IF NOT EXISTS saved_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  test_name text NOT NULL,
  questions_data jsonb NOT NULL,
  current_question_index integer NOT NULL DEFAULT 0,
  time_remaining_seconds integer NOT NULL,
  test_duration_seconds integer NOT NULL,
  config_data jsonb NOT NULL,
  session_id text NOT NULL,
  saved_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_tests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Test configs policies
CREATE POLICY "Users can manage own test configs"
  ON test_configs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Test sessions policies
CREATE POLICY "Users can manage own test sessions"
  ON test_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Leaderboard read access for all authenticated users
CREATE POLICY "Authenticated users can read all test sessions for leaderboard"
  ON test_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read all profiles for leaderboard"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Saved tests policies
CREATE POLICY "Users can manage own saved tests"
  ON saved_tests
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name, email, initials)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 1)) || 
    UPPER(LEFT(SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), ' ', 2), 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();