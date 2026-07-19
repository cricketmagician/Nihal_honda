'use client'

import { useRef, useState } from 'react'
import { addCustomer } from './actions'

export function QuickAddForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    const formData = new FormData(e.currentTarget)
    try {
      const result = await addCustomer(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setMessage('Customer added successfully!')
        formRef.current?.reset()
      }
    } catch (err) {
      setError('Something went wrong. Please check your network and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl text-center">
          {message}
        </div>
      )}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl text-center">
          {error}
        </div>
      )}
      
      <div>
        <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Customer Name *</label>
        <input type="text" name="name" required className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-gray-950 focus:border-indigo-500 focus:bg-white outline-none transition-colors text-sm" placeholder="Rahul Sharma" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Mobile Number *</label>
        <input type="tel" name="phone" required className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-gray-950 focus:border-indigo-500 focus:bg-white outline-none transition-colors text-sm" placeholder="9876543210" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Bike Model *</label>
        <input type="text" name="model" required className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-gray-950 focus:border-indigo-500 focus:bg-white outline-none transition-colors text-sm" placeholder="Activa 6G" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Purchase Date *</label>
        <input type="date" name="purchaseDate" required className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-gray-950 focus:border-indigo-500 focus:bg-white outline-none transition-colors text-sm" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-95 text-sm mt-4 disabled:opacity-50 shadow-sm">
        {loading ? 'Adding...' : 'Add & Queue Follow-up'}
      </button>
    </form>
  )
}

