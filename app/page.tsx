import { PrismaClient } from '@prisma/client'
import { addCustomer } from './actions'
import { QuickAddForm } from './QuickAddForm'

const prisma = new PrismaClient()

// Ponytail CSS-only progress bar
const ProgressBar = ({ value, label, color = "bg-blue-500" }: { value: number, label: string, color?: string }) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1 text-gray-400 font-medium">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="w-full bg-gray-800 rounded-full h-2">
      <div className={`h-2 rounded-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
)

export default async function OwnerDashboard() {
  const today = new Date()
  
  // Minimal aggregations for V1
  const pendingTasks = await prisma.task.count({ where: { status: 'Pending', dueDate: { lte: today } } })
  const doneTasks = await prisma.task.count({ where: { status: 'Done' } })
  const openComplaints = await prisma.complaint.count({ where: { status: 'Open' } })
  
  const totalTasks = pendingTasks + doneTasks
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 100

  // Recent complaints
  const recentComplaints = await prisma.complaint.findMany({
    where: { status: 'Open' },
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Navigation */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-light tracking-tight">Owner <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Dashboard</span></h1>
            <p className="text-gray-400 text-sm mt-1">Live metrics across the dealership.</p>
          </div>
        </header>

        {/* Top KPIs - Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl backdrop-blur-xl hover:bg-white/[0.04] transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">🎯</div>
            <h3 className="text-gray-400 text-sm font-medium">Completion Rate</h3>
            <p className="text-4xl font-light mt-2">{completionRate}<span className="text-lg text-gray-500 ml-1">%</span></p>
            <p className="text-xs text-green-400 mt-2">No Customer Left Behind</p>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl backdrop-blur-xl hover:bg-white/[0.04] transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">📞</div>
            <h3 className="text-gray-400 text-sm font-medium">Calls Left Today</h3>
            <p className="text-4xl font-light mt-2">{pendingTasks}</p>
            <p className="text-xs text-blue-400 mt-2">Across 12 executives</p>
          </div>

          <div className="bg-white/[0.02] border border-red-500/20 p-6 rounded-2xl backdrop-blur-xl hover:bg-white/[0.04] transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">🚨</div>
            <h3 className="text-red-400/80 text-sm font-medium">Escalated Complaints</h3>
            <p className="text-4xl font-light mt-2 text-red-100">{openComplaints}</p>
            <p className="text-xs text-red-500 mt-2">Requires immediate action</p>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl backdrop-blur-xl hover:bg-white/[0.04] transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">💰</div>
            <h3 className="text-gray-400 text-sm font-medium">Revenue Opportunities</h3>
            <p className="text-4xl font-light mt-2">24</p>
            <p className="text-xs text-yellow-500 mt-2">Exchange & Renewals</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Priority Complaints Feed */}
          <div className="col-span-1 lg:col-span-2 bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-xl p-6">
            <h2 className="text-lg font-medium mb-6">Live Complaint Feed</h2>
            {recentComplaints.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <span className="text-4xl block mb-3">✨</span>
                No open complaints.
              </div>
            ) : (
              <div className="space-y-4">
                {recentComplaints.map(c => (
                  <div key={c.id} className="flex gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 items-start">
                    <div className="bg-red-500/20 text-red-400 p-2 rounded-lg">🚨</div>
                    <div>
                      <h4 className="font-medium text-red-100">{c.customer.name}</h4>
                      <p className="text-sm text-gray-400 mt-1">{c.description}</p>
                      <p className="text-xs text-gray-500 mt-2">Auto-escalated from Service Call</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add Customer */}
          <div className="bg-white/[0.02] border border-blue-500/20 rounded-2xl backdrop-blur-xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">➕</div>
            <h2 className="text-lg font-medium mb-4 text-blue-100">Quick Add Customer</h2>
            <QuickAddForm />
          </div>

          {/* Performance Overview */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-xl p-6">
            <h2 className="text-lg font-medium mb-6">Sales Executive Performance</h2>
            <ProgressBar value={completionRate} label="John (Top Performer)" color="bg-indigo-500" />
            <ProgressBar value={78} label="Rahul" color="bg-blue-500" />
            <ProgressBar value={64} label="Amit" color="bg-yellow-500" />
            <ProgressBar value={32} label="Vikram" color="bg-red-500" />
          </div>

        </div>

      </div>
    </main>
  )
}
