'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '../actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const result = await loginAction(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      if (result.role === 'Sales') {
        router.push('/queue')
      } else {
        router.push('/') // Owner goes to dashboard
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-[#0A0A0A] p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <span className="text-3xl font-bold">H</span>
          </div>
          <h1 className="text-2xl font-bold">Honda Dealership</h1>
          <p className="text-gray-400 mt-2 text-sm">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Account ID</label>
            <input 
              name="username" 
              type="text" 
              required
              placeholder="e.g. owner or sales"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors text-black font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Password</label>
            <input 
              name="password" 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors text-black font-medium"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0A0A0A] hover:bg-black text-white font-bold py-4 rounded-xl active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
