import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          initials: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          initials: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          initials?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      test_configs: {
        Row: {
          id: string;
          user_id: string;
          test_name: string;
          input_method: string;
          content: string;
          num_questions: number;
          time_settings: any;
          negative_marking: any;
          mime_type: string | null;
          original_filename: string | null;
          selected_language: string | null;
          difficulty_level: number | null;
          custom_instructions: string | null;
          tita_enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          test_name: string;
          input_method: string;
          content: string;
          num_questions: number;
          time_settings: any;
          negative_marking: any;
          mime_type?: string | null;
          original_filename?: string | null;
          selected_language?: string | null;
          difficulty_level?: number | null;
          custom_instructions?: string | null;
          tita_enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          test_name?: string;
          input_method?: string;
          content?: string;
          num_questions?: number;
          time_settings?: any;
          negative_marking?: any;
          mime_type?: string | null;
          original_filename?: string | null;
          selected_language?: string | null;
          difficulty_level?: number | null;
          custom_instructions?: string | null;
          tita_enabled?: boolean;
          created_at?: string;
        };
      };
      test_sessions: {
        Row: {
          id: string;
          user_id: string;
          config_id: string | null;
          test_name: string;
          score_percentage: number;
          total_questions: number;
          correct_answers: number;
          attempted_questions: number;
          questions_data: any;
          was_corrected_by_user: boolean;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          config_id?: string | null;
          test_name: string;
          score_percentage: number;
          total_questions: number;
          correct_answers: number;
          attempted_questions: number;
          questions_data: any;
          was_corrected_by_user?: boolean;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          config_id?: string | null;
          test_name?: string;
          score_percentage?: number;
          total_questions?: number;
          correct_answers?: number;
          attempted_questions?: number;
          questions_data?: any;
          was_corrected_by_user?: boolean;
          completed_at?: string;
          created_at?: string;
        };
      };
      saved_tests: {
        Row: {
          id: string;
          user_id: string;
          test_name: string;
          questions_data: any;
          current_question_index: number;
          time_remaining_seconds: number;
          test_duration_seconds: number;
          config_data: any;
          session_id: string;
          saved_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          test_name: string;
          questions_data: any;
          current_question_index?: number;
          time_remaining_seconds: number;
          test_duration_seconds: number;
          config_data: any;
          session_id: string;
          saved_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          test_name?: string;
          questions_data?: any;
          current_question_index?: number;
          time_remaining_seconds?: number;
          test_duration_seconds?: number;
          config_data?: any;
          session_id?: string;
          saved_at?: string;
        };
      };
    };
  };
}