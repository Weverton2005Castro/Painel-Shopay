import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vevmsnfmdwtqtouzclfk.supabase.co';
const supabaseAnonKey = 'sb_publishable_2PZGTkGcfGiKs-wBKC5qPQ_tC_YnUDc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
