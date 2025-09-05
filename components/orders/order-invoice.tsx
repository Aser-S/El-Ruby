"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Printer, Download } from "lucide-react"

interface OrderInvoiceProps {
  order: {
    id: string
    order_number: string
    total_amount: number
    status: string
    payment_method: string | null
    notes: string | null
    created_at: string
    customers: {
      id: string
      name: string
      email: string | null
      phone: string | null
      address: string | null
    } | null
    order_items: Array<{
      id: string
      quantity: number
      unit_price: number
      total_price: number
      products: {
        id: string
        name: string
        sku: string | null
      }
    }>
  }
}

export function OrderInvoice({ order }: OrderInvoiceProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoice</h1>
          <p className="text-muted-foreground">Order #{order.order_number}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-primary">POS System</h2>
              <p className="text-muted-foreground">Point of Sale & Inventory</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{order.order_number}</div>
              <div className="text-muted-foreground">Invoice Date: {formatDate(order.created_at)}</div>
              <div className="mt-2">{getStatusBadge(order.status)}</div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              {order.customers ? (
                <div className="text-sm space-y-1">
                  <div className="font-medium">{order.customers.name}</div>
                  {order.customers.email && <div>{order.customers.email}</div>}
                  {order.customers.phone && <div>{order.customers.phone}</div>}
                  {order.customers.address && <div className="whitespace-pre-line">{order.customers.address}</div>}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Walk-in Customer</div>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Payment Information:</h3>
              <div className="text-sm space-y-1">
                {order.payment_method ? (
                  <div className="capitalize">Payment Method: {order.payment_method.replace("_", " ")}</div>
                ) : (
                  <div className="text-muted-foreground">Payment method not specified</div>
                )}
                <div>Total Amount: {formatCurrency(order.total_amount)}</div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4">Items:</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Item</th>
                    <th className="text-left p-3">SKU</th>
                    <th className="text-right p-3">Qty</th>
                    <th className="text-right p-3">Unit Price</th>
                    <th className="text-right p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">{item.products.name}</td>
                      <td className="p-3 font-mono text-sm">{item.products.sku || "—"}</td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Total */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="font-semibold mb-2">Notes:</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{order.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
