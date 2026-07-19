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
      className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-4 py-2 rounded-xl transition-all border border-rose-100 active:scale-95 disabled:opacity-50"
    >
      {isPending ? 'Deleting...' : 'Delete Customer'}
    </button>
  )
}


