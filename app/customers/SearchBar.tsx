'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'

export function SearchBar({ initialQ }: { initialQ: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQ)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (query === initialQ && query === '') return // skip initial empty load
    const timer = setTimeout(() => {
      startTransition(() => {
        router.push(`/customers?q=${query}`)
      })
    }, 250) // Fast 250ms debounce
    return () => clearTimeout(timer)
  }, [query, router, initialQ])

  return (
    <div className="relative">
      <input 
        type="search" 
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search directory..." 
        className="border border-gray-200/60 rounded-xl px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none w-64 bg-white/80 backdrop-blur-3xl placeholder-gray-400 transition-colors shadow-sm"
      />
      {isPending && (
        <div className="absolute right-3 top-2.5 text-indigo-600">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  )
}


