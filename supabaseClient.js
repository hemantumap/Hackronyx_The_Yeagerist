import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://skinzibcogjnximrmuwj.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseAnonKey || supabaseAnonKey.includes('paste_your_anon_key')) {
  console.warn('⚠️  Warning: SUPABASE_ANON_KEY is not set in .env yet.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
