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
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"

interface Customer {
  id: string
  name: string
  email: string | null
}

interface Product {
  id: string
  name: string
  price: number
  stock_quantity: number
  sku: string | null
}

interface OrderItem {
  productId: string
  quantity: number
  unitPrice: number
}

interface OrderFormProps {
  customers: Customer[]
  products: Product[]
}

export function OrderForm({ customers, products }: OrderFormProps) {
  const [customerId, setCustomerId] = useState<string>("walk-in")
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [notes, setNotes] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const addOrderItem = () => {
    setOrderItems([...orderItems, { productId: "", quantity: 1, unitPrice: 0 }])
  }

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const updateOrderItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = [...orderItems]
    if (field === "productId" && typeof value === "string") {
      const product = products.find((p) => p.id === value)
      if (product) {
        updatedItems[index] = {
          ...updatedItems[index],
          productId: value,
          unitPrice: product.price,
        }
      }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value }
    }
    setOrderItems(updatedItems)
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (orderItems.length === 0) {
      setError("Please add at least one item to the order")
      setIsSubmitting(false)
      return
    }

    const supabase = createClient()

    try {
      // Create the order
      const orderData = {
        customer_id: customerId === "walk-in" ? null : customerId,
        total_amount: calculateTotal(),
        status: "pending" as const,
        payment_method: paymentMethod || null,
        notes: notes.trim() || null,
      }

      const { data: order, error: orderError } = await supabase.from("orders").insert([orderData]).select().single()

      if (orderError) throw orderError

      // Create order items
      const orderItemsData = orderItems.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.quantity * item.unitPrice,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItemsData)

      if (itemsError) throw itemsError

      router.push(`/dashboard/orders/${order.id}`)
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Select a customer or leave blank for walk-in sale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} {customer.email && `(${customer.email})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>Add products to this order</CardDescription>
                </div>
                <Button type="button" onClick={addOrderItem} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems.map((item, index) => {
                  const product = products.find((p) => p.id === item.productId)
                  return (
                    <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <Label>Product</Label>
                        <Select
                          value={item.productId}
                          onValueChange={(value) => updateOrderItem(index, "productId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - {formatCurrency(product.price)}
                                {product.sku && ` (${product.sku})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {product && product.stock_quantity < item.quantity && (
                          <p className="text-sm text-destructive mt-1">Only {product.stock_quantity} in stock</p>
                        )}
                      </div>
                      <div className="w-24">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="w-32">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateOrderItem(index, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="w-32">
                        <Label>Total</Label>
                        <div className="h-10 flex items-center font-medium">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeOrderItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
                {orderItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No items added yet. Click "Add Item" to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Items ({orderItems.length})</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Order notes (optional)"
                  rows={3}
                />
              </div>

              {error && <div className="text-sm text-destructive">{error}</div>}

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting || orderItems.length === 0}>
                  {isSubmitting ? "Creating..." : "Create Order"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard/orders">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
