import prisma from '@/lib/prisma'
import Link from 'next/link'
import { SearchBar } from './SearchBar'
import { DeleteCustomerButton } from './DeleteCustomerButton'
import { CustomerDetailModal } from './CustomerDetailModal'

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
        <CustomerDetailModal customer={selectedCustomer} closeLink={closeLink} />
      )}
    </div>
  )
}


