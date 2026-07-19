import prisma from '@/lib/prisma'
import { resolveComplaint } from '../actions'
import Link from 'next/link'
import { getSessionUser } from '../actions/auth'
import { redirect } from 'next/navigation'

export default async function ComplaintsPage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'Owner') {
    redirect('/')
  }
  const openComplaints = await prisma.complaint.findMany({
    where: { status: 'Open' },
    include: { customer: true },
    orderBy: { createdAt: 'desc' }
  })

  const resolvedComplaints = await prisma.complaint.findMany({
    where: { status: 'Resolved' },
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  return (
    <div className="p-4 md:p-8 pb-32 min-h-screen text-gray-900 bg-gray-50/50">
      <header className="mb-10">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <span className="text-red-500">🚨</span> Escalated Complaints
        </h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">Manage and resolve customer issues tracked by the team.</p>
      </header>

      <div className="space-y-12">
        {/* OPEN COMPLAINTS */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
              Needs Attention
            </h2>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
              {openComplaints.length}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {openComplaints.length === 0 ? (
              <p className="text-gray-500 text-sm font-medium p-12 border border-dashed border-gray-200 bg-white/50 rounded-3xl text-center col-span-full">
                ✨ All issues are resolved. Great job!
              </p>
            ) : (
              openComplaints.map(comp => (
                <div key={comp.id} className="bg-white/80 border border-red-100 rounded-3xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow backdrop-blur-xl">
                  <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start">
                    <div>
                      <Link href={`/customers?profile=${comp.customerId}`} className="font-bold text-red-600 hover:text-red-700 text-lg hover:underline block">{comp.customer.name}</Link>
                      <p className="text-xs text-gray-500 mt-1 font-medium">{comp.customer.phone}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">
                      {new Date(comp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="p-6 flex-1">
                    <p className="text-gray-700 text-sm leading-relaxed">{comp.description}</p>
                  </div>
                  <div className="p-6 pt-0 mt-auto">
                    <form action={resolveComplaint}>
                      <input type="hidden" name="complaintId" value={comp.id} />
                      <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-95 shadow-sm text-sm">
                        Mark Resolved
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* RESOLVED COMPLAINTS */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-bold text-gray-500 uppercase tracking-wider">
              Recently Resolved
            </h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200">
              {resolvedComplaints.length}
            </span>
          </div>
          
          <div className="bg-white/80 border border-gray-200/60 overflow-hidden backdrop-blur-xl rounded-3xl shadow-sm">
            <div className="divide-y divide-gray-100">
              {resolvedComplaints.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-sm font-medium">No resolved history.</div>
              ) : (
                resolvedComplaints.map(comp => (
                  <div key={comp.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Link href={`/customers?profile=${comp.customerId}`} className="font-bold text-gray-900 text-sm hover:underline">{comp.customer.name}</Link>
                        <span className="text-[10px] text-green-700 font-bold bg-green-50 border border-green-100 px-2 py-0.5 rounded-md uppercase tracking-wider">RESOLVED</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1">{comp.description}</p>
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider whitespace-nowrap shrink-0 border border-gray-100 px-3 py-1.5 rounded-lg bg-gray-50">
                      Opened: {new Date(comp.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}


