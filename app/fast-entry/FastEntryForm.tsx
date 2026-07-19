'use client'
import { useRef, useState, useEffect } from 'react'
import { addCustomer } from '../actions'
import { CheckCircle2, Zap, AlertTriangle } from 'lucide-react'

export function FastEntryForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const [lastAdded, setLastAdded] = useState<{name: string, model: string} | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
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
    setErrorMsg(null)
    setLastAdded(null)
    
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const model = formData.get('model') as string
    
    try {
      const result = await addCustomer(formData)
      if (result?.error) {
        setErrorMsg(result.error)
        setTimeout(() => setErrorMsg(null), 4000)
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
      setErrorMsg("Something went wrong while saving. Please check your network connection and try again.")
      setTimeout(() => setErrorMsg(null), 4000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-4">
      {lastAdded && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-900 px-5 py-4 rounded-2xl flex items-center justify-between animate-fade-in-down shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <p className="font-medium text-sm">Added <strong className="font-semibold">{lastAdded.name}</strong> ({lastAdded.model})</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">Saved</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-900 px-5 py-4 rounded-2xl flex items-center gap-3 animate-fade-in-down shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="font-medium text-sm">{errorMsg}</p>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200/60 overflow-hidden">
        <div className="px-6 py-6 md:px-10 md:pt-8 md:pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-gray-100 text-gray-800 p-2 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Lightning Mode</h2>
          </div>
          <p className="text-gray-500 text-sm font-medium ml-12">Hands on keyboard. Type &rarr; Tab &rarr; Enter.</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Customer Name</label>
              <input 
                ref={nameRef}
                name="name" 
                type="text" 
                required 
                placeholder="Rahul Singh"
                className="w-full bg-gray-50/50 border border-gray-200 px-4 py-3 rounded-xl focus:bg-white focus:ring-4 focus:ring-gray-900/5 focus:border-gray-900 transition-all outline-none font-medium text-gray-900 placeholder-gray-400" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Phone Number</label>
              <input 
                name="phone" 
                type="tel" 
                required 
                placeholder="10-digit mobile"
                className="w-full bg-gray-50/50 border border-gray-200 px-4 py-3 rounded-xl focus:bg-white focus:ring-4 focus:ring-gray-900/5 focus:border-gray-900 transition-all outline-none font-medium text-gray-900 placeholder-gray-400 font-mono text-[15px]" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Vehicle Model</label>
              <input 
                name="model" 
                type="text" 
                required 
                placeholder="Splendor Plus"
                className="w-full bg-gray-50/50 border border-gray-200 px-4 py-3 rounded-xl focus:bg-white focus:ring-4 focus:ring-gray-900/5 focus:border-gray-900 transition-all outline-none font-medium text-gray-900 placeholder-gray-400" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Purchase Date</label>
              <input 
                name="purchaseDate" 
                type="text" 
                required 
                placeholder="DD/MM/YYYY"
                value={dateStr}
                onChange={handleDateChange}
                className="w-full bg-gray-50/50 border border-gray-200 px-4 py-3 rounded-xl focus:bg-white focus:ring-4 focus:ring-gray-900/5 focus:border-gray-900 transition-all outline-none font-medium text-gray-900 placeholder-gray-400 font-mono text-[15px]" 
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 block">Village / Location</label>
              <input 
                name="village" 
                type="text" 
                placeholder="Optional"
                className="w-full bg-gray-50/50 border border-gray-200 px-4 py-3 rounded-xl focus:bg-white focus:ring-4 focus:ring-gray-900/5 focus:border-gray-900 transition-all outline-none font-medium text-gray-900 placeholder-gray-400" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white rounded-xl py-4 font-semibold text-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-8 shadow-md"
          >
            {loading ? 'Saving...' : 'Save & Next'}
            {!loading && <span className="text-gray-400 text-xl font-normal opacity-80 leading-none">↵</span>}
          </button>
        </form>
      </div>
    </div>
  )
}

