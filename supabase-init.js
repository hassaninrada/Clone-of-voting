

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Supabase Project URL and Anon Key
const supabaseUrl = 'https://adqmsvilzisqwttkpzww.supabase.co'
const supabaseKey = 'sb_publishable_l0_0YEWU1V4zdyho8UxHKQ_BZq4Fxql'
export const supabase = createClient(supabaseUrl, supabaseKey);

