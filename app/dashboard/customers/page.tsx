import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { CustomersTable } from "@/components/customers/customers-table"

export default async function CustomersPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch customers
  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })

  if (customersError) {
    console.error("Error fetching customers:", customersError)
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
            <span className="text-sm text-muted-foreground">Customers</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {data.user.email}</span>
            <form action="/auth/logout" method="post">
              <Button variant="ghost" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Customer Management</h1>
            <p className="text-muted-foreground">Manage your customer database and track balances</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/customers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
            <CardDescription>{customers?.length || 0} customers in your database</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomersTable customers={customers || []} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
