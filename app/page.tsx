import { PrismaClient } from '@prisma/client'
import { addCustomer } from './actions'
import { QuickAddForm } from './QuickAddForm'

const prisma = new PrismaClient()

// Clean CSS-only progress bar
const ProgressBar = ({ value, label, color = "bg-indigo-500" }: { value: number, label: string, color?: string }) => (
  <div className="mb-5">
    <div className="flex justify-between text-sm mb-2 font-semibold text-gray-700">
      <span>{label}</span>
      <span className="text-gray-500">{value}%</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${value}%` }}></div>
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
    <main className="min-h-screen text-gray-900 p-4 md:p-8 font-sans bg-gray-50/50">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Navigation */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">Owner Dashboard</h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">Live dealership metrics and overview</p>
          </div>
        </header>

        {/* Top KPIs - Soft Glass */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white/80 border border-gray-200/60 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden backdrop-blur-xl group">
            <div className="absolute top-0 right-0 p-6 opacity-20 text-6xl group-hover:scale-110 transition-transform duration-500">🎯</div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Completion</h3>
            <p className="text-5xl md:text-6xl font-bold tracking-tight mt-4 text-gray-900">{completionRate}<span className="text-2xl text-gray-400 ml-1">%</span></p>
            <p className="text-xs text-emerald-600 mt-3 font-semibold uppercase tracking-wide bg-emerald-50 w-max px-2 py-1 rounded-md">No Customer Left Behind</p>
          </div>

          <div className="bg-white/80 border border-gray-200/60 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden backdrop-blur-xl group">
            <div className="absolute top-0 right-0 p-6 opacity-20 text-6xl group-hover:scale-110 transition-transform duration-500">📞</div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Calls Left</h3>
            <p className="text-5xl md:text-6xl font-bold tracking-tight mt-4 text-gray-900">{pendingTasks}</p>
            <p className="text-xs text-blue-600 mt-3 font-semibold uppercase tracking-wide bg-blue-50 w-max px-2 py-1 rounded-md">Across 12 executives</p>
          </div>

          <div className="bg-red-50/80 border border-red-100 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden backdrop-blur-xl group">
            <div className="absolute top-0 right-0 p-6 opacity-20 text-6xl text-red-500 group-hover:scale-110 transition-transform duration-500">🚨</div>
            <h3 className="text-red-600/80 text-xs font-bold uppercase tracking-wider">Escalated</h3>
            <p className="text-5xl md:text-6xl font-bold tracking-tight mt-4 text-red-700">{openComplaints}</p>
            <p className="text-xs text-red-600 mt-3 font-semibold uppercase tracking-wide bg-red-100 w-max px-2 py-1 rounded-md">Requires immediate action</p>
          </div>

          <div className="bg-white/80 border border-gray-200/60 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden backdrop-blur-xl group">
            <div className="absolute top-0 right-0 p-6 opacity-20 text-6xl group-hover:scale-110 transition-transform duration-500">💰</div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Revenue</h3>
            <p className="text-5xl md:text-6xl font-bold tracking-tight mt-4 text-gray-900">24</p>
            <p className="text-xs text-amber-600 mt-3 font-semibold uppercase tracking-wide bg-amber-50 w-max px-2 py-1 rounded-md">Exchange & Renewals</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Priority Complaints Feed */}
          <div className="col-span-1 lg:col-span-2 bg-white/80 border border-gray-200/60 rounded-3xl backdrop-blur-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight mb-6 text-gray-900">Live Complaint Feed</h2>
            {recentComplaints.length === 0 ? (
              <div className="text-center py-16 text-gray-500 font-medium text-sm bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <span className="text-4xl block mb-3 opacity-50">✨</span>
                No open complaints right now.
              </div>
            ) : (
              <div className="space-y-4">
                {recentComplaints.map(c => (
                  <div key={c.id} className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-white border border-red-100 items-start hover:shadow-md transition-shadow shadow-sm">
                    <div className="bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg text-xs tracking-wider uppercase border border-red-100 flex-shrink-0">
                      🚨 Escalated
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{c.customer.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 md:gap-6">
            {/* Quick Add Customer */}
            <div className="bg-white/80 border border-gray-200/60 rounded-3xl backdrop-blur-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
              <h2 className="text-xl font-bold tracking-tight mb-6 text-gray-900">Quick Add</h2>
              <QuickAddForm />
            </div>

            {/* Performance Overview */}
            <div className="bg-white/80 border border-gray-200/60 rounded-3xl backdrop-blur-xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight mb-6 text-gray-900">Performance</h2>
              <div className="space-y-2">
                <ProgressBar value={completionRate} label="John (Top)" color="bg-indigo-500" />
                <ProgressBar value={78} label="Rahul" color="bg-emerald-500" />
                <ProgressBar value={64} label="Amit" color="bg-amber-500" />
                <ProgressBar value={32} label="Vikram" color="bg-rose-500" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  )
}
