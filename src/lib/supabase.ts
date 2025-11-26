import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type Flashcard = {
  id: string;
  note_id: string;
  front: string;
  back: string;
  created_at: string;
};

export type Quiz = {
  id: string;
  note_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  created_at: string;
};
