import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

import { SetupClient } from "./setup-client"

export const dynamic = "force-dynamic"

export default async function SetupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.is_admin) {
    redirect("/admin")
  }

  return <SetupClient email={user.email ?? ""} />
}
