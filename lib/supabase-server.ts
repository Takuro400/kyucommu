import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfiguredServer =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("your_") &&
  !SUPABASE_URL.includes("placeholder");

export function createServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    supabaseConfiguredServer ? SUPABASE_URL : "https://placeholder.supabase.co",
    supabaseConfiguredServer ? SUPABASE_ANON_KEY : "placeholder",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            );
          } catch {}
        },
      },
    }
  );
}
