import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { TransactionsTable } from "@/components/inventory/transactions-table"

export default async function InventoryTransactionsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch inventory transactions with product information
  const { data: transactions, error: transactionsError } = await supabase
    .from("inventory_transactions")
    .select(`
      *,
      products (
        id,
        name,
        sku
      )
    `)
    .order("created_at", { ascending: false })

  if (transactionsError) {
    console.error("Error fetching transactions:", transactionsError)
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
            <Link href="/dashboard/inventory" className="text-sm text-muted-foreground hover:underline">
              Inventory
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">Transactions</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-balance">Inventory Transactions</h1>
          <p className="text-muted-foreground">Complete history of all inventory movements</p>
        </div>

        <TransactionsTable transactions={transactions || []} />
      </main>
    </div>
  )
}
