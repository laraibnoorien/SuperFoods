// supabase-client.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUBABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_API!;

// Create a single supabase client for the whole app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
