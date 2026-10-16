import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// getClaims() checks the session token locally, so unlike getUser() it does not make a round trip to Supabase.
// The display name comes from the token's metadata (Google name or signup name) instead of a separate profiles query.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect("/login");
  const email = typeof claims.email === "string" ? claims.email : "";
  const meta = (claims.user_metadata ?? {}) as { full_name?: string; name?: string };
  return { email, name: meta.full_name || meta.name || email.split("@")[0] || email };
});
