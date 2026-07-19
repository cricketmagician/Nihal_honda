import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { SearchBar } from './SearchBar'
import { DeleteCustomerButton } from './DeleteCustomerButton'

const prisma = new PrismaClient()

export default async function CustomersPage({ searchParams }: { searchParams?: Promise<{ q?: string, profile?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams?.q || ''
  const profileId = resolvedSearchParams?.profile

  const customers = await prisma.customer.findMany({
    where: q ? {
      OR: [
        { name: { contains: q } },
        { phone: { contains: q } }
      ]
    } : undefined,
    include: { vehicles: true },
    orderBy: { name: 'asc' }
  })

  let selectedCustomer = null
  if (profileId) {
    selectedCustomer = await prisma.customer.findUnique({
      where: { id: profileId },
      include: {
        vehicles: true,
        interactions: {
          orderBy: { createdAt: 'desc' },
          include: { user: true }
        },
        complaints: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  const closeLink = `/customers${q ? `?q=${q}` : ''}`

  return (
    <div className="p-4 md:p-8 pb-32 min-h-screen text-gray-900 bg-gray-50/50">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200/60 pb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">Customer Directory</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">All registered dealership customers.</p>
        </div>
        <SearchBar initialQ={q} />
      </header>

      <div className="bg-white/80 border border-gray-200/60 rounded-3xl shadow-sm overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Phone</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Vehicles</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Date of Purchase</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{c.phone}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {c.vehicles.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {c.vehicles.map(v => (
                          <span key={v.id} className="bg-gray-50 text-gray-700 px-2.5 py-0.5 rounded-md text-[10px] font-bold border border-gray-100">
                            🏍 {v.model}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {c.vehicles.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {c.vehicles.map(v => (
                          <span key={v.id} className="bg-gray-50 text-gray-600 px-2.5 py-0.5 rounded-md text-[10px] font-bold border border-gray-100 font-mono">
                            📅 {new Date(v.purchaseDate).toLocaleDateString('en-GB')}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/customers?profile=${c.id}${q ? `&q=${q}` : ''}`} 
                      scroll={false} 
                      className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs bg-indigo-50 hover:bg-indigo-100/80 px-4 py-2 rounded-xl transition-all inline-block active:scale-95 border border-indigo-100/50 shadow-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {customers.length === 0 && (
          <div className="p-16 text-center text-gray-400 font-medium">
            <p>No customers found.</p>
          </div>
        )}
      </div>

      {/* Popup Modal for Profile */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <Link href={closeLink} scroll={false} className="absolute inset-0 bg-gray-950/20 backdrop-blur-md transition-opacity" />
          
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-white/95 border border-gray-200/80 shadow-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-2xl">
            <Link 
              href={closeLink} 
              scroll={false} 
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-all border border-gray-200/50 shadow-sm active:scale-90 font-semibold text-sm"
              title="Close Profile"
            >
              ✕
            </Link>

            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-5 pr-12">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{selectedCustomer.name}</h1>
                {selectedCustomer.fatherName && <p className="text-xs text-gray-500 font-medium mt-1">S/O {selectedCustomer.fatherName}</p>}
              </div>
              <div className="shrink-0">
                <DeleteCustomerButton customerId={selectedCustomer.id} customerName={selectedCustomer.name} />
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Details */}
              <div className="space-y-6">
                
                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5 border-b border-gray-50 pb-2">Contact Info</h2>
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Primary Phone</span>
                      <span className="font-semibold text-gray-900 text-lg">{selectedCustomer.phone}</span>
                    </div>
                    {selectedCustomer.phone2 && (
                      <div>
                        <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Secondary Phone</span>
                        <span className="font-semibold text-gray-900 text-lg">{selectedCustomer.phone2}</span>
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div>
                        <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Address</span>
                        <span className="font-semibold text-gray-900">{selectedCustomer.address}</span>
                      </div>
                    )}
                    {selectedCustomer.village && (
                      <div>
                        <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Village</span>
                        <span className="font-semibold text-gray-900">{selectedCustomer.village}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5 border-b border-gray-50 pb-2">Vehicles ({selectedCustomer.vehicles.length})</h2>
                  <div className="space-y-4">
                    {selectedCustomer.vehicles.map(v => (
                      <div key={v.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-900">
                        <h3 className="font-bold text-base text-gray-800 mb-3">🏍 {v.model}</h3>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-medium text-gray-600">
                          <div>
                            <span className="text-gray-400 block text-[9px] font-bold uppercase tracking-wider mb-0.5">Purchase</span>
                            <span className="font-semibold">{new Date(v.purchaseDate).toLocaleDateString()}</span>
                          </div>
                          {v.color && (
                            <div>
                              <span className="text-gray-400 block text-[9px] font-bold uppercase tracking-wider mb-0.5">Color</span>
                              <span className="font-semibold">{v.color}</span>
                            </div>
                          )}
                          {v.finance && (
                            <div>
                              <span className="text-gray-400 block text-[9px] font-bold uppercase tracking-wider mb-0.5">Finance</span>
                              <span className="font-semibold">{v.finance}</span>
                            </div>
                          )}
                          {v.price && (
                            <div>
                              <span className="text-gray-400 block text-[9px] font-bold uppercase tracking-wider mb-0.5">Price</span>
                              <span className="font-semibold">₹{v.price.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Interactions & Complaints */}
              <div className="space-y-6">
                
                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5 border-b border-gray-50 pb-2">Call History</h2>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                    {selectedCustomer.interactions.map(int => (
                      <div key={int.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 flex gap-4">
                        <div className="pt-0.5 text-xl">
                          {int.callStatus === 'Connected' ? '🟢' : int.callStatus === 'Callback Requested' ? '📞' : '🔴'}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                              int.callStatus === 'Connected' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : int.callStatus === 'Callback Requested'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                              {int.callStatus}
                            </span>
                            <span className="text-[10px] font-medium text-gray-400">{new Date(int.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            {int.customerMood && <span className="bg-white border border-gray-100 text-[9px] font-bold text-gray-500 uppercase tracking-wider px-2 py-0.5 rounded-md">{int.customerMood}</span>}
                            {int.bikeStatus && <span className="bg-white border border-gray-100 text-[9px] font-bold text-gray-500 uppercase tracking-wider px-2 py-0.5 rounded-md">{int.bikeStatus}</span>}
                          </div>

                          {int.problems && (
                            <div className="mb-2">
                              <span className="text-[9px] font-bold text-red-700 bg-red-50 px-2 py-0.5 border border-red-100 uppercase tracking-wider rounded-md inline-block">
                                ⚠️ {int.problems}
                              </span>
                            </div>
                          )}

                          {int.notes && (
                            <p className="text-xs text-gray-600 font-medium italic bg-white p-3 rounded-lg border border-gray-100/80">
                              "{int.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {selectedCustomer.interactions.length === 0 && (
                      <div className="text-center py-10 text-xs font-medium text-gray-400">
                        No interactions logged yet.
                      </div>
                    )}
                  </div>
                </div>

                {selectedCustomer.complaints.length > 0 && (
                  <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-5 border-b border-rose-100 pb-2">Escalations</h2>
                    <div className="space-y-3">
                      {selectedCustomer.complaints.map(comp => (
                        <div key={comp.id} className="p-4 bg-white border border-rose-100 flex justify-between items-center text-xs gap-4 rounded-xl shadow-sm">
                          <span className="text-rose-950 font-semibold flex-1 leading-normal">{comp.description}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${
                            comp.status === 'Open'
                              ? 'bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {comp.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


