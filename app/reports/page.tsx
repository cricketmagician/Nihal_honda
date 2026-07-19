import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function ReportsPage() {
  // 1. Village Aggregation
  const customers = await prisma.customer.findMany({ select: { village: true } })
  const villageCount: Record<string, number> = {}
  let missingVillage = 0
  customers.forEach(c => {
    if (c.village && c.village.trim() !== '') {
      villageCount[c.village] = (villageCount[c.village] || 0) + 1
    } else {
      missingVillage++
    }
  })
  const topVillages = Object.entries(villageCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) // Top 10

  // 2. Interaction Insights
  const interactions = await prisma.interaction.findMany()
  
  const moodCount = { happy: 0, neutral: 0, unhappy: 0 }
  const serviceCount = { done: 0, soon: 0, overdue: 0 }
  const callCount = { connected: 0, notConnected: 0, callback: 0 }
  const problemCount: Record<string, number> = {}

  interactions.forEach(i => {
    // Mood
    if (i.customerMood === 'Happy') moodCount.happy++
    if (i.customerMood === 'Neutral') moodCount.neutral++
    if (i.customerMood === 'Unhappy') moodCount.unhappy++

    // Service
    if (i.serviceStatus === 'Done Recently') serviceCount.done++
    if (i.serviceStatus === 'Due Soon') serviceCount.soon++
    if (i.serviceStatus === 'Overdue') serviceCount.overdue++

    // Call status
    if (i.callStatus === 'Connected') callCount.connected++
    if (i.callStatus === 'Not Connected') callCount.notConnected++
    if (i.callStatus === 'Callback Requested') callCount.callback++

    // Problems
    if (i.problems) {
      i.problems.split(',').forEach(p => {
        const prob = p.trim()
        if (prob) {
          problemCount[prob] = (problemCount[prob] || 0) + 1
        }
      })
    }
  })

  const topProblems = Object.entries(problemCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // 3. Vehicle Models
  const vehicles = await prisma.vehicle.findMany({ select: { model: true } })
  const modelCount: Record<string, number> = {}
  vehicles.forEach(v => {
    modelCount[v.model] = (modelCount[v.model] || 0) + 1
  })
  const topModels = Object.entries(modelCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Helpers for UI
  const totalCalls = interactions.length || 1 // prevent div by zero
  const maxVillage = topVillages.length > 0 ? topVillages[0][1] : 1

  return (
    <main className="min-h-screen text-gray-900 p-4 md:p-8 font-sans pb-32 bg-gray-50/50">
      <header className="mb-10">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <span className="text-indigo-600">📊</span> Reports & Insights
        </h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">Analytics based on customer data and executive call logs.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Village Map / Distribution */}
        <section className="bg-white/80 border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm backdrop-blur-xl lg:col-span-2">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">📍 Village Distribution</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 font-semibold rounded-full border border-gray-200">
              {missingVillage} Unmapped
            </span>
          </div>
          
          {topVillages.length === 0 ? (
            <p className="text-gray-500 text-sm font-medium">No village data recorded yet.</p>
          ) : (
            <div className="space-y-5 max-w-3xl">
              {topVillages.map(([village, count]) => (
                <div key={village} className="flex items-center gap-6">
                  <div className="w-32 truncate text-sm font-semibold text-gray-700">{village}</div>
                  <div className="flex-1 bg-gray-100 h-5 relative rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all" 
                      style={{ width: `${(count / maxVillage) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-right text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{count}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Customer Satisfaction */}
        <section className="bg-white/80 border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm backdrop-blur-xl">
          <h2 className="text-lg font-bold mb-8 text-gray-900 border-b border-gray-100 pb-4">😊 Satisfaction</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
              <div className="text-3xl mb-3">🟢</div>
              <div className="text-2xl font-bold text-emerald-700">{moodCount.happy}</div>
              <div className="text-[10px] text-emerald-600 uppercase tracking-wider font-semibold mt-2">Happy</div>
            </div>
            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
              <div className="text-3xl mb-3">🟡</div>
              <div className="text-2xl font-bold text-amber-700">{moodCount.neutral}</div>
              <div className="text-[10px] text-amber-600 uppercase tracking-wider font-semibold mt-2">Neutral</div>
            </div>
            <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
              <div className="text-3xl mb-3">🔴</div>
              <div className="text-2xl font-bold text-rose-700">{moodCount.unhappy}</div>
              <div className="text-[10px] text-rose-600 uppercase tracking-wider font-semibold mt-2">Unhappy</div>
            </div>
          </div>
        </section>

        {/* Call Connection Rates */}
        <section className="bg-white/80 border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm backdrop-blur-xl">
          <h2 className="text-lg font-bold mb-8 text-gray-900 border-b border-gray-100 pb-4">📞 Call Connectivity</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-gray-600">
                <span>Connected</span>
                <span className="text-emerald-600">{Math.round((callCount.connected / totalCalls) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(callCount.connected / totalCalls) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-gray-600">
                <span>Not Connected</span>
                <span className="text-rose-600">{Math.round((callCount.notConnected / totalCalls) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${(callCount.notConnected / totalCalls) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-gray-600">
                <span>Callback Requested</span>
                <span className="text-amber-600">{Math.round((callCount.callback / totalCalls) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(callCount.callback / totalCalls) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Problems */}
        <section className="bg-white/80 border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm backdrop-blur-xl">
          <h2 className="text-lg font-bold mb-6 text-gray-900 border-b border-gray-100 pb-4">⚠️ Top Issues</h2>
          {topProblems.length === 0 ? (
            <p className="text-sm font-medium text-gray-500">No problems logged from calls yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {topProblems.map(([prob, count]) => (
                <li key={prob} className="py-4 flex justify-between items-center">
                  <span className="font-semibold text-gray-700 text-sm">{prob}</span>
                  <span className="bg-red-50 text-red-700 border border-red-100 text-xs font-bold px-3 py-1 rounded-full">{count} Calls</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Top Models */}
        <section className="bg-white/80 border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm backdrop-blur-xl">
          <h2 className="text-lg font-bold mb-6 text-gray-900 border-b border-gray-100 pb-4">🏍️ Fleet Distribution</h2>
          {topModels.length === 0 ? (
            <p className="text-sm font-medium text-gray-500">No vehicles in database.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {topModels.map(([model, count]) => (
                <li key={model} className="py-4 flex justify-between items-center">
                  <span className="font-semibold text-gray-700 text-sm">{model}</span>
                  <span className="bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">{count} Vehicles</span>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </main>
  )
}


