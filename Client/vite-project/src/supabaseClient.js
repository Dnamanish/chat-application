import {
  createClient,
  SupabaseClient,
} from "@supabase/supabase-js/dist/index.cjs";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
