'use client'
import { useState, useTransition } from 'react'
import { logInteraction } from '../actions'

const RadioGroup = ({ name, options, disabled }: { name: string, options: { label: string, val: string, icon?: string }[], disabled?: boolean }) => (
  <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    {options.map(opt => (
      <label key={opt.val} className="cursor-pointer group relative">
        <input type="radio" name={name} value={opt.val} className="peer absolute opacity-0" required={!disabled && name === 'callStatus'} disabled={disabled} />
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-100 bg-white text-sm font-semibold text-gray-600 peer-checked:bg-gray-900 peer-checked:text-white peer-checked:border-gray-900 transition-all hover:border-gray-200 peer-checked:shadow-md">
          {opt.icon && <span className="text-lg">{opt.icon}</span>}
          {opt.label}
        </div>
      </label>
    ))}
  </div>
)

const CheckboxGroup = ({ name, options, disabled }: { name: string, options: string[], disabled?: boolean }) => (
  <div className={`flex flex-wrap gap-2 mt-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    {options.map(opt => (
      <label key={opt} className="cursor-pointer group relative">
        <input type="checkbox" name={name} value={opt} className="peer absolute opacity-0" disabled={disabled} />
        <div className="px-4 py-2 rounded-xl border-2 border-gray-100 bg-white text-sm font-semibold text-gray-700 peer-checked:bg-red-50 peer-checked:text-red-700 peer-checked:border-red-200 transition-all hover:border-gray-200">
          {opt}
        </div>
      </label>
    ))}
  </div>
)

export function CallForm({ taskId, customerId, userId }: { taskId: string, customerId: string, userId: string }) {
  const [callStatus, setCallStatus] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  
  const isNotConnected = callStatus === 'Not Connected'

  return (
    <form action={(formData) => startTransition(() => logInteraction(formData))} className="p-6 space-y-6">
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="customerId" value={customerId} />
      <input type="hidden" name="userId" value={userId} />

      {/* 1. Call Status */}
      <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span className="bg-gray-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span> 
          Call Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {[
            { label: 'Connected', val: 'Connected', icon: '🟢' },
            { label: 'Not Connected', val: 'Not Connected', icon: '🔴' },
            { label: 'Callback Requested', val: 'Callback Requested', icon: '📞' }
          ].map(opt => (
            <label key={opt.val} className="cursor-pointer group relative">
              <input 
                type="radio" 
                name="callStatus" 
                value={opt.val} 
                className="peer absolute opacity-0" 
                required 
                onChange={(e) => setCallStatus(e.target.value)}
              />
              <div className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 border-gray-100 bg-white text-sm font-bold text-gray-600 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-all hover:border-gray-200 peer-checked:shadow-md text-center h-full">
                {opt.icon && <span className="text-2xl mb-1 block">{opt.icon}</span>}
                <span>{opt.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className={`transition-all duration-500 space-y-6 ${isNotConnected ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
        <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="bg-gray-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span> 
            Customer Mood
          </h3>
          <RadioGroup name="customerMood" disabled={isNotConnected} options={[
            { label: 'Happy', val: 'Happy', icon: '😊' },
            { label: 'Neutral', val: 'Neutral', icon: '😐' },
            { label: 'Unhappy', val: 'Unhappy', icon: '😡' }
          ]} />
        </div>

        <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="bg-gray-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">3</span> 
            Bike Status
          </h3>
          <RadioGroup name="bikeStatus" disabled={isNotConnected} options={[
            { label: 'Running Fine', val: 'Running Fine', icon: '✅' },
            { label: 'Minor Problem', val: 'Minor Problem', icon: '🔧' },
            { label: 'Major Problem', val: 'Major Problem', icon: '⚠️' },
            { label: 'Sold', val: 'Sold', icon: '🚫' }
          ]} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span className="bg-gray-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">4</span> 
              Service
            </h3>
            <RadioGroup name="serviceStatus" disabled={isNotConnected} options={[
              { label: 'Done Recently', val: 'Done Recently', icon: '🟢' },
              { label: 'Due Soon', val: 'Due Soon', icon: '🟡' },
              { label: 'Overdue', val: 'Overdue', icon: '🔴' }
            ]} />
          </div>
          <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span className="bg-gray-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">5</span> 
              Interest
            </h3>
            <RadioGroup name="interest" disabled={isNotConnected} options={[
              { label: 'New Bike', val: 'New Bike', icon: '🚲' },
              { label: 'Exchange', val: 'Exchange', icon: '🔄' },
              { label: 'Not Interested', val: 'Not Interested', icon: '❌' }
            ]} />
          </div>
        </div>

        <div className="bg-red-50/30 p-5 rounded-2xl border border-red-100">
          <h3 className="text-sm font-bold text-red-900 mb-1 flex items-center gap-2">
            <span className="bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">6</span> 
            Problems Log (Optional)
          </h3>
          <CheckboxGroup name="problem" disabled={isNotConnected} options={['Mileage', 'Engine', 'Starting', 'Battery', 'Service', 'Staff Behaviour', 'Finance', 'Spare Parts', 'Other']} />
        </div>

        <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="bg-gray-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">7</span> 
            Notes
          </h3>
          <textarea name="notes" disabled={isNotConnected} rows={3} className="w-full mt-3 p-4 rounded-xl border-2 border-gray-100 bg-white text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none placeholder-gray-400 disabled:opacity-50 transition-all font-medium" placeholder="Write any specific details or customer requests here..."></textarea>
        </div>

        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
          <h3 className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-2">
            <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">8</span> 
            Next Follow-up
          </h3>
          <RadioGroup name="nextFollowUp" disabled={isNotConnected} options={[
            { label: '30 Days', val: '30', icon: '📅' },
            { label: '90 Days', val: '90', icon: '📅' },
            { label: '180 Days', val: '180', icon: '📅' },
          ]} />
        </div>
      </div>

      <div className="pt-4 flex gap-4">
        <button type="submit" disabled={isPending || !callStatus} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-blue-600/30 flex justify-center items-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed text-lg">
          <span>{isPending ? 'Saving Record...' : 'Complete & Next Customer'}</span>
          {!isPending && <span className="text-blue-200">→</span>}
        </button>
      </div>
    </form>
  )
}
