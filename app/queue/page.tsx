import { PrismaClient } from '@prisma/client'
import { logInteraction } from '../actions'

const prisma = new PrismaClient()

import { CallForm } from './CallForm'

import { getSessionUser } from '../actions/auth'

export default async function QueuePage() {
  const user = await getSessionUser()
  if (!user) return <div className="p-10">No users found. Please seed the DB.</div>

  const today = new Date()
  const tasks = await prisma.task.findMany({
    where: { userId: user.id, status: 'Pending', dueDate: { lte: today } },
    include: { customer: { include: { vehicles: true } } },
    orderBy: { dueDate: 'asc' },
    take: 1 // Only show one at a time for focus
  })

  const task = tasks[0]

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8 font-sans pb-32">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Daily Queue</h1>
          <p className="text-gray-500 text-sm">{tasks.length} tasks remaining today</p>
        </div>
      </header>

      {!task ? (
        <div className="bg-green-50 text-green-800 p-8 rounded-xl text-center border border-green-200 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Queue Cleared! 🎉</h2>
          <p>Excellent work. Take a break.</p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Customer Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{task.customer.name}</h2>
                <div className="flex items-center gap-2 mt-2 text-gray-300">
                  <span className="text-lg">📞</span>
                  <span className="font-mono">{task.customer.phone}</span>
                </div>
              </div>
              
              <a 
                href={`tel:${task.customer.phone}`} 
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/30 flex items-center gap-2 active:scale-95 w-full sm:w-auto justify-center"
              >
                <span className="text-xl">📞</span> CALL NOW
              </a>
            </div>
            
            <div className="mt-6 flex gap-2 relative z-10">
              {task.customer.vehicles.map(v => (
                <span key={v.id} className="bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
                  🏍 {v.model}
                </span>
              ))}
            </div>
          </div>

          {/* Action Form */}
          <CallForm taskId={task.id} customerId={task.customer.id} userId={user.id} />
        </div>
      )}
    </main>
  )
}
