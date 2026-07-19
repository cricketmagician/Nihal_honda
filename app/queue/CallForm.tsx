'use client'
import { useState, useTransition } from 'react'
import { logInteraction } from '../actions'
import { CheckCircle2, XCircle, PhoneCall, Smile, Meh, Frown, Check, Wrench, AlertTriangle, X, Clock, Calendar, RefreshCcw, Bike } from 'lucide-react'

const RadioGroup = ({ name, options, disabled }: { name: string, options: { label: string, val: string, icon?: React.ReactNode }[], disabled?: boolean }) => (
  <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
    {options.map(opt => (
      <label key={opt.val} className="cursor-pointer group relative">
        <input type="radio" name={name} value={opt.val} className="peer absolute opacity-0" required={!disabled && name === 'callStatus'} disabled={disabled} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2 sm:gap-3 px-4 py-3 sm:py-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 peer-checked:bg-gray-900 peer-checked:text-white peer-checked:border-gray-900 transition-all hover:bg-gray-50 peer-checked:hover:bg-gray-800 text-center sm:text-left shadow-sm">
          {opt.icon && <span className="flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 mx-auto sm:mx-0">{opt.icon}</span>}
          <span>{opt.label}</span>
        </div>
      </label>
    ))}
  </div>
)

const CheckboxGroup = ({ name, options, disabled }: { name: string, options: string[], disabled?: boolean }) => (
  <div className={`flex flex-wrap gap-2 mt-3 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
    {options.map(opt => (
      <label key={opt} className="cursor-pointer group relative">
        <input type="checkbox" name={name} value={opt} className="peer absolute opacity-0" disabled={disabled} />
        <div className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 peer-checked:bg-red-500 peer-checked:text-white peer-checked:border-red-500 transition-all hover:bg-gray-50 shadow-sm">
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
    <form action={(formData) => startTransition(() => logInteraction(formData))} className="p-5 md:p-8 space-y-6 bg-white/50">
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="customerId" value={customerId} />
      <input type="hidden" name="userId" value={userId} />

      {/* 1. Call Status */}
      <div className="bg-gray-50/80 p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 tracking-tight">
          <span className="bg-gray-200 text-gray-700 w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full">1</span> 
          Call Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Connected', val: 'Connected', icon: <CheckCircle2 /> },
            { label: 'Not Connected', val: 'Not Connected', icon: <XCircle /> },
            { label: 'Callback', val: 'Callback Requested', icon: <PhoneCall /> }
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
              <div className="flex items-center justify-start gap-3 px-4 py-3 sm:py-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 peer-checked:bg-gray-900 peer-checked:text-white peer-checked:border-gray-900 transition-all hover:bg-gray-50 peer-checked:hover:bg-gray-800 shadow-sm text-left">
                {opt.icon && <span className="flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">{opt.icon}</span>}
                <span>{opt.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className={`transition-all duration-500 space-y-6 ${isNotConnected ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
        <div className="bg-gray-50/80 p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 tracking-tight">
            <span className="bg-gray-200 text-gray-700 w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full">2</span> 
            Customer Mood
          </h3>
          <RadioGroup name="customerMood" disabled={isNotConnected} options={[
            { label: 'Happy', val: 'Happy', icon: <Smile /> },
            { label: 'Neutral', val: 'Neutral', icon: <Meh /> },
            { label: 'Unhappy', val: 'Unhappy', icon: <Frown /> }
          ]} />
        </div>

        <div className="bg-gray-50/80 p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 tracking-tight">
            <span className="bg-gray-200 text-gray-700 w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full">3</span> 
            Bike Status
          </h3>
          <RadioGroup name="bikeStatus" disabled={isNotConnected} options={[
            { label: 'Fine', val: 'Running Fine', icon: <Check /> },
            { label: 'Minor', val: 'Minor Problem', icon: <Wrench /> },
            { label: 'Major', val: 'Major Problem', icon: <AlertTriangle /> },
            { label: 'Sold', val: 'Sold', icon: <X /> }
          ]} />
        </div>

        <div className="bg-gray-50/80 p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 tracking-tight">
            <span className="bg-gray-200 text-gray-700 w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full">4</span> 
            Service
          </h3>
          <RadioGroup name="serviceStatus" disabled={isNotConnected} options={[
            { label: 'Done', val: 'Done Recently', icon: <CheckCircle2 /> },
            { label: 'Due', val: 'Due Soon', icon: <Clock /> },
            { label: 'Overdue', val: 'Overdue', icon: <AlertTriangle /> }
          ]} />
        </div>

        <div className="bg-gray-50/80 p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 tracking-tight">
            <span className="bg-gray-200 text-gray-700 w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full">5</span> 
            Interest
          </h3>
          <RadioGroup name="interest" disabled={isNotConnected} options={[
            { label: 'New', val: 'New Bike', icon: <Bike /> },
            { label: 'Exchange', val: 'Exchange', icon: <RefreshCcw /> },
            { label: 'None', val: 'Not Interested', icon: <X /> }
          ]} />
        </div>

        <div className="bg-red-50/50 p-5 md:p-6 rounded-2xl border border-red-100 shadow-sm">
          <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2 tracking-tight mb-4">
            <span className="bg-red-200 text-red-800 w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full">6</span> 
            Problems Log
          </h3>
          <CheckboxGroup name="problem" disabled={isNotConnected} options={['Mileage', 'Engine', 'Starting', 'Battery', 'Service', 'Staff Behaviour', 'Finance', 'Spare Parts', 'Other']} />
        </div>

        <div className="bg-gray-50/80 p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 tracking-tight">
            <span className="bg-gray-200 text-gray-700 w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full">7</span> 
            Notes
          </h3>
          <textarea name="notes" disabled={isNotConnected} rows={3} className="w-full mt-3 p-4 rounded-xl border border-gray-200 bg-white text-base text-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none resize-none placeholder-gray-400 disabled:opacity-50 transition-colors shadow-sm" placeholder="Any specific requests or details..."></textarea>
        </div>

        <div className="bg-blue-50/50 p-5 md:p-6 rounded-2xl border border-blue-100 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2 tracking-tight">
            <span className="bg-blue-200 text-blue-800 w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full">8</span> 
            Next Follow-up
          </h3>
          <RadioGroup name="nextFollowUp" disabled={isNotConnected} options={[
            { label: '30 Days', val: '30', icon: <Calendar /> },
            { label: '90 Days', val: '90', icon: <Calendar /> },
            { label: '180 Days', val: '180', icon: <Calendar /> },
          ]} />
        </div>
      </div>

      <div className="pt-4">
        <button type="submit" disabled={isPending || !callStatus} className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-4 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-md active:scale-95">
          <span>{isPending ? 'Saving...' : 'Complete & Next'}</span>
          {!isPending && <span className="text-gray-400 opacity-80 leading-none">→</span>}
        </button>
      </div>
    </form>
  )
}

