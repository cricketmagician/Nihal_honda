'use client'

import { useRef, useState } from 'react'
import { addCustomer } from './actions'

export function QuickAddForm() {
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      const result = await addCustomer(formData)
      if (result?.error) {
        alert(result.error)
      } else {
        alert('Customer added successfully!')
        formRef.current?.reset()
      }
    } catch (err) {
      alert('Error adding customer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Customer Name *</label>
        <input type="text" name="name" required className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="e.g. Rahul Sharma" />
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Mobile Number *</label>
        <input type="tel" name="phone" required className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="e.g. 9876543210" />
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Bike Model *</label>
        <input type="text" name="model" required className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="e.g. Jupiter 125" />
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Purchase Date *</label>
        <input type="date" name="purchaseDate" required className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors text-sm mt-2 disabled:opacity-50">
        {loading ? 'Adding...' : 'Add & Queue Follow-up'}
      </button>
    </form>
  )
}
