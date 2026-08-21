import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:" || !parsedUrl.hostname) {
      console.error("Supabase configuration invalid: expected HTTPS URL");
      return null;
    }
  } catch {
    console.error("Supabase configuration invalid: malformed URL");
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
