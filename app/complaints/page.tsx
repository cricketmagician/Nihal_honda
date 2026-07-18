import { PrismaClient } from '@prisma/client'
import { resolveComplaint } from '../actions'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function ComplaintsPage() {
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
    <div className="p-8 pb-32 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-red-500">⚠️</span> Active Escalations & Complaints
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage and resolve customer issues tracked by the team.</p>
      </header>

      <div className="space-y-12">
        {/* OPEN COMPLAINTS */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            Needs Attention 
            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{openComplaints.length}</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {openComplaints.length === 0 ? (
              <p className="text-gray-500 italic text-sm">All issues are resolved. Great job!</p>
            ) : (
              openComplaints.map(comp => (
                <div key={comp.id} className="bg-white border-2 border-red-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-red-50 px-5 py-4 border-b border-red-100 flex justify-between items-start">
                    <div>
                      <Link href={`/customers?profile=${comp.customerId}`} className="font-bold text-red-900 hover:underline">{comp.customer.name}</Link>
                      <p className="text-xs text-red-700 mt-0.5 font-mono">{comp.customer.phone}</p>
                    </div>
                    <span className="text-[10px] text-red-500 font-bold bg-white px-2 py-1 rounded border border-red-100">
                      {new Date(comp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="p-5 flex-1">
                    <p className="text-gray-700 text-sm">{comp.description}</p>
                  </div>
                  <div className="p-5 pt-0 mt-auto">
                    <form action={resolveComplaint}>
                      <input type="hidden" name="complaintId" value={comp.id} />
                      <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-all active:scale-[0.98] text-sm">
                        Mark as Resolved
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
          <h2 className="text-lg font-bold text-gray-400 mb-4 flex items-center gap-2">
            Recently Resolved
            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{resolvedComplaints.length}</span>
          </h2>
          
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-100">
              {resolvedComplaints.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No resolved history.</div>
              ) : (
                resolvedComplaints.map(comp => (
                  <div key={comp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/customers?profile=${comp.customerId}`} className="font-semibold text-gray-900 hover:underline text-sm">{comp.customer.name}</Link>
                        <span className="text-[10px] text-green-700 font-bold bg-green-100 px-1.5 py-0.5 rounded-sm">RESOLVED</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1">{comp.description}</p>
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium whitespace-nowrap shrink-0">
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
