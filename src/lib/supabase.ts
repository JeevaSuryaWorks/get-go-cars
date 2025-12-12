import { createClient } from '@supabase/supabase-js';
import { verifyJsCorp } from '@/core/js-corp-lock';

// Ensure core is loaded before initializing external connections
verifyJsCorp();

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
