import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { OrderInvoice } from "@/components/orders/order-invoice"

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch order with customer and items
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      *,
      customers (
        id,
        name,
        email,
        phone,
        address
      ),
      order_items (
        id,
        quantity,
        unit_price,
        total_price,
        products (
          id,
          name,
          sku
        )
      )
    `)
    .eq("id", id)
    .single()

  if (orderError || !order) {
    notFound()
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
            <Link href="/dashboard/orders" className="text-sm text-muted-foreground hover:underline">
              Orders
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">{order.order_number}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <OrderInvoice order={order} />
      </main>
    </div>
  )
}
