import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const isConfigured =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("your_") &&
  !SUPABASE_URL.includes("placeholder");

export function createClient() {
  if (!isConfigured) {
    // Return a dummy client object in demo mode — operations will be no-ops
    return null as unknown as ReturnType<typeof createBrowserClient>;
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { flowType: "implicit" },
  });
}

export { isConfigured as supabaseConfigured };
