import { createClient } from "@/lib/supabase/server"

type RequireAdminOk = {
  ok: true
  userId: string
}

type RequireAdminErr = {
  ok: false
  status: 401 | 403 | 500
  error: string
}

export type RequireAdminResult = RequireAdminOk | RequireAdminErr

export async function requireAdmin(): Promise<RequireAdminResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, status: 401, error: "Not authenticated." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    return { ok: false, status: 500, error: profileError.message }
  }

  if (!profile?.is_admin) {
    return { ok: false, status: 403, error: "Not authorized." }
  }

  return { ok: true, userId: user.id }
}
