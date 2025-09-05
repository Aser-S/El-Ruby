"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, TrendingDown, RotateCcw } from "lucide-react"

interface Transaction {
  id: string
  transaction_type: "restock" | "sale" | "adjustment"
  quantity_change: number
  notes: string | null
  created_at: string
  products: {
    id: string
    name: string
    sku: string | null
  }
}

interface TransactionsTableProps {
  transactions: Transaction[]
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.products.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.products.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || transaction.transaction_type === typeFilter

    return matchesSearch && matchesType
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "restock":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "sale":
        return <TrendingDown className="h-4 w-4 text-blue-600" />
      case "adjustment":
        return <RotateCcw className="h-4 w-4 text-orange-600" />
      default:
        return null
    }
  }

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "restock":
        return <Badge className="bg-green-100 text-green-800">Restock</Badge>
      case "sale":
        return <Badge className="bg-blue-100 text-blue-800">Sale</Badge>
      case "adjustment":
        return <Badge className="bg-orange-100 text-orange-800">Adjustment</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const getQuantityDisplay = (transaction: Transaction) => {
    const isPositive = transaction.quantity_change > 0
    const color = isPositive ? "text-green-600" : "text-red-600"
    const sign = isPositive ? "+" : ""

    return (
      <span className={`font-medium ${color}`}>
        {sign}
        {transaction.quantity_change}
      </span>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>{transactions.length} total transactions recorded</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by product name, SKU, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="restock">Restock</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== "all"
                  ? "No transactions found matching your filters."
                  : "No inventory transactions recorded yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity Change</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.products.name}</TableCell>
                      <TableCell className="font-mono text-sm">{transaction.products.sku || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.transaction_type)}
                          {getTransactionBadge(transaction.transaction_type)}
                        </div>
                      </TableCell>
                      <TableCell>{getQuantityDisplay(transaction)}</TableCell>
                      <TableCell className="max-w-xs truncate">{transaction.notes || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(transaction.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
