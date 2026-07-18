import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { SearchBar } from './SearchBar'

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
    <div className="p-8 pb-32 min-h-screen relative">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Customers</h1>
          <p className="text-sm text-gray-500">View and manage the complete customer database.</p>
        </div>
        <SearchBar initialQ={q} />
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Name</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Phone</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Vehicles</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4 text-gray-600 font-mono text-xs">{c.phone}</td>
                <td className="px-6 py-4 text-gray-600">
                  {c.vehicles.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                      {c.vehicles.map(v => (
                        <span key={v.id} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium border border-blue-100">
                          {v.model}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-xs">No vehicles</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/customers?profile=${c.id}${q ? `&q=${q}` : ''}`} scroll={false} className="text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors inline-block">
                    View Profile
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {customers.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p>No customers found.</p>
          </div>
        )}
      </div>

      {/* Popup Modal for Profile */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <Link href={closeLink} scroll={false} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" />
          
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
            <Link href={closeLink} scroll={false} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors">
              ✕
            </Link>

            <header className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 pr-10">{selectedCustomer.name}</h1>
              {selectedCustomer.fatherName && <p className="text-sm text-gray-500 mt-1">S/O {selectedCustomer.fatherName}</p>}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Details */}
              <div className="space-y-6">
                
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Contact Info</h2>
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="block text-gray-500 text-xs mb-1">Primary Phone</span>
                      <span className="font-medium text-gray-900">{selectedCustomer.phone}</span>
                    </div>
                    {selectedCustomer.phone2 && (
                      <div>
                        <span className="block text-gray-500 text-xs mb-1">Secondary Phone</span>
                        <span className="font-medium text-gray-900">{selectedCustomer.phone2}</span>
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div>
                        <span className="block text-gray-500 text-xs mb-1">Address</span>
                        <span className="font-medium text-gray-900">{selectedCustomer.address}</span>
                      </div>
                    )}
                    {selectedCustomer.village && (
                      <div>
                        <span className="block text-gray-500 text-xs mb-1">Village</span>
                        <span className="font-medium text-gray-900">{selectedCustomer.village}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Vehicles ({selectedCustomer.vehicles.length})</h2>
                  <div className="space-y-3">
                    {selectedCustomer.vehicles.map(v => (
                      <div key={v.id} className="p-3 rounded-xl border border-blue-100 bg-white">
                        <h3 className="font-bold text-blue-900 mb-2 text-sm">{v.model}</h3>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                          <div>
                            <span className="text-gray-500 block">Purchase Date</span>
                            <span className="font-medium">{new Date(v.purchaseDate).toLocaleDateString()}</span>
                          </div>
                          {v.color && (
                            <div>
                              <span className="text-gray-500 block">Color</span>
                              <span className="font-medium">{v.color}</span>
                            </div>
                          )}
                          {v.finance && (
                            <div>
                              <span className="text-gray-500 block">Finance</span>
                              <span className="font-medium">{v.finance}</span>
                            </div>
                          )}
                          {v.price && (
                            <div>
                              <span className="text-gray-500 block">Price</span>
                              <span className="font-medium">₹{v.price.toLocaleString('en-IN')}</span>
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
                
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Call History</h2>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {selectedCustomer.interactions.map(int => (
                      <div key={int.id} className="p-3 rounded-xl border border-gray-200 bg-white flex gap-3">
                        <div className="pt-0.5 text-lg">
                          {int.callStatus === 'Connected' ? '🟢' : int.callStatus === 'Callback Requested' ? '📞' : '🔴'}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm text-gray-900">{int.callStatus}</span>
                            <span className="text-[10px] text-gray-400">{new Date(int.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-1">
                            {int.customerMood && <span className="px-1.5 py-0.5 rounded border text-[10px] text-gray-600 bg-gray-50">{int.customerMood}</span>}
                            {int.bikeStatus && <span className="px-1.5 py-0.5 rounded border text-[10px] text-gray-600 bg-gray-50">{int.bikeStatus}</span>}
                          </div>

                          {int.problems && (
                            <div className="mb-1">
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 block w-fit">
                                ⚠️ {int.problems}
                              </span>
                            </div>
                          )}

                          {int.notes && (
                            <p className="text-xs text-gray-600 italic bg-gray-50 p-1.5 rounded border border-gray-100">
                              "{int.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {selectedCustomer.interactions.length === 0 && (
                      <div className="text-center py-6 text-xs text-gray-400">
                        No interactions logged yet.
                      </div>
                    )}
                  </div>
                </div>

                {selectedCustomer.complaints.length > 0 && (
                  <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
                    <h2 className="text-sm font-bold text-red-900 uppercase tracking-wider mb-4">Escalations</h2>
                    <div className="space-y-2">
                      {selectedCustomer.complaints.map(comp => (
                        <div key={comp.id} className="p-2.5 bg-white rounded-lg border border-red-100 flex justify-between items-center text-sm">
                          <span className="text-red-900 font-medium text-xs">{comp.description}</span>
                          <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full font-bold">{comp.status}</span>
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
