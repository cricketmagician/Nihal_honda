'use client'
import { useRef, useState, useEffect } from 'react'
import { addCustomer } from '../actions'

export function FastEntryForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const [lastAdded, setLastAdded] = useState<{name: string, model: string} | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateStr, setDateStr] = useState(new Date().toLocaleDateString('en-GB'))

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2)
    if (val.length > 5) val = val.slice(0, 5) + '/' + val.slice(5)
    setDateStr(val.slice(0, 10))
  }

  // Focus on mount
  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const model = formData.get('model') as string
    
    try {
      const result = await addCustomer(formData)
      if (result?.error) {
        alert(result.error)
        setLoading(false)
        return
      }

      setLastAdded({ name, model })
      formRef.current?.reset()
      setDateStr(new Date().toLocaleDateString('en-GB')) // reset date
      nameRef.current?.focus()
      
      // Clear success message after 3 seconds
      setTimeout(() => setLastAdded(null), 3000)
    } catch (err) {
      alert("Error adding customer. Check required fields.")
    } finally {
      setLoading(false)
    }
  }

  // Allow pressing Enter from any input to submit (default browser behavior handles this mostly, but good to ensure)
  return (
    <div className="max-w-2xl mx-auto mt-8">
      {lastAdded && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center justify-between animate-fade-in-down">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <p className="font-medium text-sm">Successfully added <strong>{lastAdded.name}</strong> ({lastAdded.model})</p>
          </div>
          <span className="text-xs text-green-600 font-bold">Saved!</span>
        </div>
      )}

      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 px-5 py-5 md:px-8 md:py-6 text-white">
          <h2 className="text-xl font-bold">⚡ Lightning Fast Entry</h2>
          <p className="text-blue-100 text-sm mt-1">Keep your hands on the keyboard. Type &rarr; Tab &rarr; Enter.</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-5 md:p-8 space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">Customer Name</label>
              <input 
                ref={nameRef}
                name="name" 
                type="text" 
                required 
                placeholder="e.g. Rahul Singh"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium text-gray-900" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">Phone Number</label>
              <input 
                name="phone" 
                type="tel" 
                required 
                placeholder="10-digit mobile"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium text-gray-900 font-mono" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">Vehicle Model</label>
              <input 
                name="model" 
                type="text" 
                required 
                placeholder="e.g. Splendor Plus"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium text-gray-900" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">Purchase Date</label>
              <input 
                name="purchaseDate" 
                type="text" 
                required 
                placeholder="DD/MM/YYYY"
                value={dateStr}
                onChange={handleDateChange}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium text-gray-900 font-mono" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">Village / Location</label>
              <input 
                name="village" 
                type="text" 
                placeholder="Optional"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium text-gray-900" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white rounded-xl py-4 font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Saving...' : 'Save & Next (Press Enter)'}
            {!loading && <span className="text-gray-400 font-normal text-sm ml-2">↵</span>}
          </button>
        </form>
      </div>
    </div>
  )
}
