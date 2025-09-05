"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Product {
  id: string
  name: string
  sku: string | null
  stock_quantity: number
  price: number
}

interface StockAdjustmentFormProps {
  products: Product[]
  selectedProduct?: Product | null
}

export function StockAdjustmentForm({ products, selectedProduct }: StockAdjustmentFormProps) {
  const [productId, setProductId] = useState(selectedProduct?.id || "")
  const [adjustmentType, setAdjustmentType] = useState<"restock" | "adjustment">("restock")
  const [quantityChange, setQuantityChange] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const selectedProductData = products.find((p) => p.id === productId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!productId || !quantityChange) {
      setError("Please select a product and enter a quantity")
      setIsSubmitting(false)
      return
    }

    const quantity = Number.parseInt(quantityChange)
    if (isNaN(quantity) || quantity === 0) {
      setError("Please enter a valid quantity")
      setIsSubmitting(false)
      return
    }

    const supabase = createClient()

    try {
      // Record the inventory transaction
      const { error: transactionError } = await supabase.from("inventory_transactions").insert([
        {
          product_id: productId,
          transaction_type: adjustmentType,
          quantity_change: quantity,
          notes: notes.trim() || null,
        },
      ])

      if (transactionError) throw transactionError

      // Update the product stock quantity
      const { error: updateError } = await supabase
        .from("products")
        .update({
          stock_quantity: (selectedProductData?.stock_quantity || 0) + quantity,
        })
        .eq("id", productId)

      if (updateError) throw updateError

      router.push("/dashboard/inventory")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateNewStock = () => {
    if (!selectedProductData || !quantityChange) return null
    const change = Number.parseInt(quantityChange) || 0
    return selectedProductData.stock_quantity + change
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Stock Adjustment</CardTitle>
          <CardDescription>Adjust inventory levels for restocking, corrections, or other changes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} {product.sku && `(${product.sku})`} - Current: {product.stock_quantity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProductData && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Current Product Info</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current Stock:</span>
                    <div className="font-medium">{selectedProductData.stock_quantity}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Unit Price:</span>
                    <div className="font-medium">${selectedProductData.price.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="adjustment-type">Adjustment Type *</Label>
                <Select
                  value={adjustmentType}
                  onValueChange={(value: "restock" | "adjustment") => setAdjustmentType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restock">Restock (Add Inventory)</SelectItem>
                    <SelectItem value="adjustment">Adjustment (Add/Remove)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity Change *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(e.target.value)}
                  placeholder={adjustmentType === "restock" ? "Enter quantity to add" : "Enter +/- quantity"}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {adjustmentType === "restock"
                    ? "Enter positive number to add stock"
                    : "Use positive numbers to add, negative to remove"}
                </p>
              </div>
            </div>

            {selectedProductData && quantityChange && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">New Stock Level:</span>
                  <Badge variant="outline" className="text-base">
                    {calculateNewStock()}
                  </Badge>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for adjustment (e.g., 'Received new shipment', 'Damaged items removed', etc.)"
                rows={3}
              />
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Apply Adjustment"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/inventory">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
