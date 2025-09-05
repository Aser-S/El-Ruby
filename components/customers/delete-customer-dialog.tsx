"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteCustomerDialogProps {
  customerId: string | null
  onClose: () => void
}

export function DeleteCustomerDialog({ customerId, onClose }: DeleteCustomerDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!customerId) return

    setIsDeleting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("customers").delete().eq("id", customerId)

      if (error) throw error

      router.refresh()
      onClose()
    } catch (error) {
      console.error("Error deleting customer:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={!!customerId} onOpenChange={() => onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Customer</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this customer? This action cannot be undone and will remove all associated
            data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
