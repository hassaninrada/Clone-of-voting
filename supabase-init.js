
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://adqmsvilzisqwttkpzww.supabase.co'

const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcW1zdmlsemlzcXd0dGtwend3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4Mjk0MzIsImV4cCI6MjA5MzQwNTQzMn0.RLeuxuloss2NtcjZfNcQI96FPx2_vusTFel_7aLS_yE'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: false
    }
  }
)
