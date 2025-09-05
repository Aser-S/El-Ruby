import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { CustomerForm } from "@/components/customers/customer-form"

export default async function NewCustomerPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-xl font-bold text-primary hover:underline">
              POS System
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/dashboard/customers" className="text-sm text-muted-foreground hover:underline">
              Customers
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">New</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-balance">Add New Customer</h1>
          <p className="text-muted-foreground">Create a new customer record in your database</p>
        </div>

        <CustomerForm />
      </main>
    </div>
  )
}
