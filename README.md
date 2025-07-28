# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:** Node.js, Supabase Project

## Setup

1. **Supabase Setup:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API to get your project URL and anon key
   - Run the SQL migration in `supabase/migrations/create_initial_schema.sql` in your Supabase SQL editor
   - Configure Google OAuth (optional):
     - Go to Authentication > Providers
     - Enable Google provider
     - Add your Google OAuth client ID and secret

2. **Environment Variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase URL and anon key
   - Add your Gemini API key

3. **Install and Run:**
   ```bash
   npm install
   npm run dev
   ```

## Features

- **Authentication:** Email/password and Google OAuth
- **Test Generation:** Create tests from documents, syllabus, or topics
- **Test History:** All completed tests are saved to your profile
- **Saved Tests:** Save tests in progress and resume later
- **Leaderboard:** Compare your performance with other users
- **Real-time Sync:** All data synced across devices

## Database Schema

The app uses the following main tables:
- `profiles` - User profile information
- `test_configs` - Test configuration templates
- `test_sessions` - Completed test attempts
- `saved_tests` - Tests saved for later completion

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.