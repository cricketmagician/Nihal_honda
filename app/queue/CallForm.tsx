'use client'
import { useState, useTransition } from 'react'
import { logInteraction } from '../actions'

const RadioGroup = ({ name, options, disabled }: { name: string, options: { label: string, val: string, icon?: string }[], disabled?: boolean }) => (
  <div className={`flex flex-wrap gap-2 mt-1 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    {options.map(opt => (
      <label key={opt.val} className="cursor-pointer">
        <input type="radio" name={name} value={opt.val} className="peer hidden" required={!disabled && name === 'callStatus'} disabled={disabled} />
        <div className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-all hover:bg-gray-50 peer-checked:hover:bg-blue-700">
          {opt.icon && <span className="mr-2">{opt.icon}</span>}
          {opt.label}
        </div>
      </label>
    ))}
  </div>
)

const CheckboxGroup = ({ name, options, disabled }: { name: string, options: string[], disabled?: boolean }) => (
  <div className={`flex flex-wrap gap-2 mt-1 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    {options.map(opt => (
      <label key={opt} className="cursor-pointer">
        <input type="checkbox" name={name} value={opt} className="peer hidden" disabled={disabled} />
        <div className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-600 peer-checked:bg-red-500 peer-checked:text-white peer-checked:border-red-500 transition-all hover:bg-gray-50">
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
      <div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">1. Call Status</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {[
            { label: 'Connected', val: 'Connected', icon: '🟢' },
            { label: 'Not Connected', val: 'Not Connected', icon: '🔴' },
            { label: 'Callback Requested', val: 'Callback Requested', icon: '📞' }
          ].map(opt => (
            <label key={opt.val} className="cursor-pointer">
              <input 
                type="radio" 
                name="callStatus" 
                value={opt.val} 
                className="peer hidden" 
                required 
                onChange={(e) => setCallStatus(e.target.value)}
              />
              <div className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-all hover:bg-gray-50 peer-checked:hover:bg-blue-700">
                {opt.icon && <span className="mr-2">{opt.icon}</span>}
                {opt.label}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className={`transition-all duration-300 space-y-6 ${isNotConnected ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">2. Customer Mood</span>
          <RadioGroup name="customerMood" disabled={isNotConnected} options={[
            { label: 'Happy', val: 'Happy', icon: '😊' },
            { label: 'Neutral', val: 'Neutral', icon: '😐' },
            { label: 'Unhappy', val: 'Unhappy', icon: '😡' }
          ]} />
        </div>

        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">3. Bike Status</span>
          <RadioGroup name="bikeStatus" disabled={isNotConnected} options={[
            { label: 'Running Fine', val: 'Running Fine', icon: '✅' },
            { label: 'Minor Problem', val: 'Minor Problem', icon: '🔧' },
            { label: 'Major Problem', val: 'Major Problem', icon: '⚠️' },
            { label: 'Sold', val: 'Sold', icon: '🚫' }
          ]} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">4. Service</span>
            <RadioGroup name="serviceStatus" disabled={isNotConnected} options={[
              { label: 'Done Recently', val: 'Done Recently', icon: '🔵' },
              { label: 'Due Soon', val: 'Due Soon', icon: '🟡' },
              { label: 'Overdue', val: 'Overdue', icon: '🔴' }
            ]} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">5. Interest</span>
            <RadioGroup name="interest" disabled={isNotConnected} options={[
              { label: 'New Bike', val: 'New Bike', icon: '🚲' },
              { label: 'Exchange', val: 'Exchange', icon: '🔄' },
              { label: 'Not Interested', val: 'Not Interested', icon: '❌' }
            ]} />
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">6. Problems (Optional)</span>
          <CheckboxGroup name="problem" disabled={isNotConnected} options={['Mileage', 'Engine', 'Starting', 'Battery', 'Service', 'Staff Behaviour', 'Finance', 'Spare Parts', 'Other']} />
        </div>

        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">7. Notes</span>
          <textarea name="notes" disabled={isNotConnected} rows={2} className="w-full mt-1 p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none placeholder-gray-400 disabled:opacity-50" placeholder="Any additional context..."></textarea>
        </div>

        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">8. Next Follow-up</span>
          <RadioGroup name="nextFollowUp" disabled={isNotConnected} options={[
            { label: '30 Days', val: '30', icon: '📅' },
            { label: '90 Days', val: '90', icon: '📅' },
            { label: '180 Days', val: '180', icon: '📅' },
          ]} />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex gap-4">
        <button type="submit" disabled={isPending || !callStatus} className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-xl transition-transform active:scale-95 shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed">
          <span>{isPending ? 'SAVING...' : 'SAVE & NEXT CUSTOMER'}</span>
          {!isPending && <span>→</span>}
        </button>
      </div>
    </form>
  )
}
