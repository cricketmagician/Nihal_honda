import { PrismaClient } from '@prisma/client'
import { logInteraction } from '../actions'

const prisma = new PrismaClient()

import { CallForm } from './CallForm'

export default async function QueuePage() {
  const user = await prisma.user.findFirst()
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
          <div className="bg-blue-600 p-6 text-white">
            <h2 className="text-2xl font-bold">{task.customer.name}</h2>
            <p className="text-blue-100 mt-1">📞 {task.customer.phone}</p>
            <div className="mt-4 flex gap-2">
              {task.customer.vehicles.map(v => (
                <span key={v.id} className="bg-blue-800/50 px-3 py-1 rounded-full text-xs font-medium">
                  {v.model}
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
