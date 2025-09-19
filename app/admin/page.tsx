import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function AdminPage() {
  const supabase = await createClient()
  
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/admin/login")
  }
  
  // Check if user is admin
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!adminUser) {
    redirect("/admin/login?error=unauthorized")
  }
  
  // If user is authenticated and is admin, redirect to dashboard
  redirect("/admin/dashboard")
}
