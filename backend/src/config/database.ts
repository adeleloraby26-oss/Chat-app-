import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required");
}

// Service-role client for backend (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const connectDB = async () => {
  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error) throw error;
    console.log("✅ Supabase connected successfully");
  } catch (error) {
    console.error("❌ Supabase connection error:", error);
    process.exit(1);
  }
};
