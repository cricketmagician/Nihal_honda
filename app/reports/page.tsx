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
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8 font-sans pb-32">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📊 Reports & Insights</h1>
        <p className="text-gray-500 mt-1">Analytics based on customer data and executive call logs.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Village Map / Distribution */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">📍 Village Distribution Map</h2>
            <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
              {missingVillage} Unmapped Customers
            </span>
          </div>
          
          {topVillages.length === 0 ? (
            <p className="text-gray-500 text-sm">No village data recorded yet.</p>
          ) : (
            <div className="space-y-4 max-w-3xl">
              {topVillages.map(([village, count]) => (
                <div key={village} className="flex items-center gap-4">
                  <div className="w-32 truncate text-sm font-semibold text-gray-700">{village}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden relative group cursor-pointer">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all group-hover:bg-blue-500" 
                      style={{ width: `${(count / maxVillage) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-right text-sm font-bold text-blue-600">{count}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Customer Satisfaction */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">😊 Customer Satisfaction</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="text-3xl mb-2">🟢</div>
              <div className="text-2xl font-bold text-green-700">{moodCount.happy}</div>
              <div className="text-xs text-green-600 uppercase font-bold mt-1">Happy</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
              <div className="text-3xl mb-2">🟡</div>
              <div className="text-2xl font-bold text-yellow-700">{moodCount.neutral}</div>
              <div className="text-xs text-yellow-600 uppercase font-bold mt-1">Neutral</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <div className="text-3xl mb-2">🔴</div>
              <div className="text-2xl font-bold text-red-700">{moodCount.unhappy}</div>
              <div className="text-xs text-red-600 uppercase font-bold mt-1">Unhappy</div>
            </div>
          </div>
        </section>

        {/* Call Connection Rates */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">📞 Call Connectivity</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span>Connected</span>
                <span>{Math.round((callCount.connected / totalCalls) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(callCount.connected / totalCalls) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span>Not Connected</span>
                <span>{Math.round((callCount.notConnected / totalCalls) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-red-400 h-2 rounded-full" style={{ width: `${(callCount.notConnected / totalCalls) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span>Callback Requested</span>
                <span>{Math.round((callCount.callback / totalCalls) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${(callCount.callback / totalCalls) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Problems */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">⚠️ Top Reported Issues</h2>
          {topProblems.length === 0 ? (
            <p className="text-sm text-gray-500">No problems logged from calls yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {topProblems.map(([prob, count]) => (
                <li key={prob} className="py-3 flex justify-between items-center">
                  <span className="font-medium text-gray-700">{prob}</span>
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">{count} calls</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Top Models */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">🏍️ Fleet Distribution</h2>
          {topModels.length === 0 ? (
            <p className="text-sm text-gray-500">No vehicles in database.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {topModels.map(([model, count]) => (
                <li key={model} className="py-3 flex justify-between items-center">
                  <span className="font-medium text-gray-700">{model}</span>
                  <span className="text-gray-500 text-sm font-bold">{count} vehicles</span>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </main>
  )
}
