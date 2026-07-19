import prisma from '@/lib/prisma'
import { QuickAddForm } from './QuickAddForm'

// Clean CSS-only progress bar
const ProgressBar = ({ value, label, color = "bg-[#37352f]" }: { value: number, label: string, color?: string }) => (
  <div className="mb-4">
    <div className="flex justify-between text-xs mb-1.5 font-semibold text-[#37352f]">
      <span>{label}</span>
      <span className="text-[#7c7b77] font-mono">{value}%</span>
    </div>
    <div className="w-full bg-[#e9e9e7] rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
)

export default async function OwnerDashboard() {
  const today = new Date()
  
  // Real database metrics
  const pendingTasks = await prisma.task.count({ where: { status: 'Pending', dueDate: { lte: today } } })
  const doneTasks = await prisma.task.count({ where: { status: 'Done' } })
  const openComplaints = await prisma.complaint.count({ where: { status: 'Open' } })
  const salesExecutivesCount = await prisma.user.count({ where: { role: 'Sales' } })
  const salesLeadsCount = await prisma.interaction.count({ where: { interest: { in: ['New Bike', 'Exchange'] } } })
  
  const totalTasks = pendingTasks + doneTasks
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 100

  // Real performance overview
  const salesUsers = await prisma.user.findMany({
    where: { role: 'Sales' },
    include: {
      tasks: true
    }
  })

  const userPerformances = salesUsers.map(u => {
    const total = u.tasks.length
    const completed = u.tasks.filter(t => t.status === 'Done').length
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0
    return {
      name: u.name,
      rate
    }
  }).sort((a, b) => b.rate - a.rate)

  // Recent complaints
  const recentComplaints = await prisma.complaint.findMany({
    where: { status: 'Open' },
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  return (
    <main className="min-h-screen text-[#37352f] p-6 md:p-12 font-sans bg-white">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Notion Style Header */}
        <header className="space-y-4">
          <div className="text-6xl select-none">📊</div>
          <div className="border-b border-[#e9e9e7] pb-4">
            <h1 className="text-4xl font-bold tracking-tight text-[#37352f]">Owner Dashboard</h1>
            <p className="text-[#7c7b77] text-sm mt-1.5 font-medium">Live dealership metrics and operations overview.</p>
          </div>
        </header>

        {/* Notion Callout style KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-[#f1f1ef]/40 border border-[#e9e9e7] p-5 rounded-lg flex items-start gap-4 hover:bg-[#f1f1ef]/60 transition-colors">
            <div className="text-3xl select-none">🎯</div>
            <div>
              <h3 className="text-[#7c7b77] text-[10px] font-bold uppercase tracking-wider">Completion</h3>
              <p className="text-2xl font-bold mt-1 text-[#37352f]">{completionRate}%</p>
              <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded mt-2 w-max font-semibold">Active Cycle</div>
            </div>
          </div>

          <div className="bg-[#f1f1ef]/40 border border-[#e9e9e7] p-5 rounded-lg flex items-start gap-4 hover:bg-[#f1f1ef]/60 transition-colors">
            <div className="text-3xl select-none">📞</div>
            <div>
              <h3 className="text-[#7c7b77] text-[10px] font-bold uppercase tracking-wider">Calls Left</h3>
              <p className="text-2xl font-bold mt-1 text-[#37352f]">{pendingTasks}</p>
              <div className="text-[10px] text-blue-700 bg-blue-50 border border-blue-100/50 px-2 py-0.5 rounded mt-2 w-max font-semibold">Across {salesExecutivesCount} execs</div>
            </div>
          </div>

          <div className="bg-[#fdf5f5] border border-[#fbd5d5] p-5 rounded-lg flex items-start gap-4 hover:bg-[#fcf0f0] transition-colors">
            <div className="text-3xl select-none">🚨</div>
            <div>
              <h3 className="text-red-700/80 text-[10px] font-bold uppercase tracking-wider">Escalated</h3>
              <p className="text-2xl font-bold mt-1 text-red-700">{openComplaints}</p>
              <div className="text-[10px] text-red-700 bg-red-100/50 border border-red-200/50 px-2 py-0.5 rounded mt-2 w-max font-semibold">Requires action</div>
            </div>
          </div>

          <div className="bg-[#f1f1ef]/40 border border-[#e9e9e7] p-5 rounded-lg flex items-start gap-4 hover:bg-[#f1f1ef]/60 transition-colors">
            <div className="text-3xl select-none">💰</div>
            <div>
              <h3 className="text-[#7c7b77] text-[10px] font-bold uppercase tracking-wider">Sales Leads</h3>
              <p className="text-2xl font-bold mt-1 text-[#37352f]">{salesLeadsCount}</p>
              <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100/50 px-2 py-0.5 rounded mt-2 w-max font-semibold">Exchange/Renewals</div>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Priority Complaints Feed */}
          <div className="col-span-1 lg:col-span-2 border border-[#e9e9e7] rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-bold text-[#37352f] flex items-center gap-2">
              <span>📋</span> Live Complaint Feed
            </h2>
            
            {recentComplaints.length === 0 ? (
              <div className="text-center py-12 text-[#7c7b77] font-medium text-sm bg-[#f1f1ef]/20 rounded-lg border border-dashed border-[#e9e9e7]">
                <span className="text-2xl block mb-2 opacity-50">✨</span>
                No open complaints right now.
              </div>
            ) : (
              <div className="space-y-3">
                {recentComplaints.map(c => (
                  <div key={c.id} className="flex gap-4 p-4 rounded-lg bg-[#fdf5f5] border border-[#fbd5d5] items-start hover:bg-[#fcf0f0] transition-colors">
                    <span className="text-xl shrink-0">🚨</span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#37352f] text-sm">{c.customer.name}</h4>
                      <p className="text-xs text-[#37352f]/90 font-medium leading-relaxed">{c.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {/* Quick Add Customer */}
            <div className="border border-[#e9e9e7] rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-bold text-[#37352f] border-b border-[#e9e9e7] pb-2">
                <span>➕</span> Quick Add
              </h2>
              <QuickAddForm />
            </div>

            {/* Performance Overview */}
            <div className="border border-[#e9e9e7] rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-bold text-[#37352f] border-b border-[#e9e9e7] pb-2">
                <span>⚡</span> Performance
              </h2>
              
              {userPerformances.length > 0 ? (
                <div className="space-y-4">
                  {userPerformances.map((u, i) => {
                    const colors = ["bg-[#37352f]", "bg-[#7c7b77]", "bg-[#4f4f4f]", "bg-[#9c9c9c]"]
                    const color = colors[i % colors.length]
                    return (
                      <ProgressBar 
                        key={u.name} 
                        value={u.rate} 
                        label={u.name + (i === 0 && u.rate > 0 ? " (Top)" : "")} 
                        color={color} 
                      />
                    )
                  })}
                </div>
              ) : (
                <p className="text-[#7c7b77] italic text-xs text-center py-4">No sales executives found.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </main>
  )
}
