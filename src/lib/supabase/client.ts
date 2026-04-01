import { createBrowserClient } from '@supabase/ssr'

// TODO: replace with generated types: npx supabase gen types typescript --local > src/types/database.ts
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
