import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vevmsnfmdwtqtouzclfk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2PZGTkGcfGiKs-wBKC5qPQ_tC_YnUDc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
