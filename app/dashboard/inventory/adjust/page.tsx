import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { StockAdjustmentForm } from "@/components/inventory/stock-adjustment-form"

interface AdjustInventoryPageProps {
  searchParams: Promise<{ product?: string }>
}

export default async function AdjustInventoryPage({ searchParams }: AdjustInventoryPageProps) {
  const { product: productId } = await searchParams
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch products for the form
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, sku, stock_quantity, price")
    .order("name")

  if (productsError) {
    console.error("Error fetching products:", productsError)
  }

  // If a specific product is selected, find it
  const selectedProduct = productId ? products?.find((p) => p.id === productId) : null

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
            <span className="text-sm text-muted-foreground">Adjust Stock</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-balance">Stock Adjustment</h1>
          <p className="text-muted-foreground">Adjust inventory levels for restocking, corrections, or damage</p>
        </div>

        <StockAdjustmentForm products={products || []} selectedProduct={selectedProduct} />
      </main>
    </div>
  )
}
