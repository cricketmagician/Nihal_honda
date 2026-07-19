'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '../actions/auth'
import Image from 'next/image'

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
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gray-50">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/login-bg.png" 
          alt="Login Background" 
          fill
          priority
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      </div>

      {/* Glassmorphic Form Card */}
      <div className="relative z-10 max-w-md w-full bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/60 overflow-hidden p-8 sm:p-10">
        <div className="text-center mb-10 mt-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-red-600 to-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30 text-white transform rotate-3">
            <span className="text-3xl font-black -rotate-3">H</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Honda Dealership</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">Sign in to your workspace</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50/80 backdrop-blur-md text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-2 shadow-sm">
              <span className="text-lg">⚠️</span> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Account ID</label>
            <input 
              name="username" 
              type="text" 
              required
              placeholder="e.g. owner or sales"
              className="w-full px-5 py-4 bg-white/60 focus:bg-white rounded-2xl border border-gray-200/60 focus:border-gray-300 focus:ring-4 focus:ring-gray-900/5 outline-none transition-all text-gray-900 font-medium placeholder-gray-400 shadow-sm inset-shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
            <input 
              name="password" 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-white/60 focus:bg-white rounded-2xl border border-gray-200/60 focus:border-gray-300 focus:ring-4 focus:ring-gray-900/5 outline-none transition-all text-gray-900 font-medium placeholder-gray-400 shadow-sm inset-shadow-sm"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white font-semibold text-lg py-4 mt-4 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-70 shadow-lg shadow-gray-900/20 flex justify-center items-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <span className="text-gray-400 leading-none">→</span>}
          </button>
        </form>
      </div>
    </div>
  )
}
