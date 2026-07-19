'use client'

import { useTransition } from 'react'
import { deleteCustomerAction } from '../actions'

export function DeleteCustomerButton({ customerId, customerName }: { customerId: string, customerName: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm(`Are you sure you want to completely delete ${customerName} and all their records (vehicles, calls, etc.)? This action cannot be undone.`)) {
      startTransition(async () => {
        const formData = new FormData()
        formData.append('customerId', customerId)
        await deleteCustomerAction(formData)
        window.location.href = '/customers'
      })
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold border border-red-200 transition-colors"
    >
      {isPending ? 'Deleting...' : 'Delete Customer'}
    </button>
  )
}
