import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const createClient = (req: Request) => {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Handle auth headers
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const [type, token] = authHeader.split(' ');
    if (type === 'Bearer' && token) {
      supabase.auth.setSession({
        access_token: token,
        refresh_token: '' // We don't have the refresh token in the header
      });
    }
  }

  return supabase;
};
