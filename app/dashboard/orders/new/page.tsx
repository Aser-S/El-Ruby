import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { OrderForm } from "@/components/orders/order-form"

export default async function NewOrderPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch customers and products for the form
  const [customersResult, productsResult] = await Promise.all([
    supabase.from("customers").select("id, name, email").order("name"),
    supabase.from("products").select("id, name, price, stock_quantity, sku").order("name"),
  ])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-xl font-bold text-primary hover:underline">
              POS System
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/dashboard/orders" className="text-sm text-muted-foreground hover:underline">
              Orders
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">New</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-balance">Create New Order</h1>
          <p className="text-muted-foreground">Process a new sale and generate an invoice</p>
        </div>

        <OrderForm customers={customersResult.data || []} products={productsResult.data || []} />
      </main>
    </div>
  )
}
