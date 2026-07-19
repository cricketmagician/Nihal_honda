'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { getSessionUser } from './actions/auth'

const prisma = new PrismaClient()

export async function logInteraction(formData: FormData) {
  const taskId = formData.get('taskId') as string
  const customerId = formData.get('customerId') as string
  const userId = formData.get('userId') as string
  
  const callStatus = formData.get('callStatus') as string
  const customerMood = formData.get('customerMood') as string
  const bikeStatus = formData.get('bikeStatus') as string
  const serviceStatus = formData.get('serviceStatus') as string
  const interest = formData.get('interest') as string
  const nextFollowUp = formData.get('nextFollowUp') as string
  const notes = formData.get('notes') as string
  
  // Problems checkboxes
  const problems = formData.getAll('problem').join(', ')

  // 1. Log the interaction
  await prisma.interaction.create({
    data: {
      customerId,
      userId,
      callStatus,
      customerMood,
      bikeStatus,
      serviceStatus,
      interest,
      problems,
      notes,
      nextFollowUp: nextFollowUp ? parseInt(nextFollowUp) : null,
    }
  })

  // 2. Mark the current task as done
  await prisma.task.update({
    where: { id: taskId },
    data: { status: 'Done' }
  })

  // 3. Simple Automations: Calculate next action
  let nextFollowUpDays = nextFollowUp ? parseInt(nextFollowUp) : 90
  
  // Overrides based on heuristics
  if (callStatus === 'Not Connected' || callStatus === 'Callback Requested') {
    nextFollowUpDays = 1
  }

  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + nextFollowUpDays)

  await prisma.task.create({
    data: {
      type: 'Call',
      status: 'Pending',
      dueDate: nextDate,
      customerId,
      userId,
    }
  })

  // 4. Automation: If Major Problem, create a Complaint Ticket
  if (bikeStatus === 'Major Problem') {
    await prisma.complaint.create({
      data: {
        customerId,
        description: `Auto-generated from Call. Problems: ${problems}. Notes: ${notes}`,
        status: 'Open',
      }
    })
    // In a real app, this would also trigger a push notification to the Service Manager
  }

  // 5. Revalidate the page
  revalidatePath('/queue')
  revalidatePath('/')
  revalidatePath('/customers')
}

export async function addCustomer(formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const model = formData.get('model') as string
  const dateStr = formData.get('purchaseDate') as string
  const village = formData.get('village') as string

  if (!name || !phone || !model || !dateStr) {
    return { error: 'Missing compulsory fields' }
  }

  // Handle DD/MM/YYYY or YYYY-MM-DD
  let parsedDate = new Date(dateStr)
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/')
    if (day && month && year) {
      parsedDate = new Date(`${year}-${month}-${day}`)
    }
  }

  // Get dealership and user to associate the customer/task with
  const user = await getSessionUser()
  if (!user) throw new Error("No user found")
  
  let dealership = await prisma.dealership.findFirst()
  if (!dealership) dealership = await prisma.dealership.create({ data: { name: 'Honda Main Branch' } })
  
  const existingCustomer = await prisma.customer.findFirst({
    where: { phone }
  })
  if (existingCustomer) {
    return { error: `A customer with phone number ${phone} already exists!` }
  }
  
  const customer = await prisma.customer.create({
    data: {
      name,
      phone,
      village: village || null,
      dealershipId: dealership.id,
    }
  })

  await prisma.vehicle.create({
    data: {
      model,
      purchaseDate: parsedDate,
      customerId: customer.id
    }
  })

  // Automatically put them in the queue for a follow up today
  await prisma.task.create({
    data: {
      type: 'Call',
      status: 'Pending',
      dueDate: new Date(),
      customerId: customer.id,
      userId: user.id
    }
  })

  revalidatePath('/')
  revalidatePath('/queue')
  revalidatePath('/customers')
  
  return { success: true }
}

export async function resolveComplaint(formData: FormData) {
  const complaintId = formData.get('complaintId') as string
  if (!complaintId) throw new Error('Complaint ID required')

  await prisma.complaint.update({
    where: { id: complaintId },
    data: { status: 'Resolved' }
  })

  revalidatePath('/complaints')
  revalidatePath('/')
  revalidatePath('/customers')
}

export async function deleteCustomerAction(formData: FormData) {
  const customerId = formData.get('customerId') as string
  if (!customerId) throw new Error('Customer ID required')

  // Run as a transaction to delete all related records first
  await prisma.$transaction([
    prisma.interaction.deleteMany({ where: { customerId } }),
    prisma.task.deleteMany({ where: { customerId } }),
    prisma.vehicle.deleteMany({ where: { customerId } }),
    prisma.complaint.deleteMany({ where: { customerId } }),
    prisma.customer.delete({ where: { id: customerId } })
  ])

  revalidatePath('/customers')
  revalidatePath('/queue')
  revalidatePath('/')
}
