import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function queueCalls() {
  console.log('Starting automated call queueing script...')
  const users = await prisma.user.findMany({ where: { role: 'Sales' } })
  if (users.length === 0) {
    console.error('No sales users found to assign tasks to.')
    return
  }
  const defaultSalesUser = users[0]

  const vehicles = await prisma.vehicle.findMany()
  const today = new Date()
  // Reset time to midnight for accurate day comparison
  today.setHours(0, 0, 0, 0)
  
  const targetDays = [7, 40, 100, 210, 365]

  let queued = 0
  for (const v of vehicles) {
    const purchaseDate = new Date(v.purchaseDate)
    purchaseDate.setHours(0, 0, 0, 0)
    
    const diffTime = Math.abs(today.getTime() - purchaseDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    const isSixMonthAnniversary = diffDays > 350 && (diffDays - 350) % 180 === 0
    
    if (targetDays.includes(diffDays) || isSixMonthAnniversary) {
      // Check if a pending task already exists for this customer to avoid duplicates
      const existing = await prisma.task.findFirst({
        where: { 
          customerId: v.customerId, 
          status: 'Pending' 
        }
      })
      
      if (!existing) {
        let reason = ''
        if (diffDays === 7) reason = '1st Week Welcome Call'
        else if (diffDays === 40) reason = '1st Service Reminder'
        else if (diffDays === 100) reason = '2nd Service Reminder'
        else if (diffDays === 210) reason = 'Check-in / Survey'
        else if (diffDays === 365) reason = '1st Year Anniversary / Insurance'
        else reason = 'Half-Year Check-in'

        console.log(`Queueing ${reason} for customer ID: ${v.customerId}`)
        
        await prisma.task.create({
          data: {
            type: 'Call',
            status: 'Pending',
            dueDate: new Date(),
            customerId: v.customerId,
            userId: defaultSalesUser.id
          }
        })
        queued++
      }
    }
  }
  console.log(`Successfully queued ${queued} calls for today based on purchase date logic.`)
}

queueCalls().catch(console.error).finally(() => prisma.$disconnect())
