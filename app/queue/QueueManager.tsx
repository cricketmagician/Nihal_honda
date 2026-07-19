'use client'

import { useState } from 'react'
import { CallForm } from './CallForm'

export function QueueManager({ tasks, userId }: { tasks: any[], userId: string }) {
  const [activeTask, setActiveTask] = useState(tasks[0])

  if (!activeTask) {
    return (
      <div className="bg-emerald-50 text-emerald-800 p-8 rounded-3xl border border-emerald-100 text-center max-w-2xl mx-auto shadow-sm mx-5 md:mx-auto mt-6">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Queue Cleared! 🎉</h2>
        <p className="font-medium text-emerald-700/80">Excellent work. Take a break.</p>
      </div>
    )
  }

  // Tasks that are not the currently active one
  const remainingTasks = tasks.filter(t => t.id !== activeTask.id)

  return (
    <>
      <header className="mb-6 mt-6 md:mt-0 px-5 md:px-0">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-900">Daily Queue</h1>
        <p className="text-gray-500 text-sm font-medium mt-1">{tasks.length} tasks remaining today</p>
      </header>

      {remainingTasks.length > 0 && (
        <div className="mb-6 px-5 md:px-0">
          <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Up Next</h3>
          <div className="flex overflow-x-auto gap-3 pb-2 snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {remainingTasks.map(t => (
              <div 
                key={t.id} 
                onClick={() => setActiveTask(t)}
                className="cursor-pointer min-w-[140px] sm:min-w-[160px] bg-white border border-gray-200/80 rounded-2xl p-4 snap-start shadow-sm shrink-0 opacity-80 hover:opacity-100 hover:shadow-md transition-all active:scale-95"
              >
                <p className="font-bold text-gray-900 truncate text-sm">{t.customer.name}</p>
                <p className="text-xs text-gray-500 truncate mt-1">📞 {t.customer.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl md:border border-gray-200/80 md:shadow-xl md:shadow-black/5 overflow-hidden md:rounded-3xl border-y sm:border-y-0">
        {/* Customer Header */}
        <div className="bg-gray-50/50 p-5 md:p-8 text-gray-900 relative border-b border-gray-100">
          <div className="absolute top-0 right-0 opacity-[0.03] transform translate-x-4 -translate-y-4 pointer-events-none">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 relative z-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">{activeTask.customer.name}</h2>
              <div className="flex items-center gap-2 mt-2 text-gray-500 font-medium text-sm md:text-base">
                <span>📞</span>
                <span>{activeTask.customer.phone}</span>
              </div>
            </div>
            
            <a 
              href={`tel:${activeTask.customer.phone}`} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-3.5 font-semibold text-base transition-all flex items-center gap-2 active:scale-95 w-full sm:w-auto justify-center shadow-sm"
            >
              <span>📞</span> Call Now
            </a>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-2 relative z-10">
            {activeTask.customer.vehicles.map((v: any) => (
              <div key={v.id} className="flex flex-wrap gap-2">
                <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 shadow-sm flex items-center gap-1.5">
                  🏍 {v.model}
                </span>
                <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 shadow-sm flex items-center gap-1.5">
                  📅 Purchase Date: {new Date(v.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Form with key to reset state when task changes */}
        <CallForm key={activeTask.id} taskId={activeTask.id} customerId={activeTask.customer.id} userId={userId} />
      </div>
    </>
  )
}
