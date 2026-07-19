import prisma from '@/lib/prisma'
import { getSessionUser } from '../actions/auth'
import { QueueManager } from './QueueManager'

export default async function QueuePage() {
  const user = await getSessionUser()
  if (!user) return <div className="p-10">No users found. Please seed the DB.</div>

  const isOwner = user.role === 'Owner'
  const today = new Date()
  
  const allPendingTasks = await prisma.task.findMany({
    where: isOwner 
      ? { status: 'Pending', dueDate: { lte: today } }
      : { userId: user.id, status: 'Pending', dueDate: { lte: today } },
    include: { customer: { include: { vehicles: true } } },
    orderBy: { dueDate: 'asc' }
  })

  return (
    <main className="min-h-screen text-gray-900 px-0 md:px-8 py-0 md:py-8 pb-32">
      <QueueManager 
        key={allPendingTasks.map(t => t.id).join('-')} 
        tasks={allPendingTasks} 
        userId={user.id} 
      />
    </main>
  )
}

