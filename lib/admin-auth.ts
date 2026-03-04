import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface AdminCheck {
  authorized: boolean;
  userId?: string;
  error?: string;
}

/**
 * Verify the current request is from an authenticated admin user.
 * Checks the auth session, then looks up profiles.role via the admin client.
 */
export async function verifyAdmin(): Promise<AdminCheck> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false, error: "Not authenticated" };
  }

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { authorized: false, userId: user.id, error: "Profile not found" };
  }

  if (profile.role !== "admin") {
    return { authorized: false, userId: user.id, error: "Not an admin" };
  }

  return { authorized: true, userId: user.id };
}
