'use client'

import { useState, useTransition } from 'react'
import { updateCustomerAction } from '../actions'
import { DeleteCustomerButton } from './DeleteCustomerButton'
import Link from 'next/link'

interface Vehicle {
  id: string
  model: string
  purchaseDate: Date | string
  color: string | null
  finance: string | null
  price: number | null
}

interface Interaction {
  id: string
  callStatus: string
  customerMood: string | null
  bikeStatus: string | null
  problems: string | null
  notes: string | null
  createdAt: Date | string
  user: {
    name: string
  }
}

interface Complaint {
  id: string
  description: string
  status: string
  createdAt: Date | string
}

interface Customer {
  id: string
  name: string
  fatherName: string | null
  phone: string
  phone2: string | null
  address: string | null
  village: string | null
  vehicles: Vehicle[]
  interactions: Interaction[]
  complaints: Complaint[]
}

export function CustomerDetailModal({ 
  customer, 
  closeLink 
}: { 
  customer: Customer
  closeLink: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Local state for form fields
  const [name, setName] = useState(customer.name)
  const [fatherName, setFatherName] = useState(customer.fatherName || '')
  const [phone, setPhone] = useState(customer.phone)
  const [phone2, setPhone2] = useState(customer.phone2 || '')
  const [address, setAddress] = useState(customer.address || '')
  const [village, setVillage] = useState(customer.village || '')

  // First vehicle (if exists)
  const vehicle = customer.vehicles[0]
  const [vehicleModel, setVehicleModel] = useState(vehicle?.model || '')
  
  // Format Date to YYYY-MM-DD for native input element
  const getFormattedDate = (dateObj: Date | string | undefined) => {
    if (!dateObj) return ''
    const d = new Date(dateObj)
    if (isNaN(d.getTime())) return ''
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const year = d.getFullYear()
    return `${year}-${month}-${day}`
  }
  const [purchaseDate, setPurchaseDate] = useState(getFormattedDate(vehicle?.purchaseDate))
  const [vehicleColor, setVehicleColor] = useState(vehicle?.color || '')
  const [vehicleFinance, setVehicleFinance] = useState(vehicle?.finance || '')
  const [vehiclePrice, setVehiclePrice] = useState(vehicle?.price?.toString() || '')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Customer Name is required.')
      return
    }
    if (!phone.trim()) {
      setError('Phone Number is required.')
      return
    }
    if (vehicle && !vehicleModel.trim()) {
      setError('Vehicle Model is strictly compulsory.')
      return
    }
    if (vehicle && !purchaseDate) {
      setError('Purchase Date is required.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('customerId', customer.id)
      formData.append('name', name)
      formData.append('fatherName', fatherName)
      formData.append('phone', phone)
      formData.append('phone2', phone2)
      formData.append('address', address)
      formData.append('village', village)

      if (vehicle) {
        formData.append('vehicleId', vehicle.id)
        formData.append('vehicleModel', vehicleModel)
        formData.append('purchaseDate', purchaseDate)
        formData.append('vehicleColor', vehicleColor)
        formData.append('vehicleFinance', vehicleFinance)
        formData.append('vehiclePrice', vehiclePrice)
      }

      const result = await updateCustomerAction(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setIsEditing(false)
        // Force refresh state using native navigation/refresh
        window.location.reload()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <Link href={closeLink} scroll={false} className="absolute inset-0 bg-gray-950/20 backdrop-blur-md transition-opacity" />
      
      {/* Modal Box */}
      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-white/95 border border-gray-200/80 shadow-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-2xl">
        
        {/* Close Button */}
        <Link 
          href={closeLink} 
          scroll={false} 
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-all border border-gray-200/50 shadow-sm active:scale-90 font-semibold text-sm"
          title="Close Profile"
        >
          ✕
        </Link>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            <header className="mb-6 border-b border-gray-100 pb-5">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Customer Profile</h1>
              <p className="text-gray-500 text-xs mt-1">Update details for {customer.name}</p>
            </header>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-xs px-4 py-3 rounded-xl font-medium">
                ⚠️ {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info Section */}
              <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Customer Details</h3>
                
                <div>
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Customer Name *</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-gray-50/50 text-gray-900 text-sm font-medium transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Father's Name (S/O)</label>
                  <input 
                    type="text" 
                    value={fatherName} 
                    onChange={e => setFatherName(e.target.value)} 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-gray-50/50 text-gray-900 text-sm font-medium transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Primary Phone *</label>
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-gray-50/50 text-gray-900 text-sm font-medium transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Secondary Phone</label>
                    <input 
                      type="text" 
                      value={phone2} 
                      onChange={e => setPhone2(e.target.value)} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-gray-50/50 text-gray-900 text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Village</label>
                    <input 
                      type="text" 
                      value={village} 
                      onChange={e => setVillage(e.target.value)} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-gray-50/50 text-gray-900 text-sm font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Address</label>
                    <input 
                      type="text" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-gray-50/50 text-gray-900 text-sm font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Section */}
              {vehicle && (
                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Vehicle Details</h3>
                  
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Vehicle Model *</label>
                    <input 
                      type="text" 
                      value={vehicleModel} 
                      onChange={e => setVehicleModel(e.target.value)} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-gray-50/50 text-gray-900 text-sm font-medium transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Purchase Date *</label>
                    <input 
                      type="date" 
                      value={purchaseDate} 
                      onChange={e => setPurchaseDate(e.target.value)} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-gray-50/50 text-gray-900 text-sm font-medium transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Color</label>
                      <input 
                        type="text" 
                        value={vehicleColor} 
                        onChange={e => setVehicleColor(e.target.value)} 
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-gray-50/50 text-gray-900 text-xs font-medium transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Finance</label>
                      <select 
                        value={vehicleFinance} 
                        onChange={e => setVehicleFinance(e.target.value)} 
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-gray-50/50 text-gray-900 text-xs font-medium transition-all"
                      >
                        <option value="">Select</option>
                        <option value="Cash">Cash</option>
                        <option value="Finance">Finance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Price</label>
                      <input 
                        type="number" 
                        value={vehiclePrice} 
                        onChange={e => setVehiclePrice(e.target.value)} 
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-gray-50/50 text-gray-900 text-xs font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)} 
                className="text-xs bg-gray-100 hover:bg-gray-200/80 text-gray-700 font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isPending}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-5 pr-12">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{customer.name}</h1>
                {customer.fatherName && <p className="text-xs text-gray-500 font-medium mt-1">S/O {customer.fatherName}</p>}
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-xs bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 font-semibold px-4 py-2 rounded-xl transition-all border border-indigo-100/50 active:scale-95 shadow-sm"
                >
                  Edit Profile
                </button>
                <DeleteCustomerButton customerId={customer.id} customerName={customer.name} />
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
                      <span className="font-semibold text-gray-905 text-lg">{customer.phone}</span>
                    </div>
                    {customer.phone2 && (
                      <div>
                        <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Secondary Phone</span>
                        <span className="font-semibold text-gray-900 text-lg">{customer.phone2}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div>
                        <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Address</span>
                        <span className="font-semibold text-gray-900">{customer.address}</span>
                      </div>
                    )}
                    {customer.village && (
                      <div>
                        <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Village</span>
                        <span className="font-semibold text-gray-900">{customer.village}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5 border-b border-gray-50 pb-2">Vehicles ({customer.vehicles.length})</h2>
                  <div className="space-y-4">
                    {customer.vehicles.map(v => (
                      <div key={v.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-900">
                        <h3 className="font-bold text-base text-gray-800 mb-3">🏍 {v.model}</h3>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-medium text-gray-600">
                          <div>
                            <span className="text-gray-400 block text-[9px] font-bold uppercase tracking-wider mb-0.5">Purchase</span>
                            <span className="font-semibold">{new Date(v.purchaseDate).toLocaleDateString('en-GB')}</span>
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
                    {customer.interactions.length === 0 ? (
                      <p className="text-gray-400 text-xs italic py-4">No calls logged yet.</p>
                    ) : (
                      customer.interactions.map(int => (
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
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5 border-b border-gray-50 pb-2">Active Complaints</h2>
                  <div className="space-y-3">
                    {customer.complaints.length === 0 ? (
                      <p className="text-gray-400 text-xs italic py-4">No active complaints found.</p>
                    ) : (
                      customer.complaints.map(c => (
                        <div key={c.id} className={`p-4 rounded-xl border flex items-start gap-3 ${
                          c.status === 'Open' ? 'bg-red-50/50 border-red-100 text-red-900' : 'bg-gray-50 border-gray-100 text-gray-500'
                        }`}>
                          <span className="text-lg">{c.status === 'Open' ? '🚨' : '✅'}</span>
                          <div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider inline-block mb-1.5 ${
                              c.status === 'Open' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-gray-100 border-gray-200 text-gray-600'
                            }`}>
                              {c.status}
                            </span>
                            <p className="text-xs font-medium leading-relaxed">{c.description}</p>
                            <span className="text-[9px] text-gray-400 block mt-1.5">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
