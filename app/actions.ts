'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSessionUser } from './actions/auth'
import { redirect } from 'next/navigation'

// Helper to calculate initial call due date based on purchase anniversary
function getInitialDueDate(purchaseDate: Date): Date {
  const today = new Date()
  const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  // Calculate potential due dates in the timeline
  const day7 = new Date(purchaseDate)
  day7.setDate(day7.getDate() + 7)
  
  const day40 = new Date(purchaseDate)
  day40.setDate(day40.getDate() + 40)
  
  const day100 = new Date(purchaseDate)
  day100.setDate(day100.getDate() + 100)
  
  const day210 = new Date(purchaseDate)
  day210.setDate(day210.getDate() + 210)
  
  // Day 7 is the first target. If it's in the future, start there.
  if (day7 >= todayZero) return day7
  // If Day 7 has passed but Day 40 is in the future, start there.
  if (day40 >= todayZero) return day40
  // Same for Day 100
  if (day100 >= todayZero) return day100
  // Same for Day 210
  if (day210 >= todayZero) return day210
  
  // If all day-intervals have passed, find the anniversary in the current calendar year
  const thisYearAnniversary = new Date(purchaseDate)
  thisYearAnniversary.setFullYear(todayZero.getFullYear())
  thisYearAnniversary.setHours(0, 0, 0, 0)
  return thisYearAnniversary
}

// Helper to calculate the next sequence call after a successful connection
function getNextFollowUpDate(purchaseDate: Date, currentDueDate: Date): Date {
  const pDate = new Date(purchaseDate)
  const currDueDate = new Date(currentDueDate)
  
  // Calculate difference in days between current task due date and purchase date
  const diffInDays = Math.round((currDueDate.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24))
  
  const nextDate = new Date(purchaseDate)
  if (diffInDays <= 20) {
    // Just finished Day 7 (or initial call). Next is Day 40.
    nextDate.setDate(nextDate.getDate() + 40)
  } else if (diffInDays <= 70) {
    // Just finished Day 40. Next is Day 100.
    nextDate.setDate(nextDate.getDate() + 100)
  } else if (diffInDays <= 150) {
    // Just finished Day 100. Next is Day 210.
    nextDate.setDate(nextDate.getDate() + 210)
  } else if (diffInDays <= 280) {
    // Just finished Day 210. Next is Day 365 (1 Year).
    nextDate.setDate(nextDate.getDate() + 365)
  } else {
    // Just finished 1 Year or subsequent anniversary call. Next is same day next year.
    nextDate.setFullYear(currDueDate.getFullYear() + 1)
  }
  
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

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
  const currentTask = await prisma.task.update({
    where: { id: taskId },
    data: { status: 'Done' }
  })

  // 3. Simple Automations: Calculate next action
  let nextDate = new Date()
  
  if (callStatus === 'Connected') {
    // Fetch customer vehicles to get purchase date
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { vehicles: true }
    })
    const purchaseDate = customer?.vehicles[0]?.purchaseDate || new Date()
    
    // Calculate the next step in the standard feedback timeline
    nextDate = getNextFollowUpDate(purchaseDate, currentTask.dueDate)
  } else {
    // Callback or Not Connected: try again tomorrow
    nextDate.setDate(nextDate.getDate() + 1)
  }

  await prisma.task.create({
    data: {
      type: 'Call',
      status: 'Pending',
      dueDate: nextDate,
      customerId,
      userId,
    }
  })

  // 4. Automation: If Minor/Major Problem is selected OR any Problems Log is checked OR Notes are entered
  const shouldCreateComplaint = 
    bikeStatus === 'Major Problem' || 
    bikeStatus === 'Minor Problem' || 
    (problems && problems.trim().length > 0) || 
    (notes && notes.trim().length > 0)

  if (shouldCreateComplaint) {
    await prisma.complaint.create({
      data: {
        customerId,
        description: `Auto-generated from Call. Bike Status: ${bikeStatus || 'N/A'}. Problems: ${problems || 'None'}. Notes: ${notes || 'None'}`,
        status: 'Open',
      }
    })
  }

  // 5. Revalidate the page
  revalidatePath('/queue')
  revalidatePath('/')
  revalidatePath('/customers')

  if (shouldCreateComplaint) {
    const sessionUser = await getSessionUser()
    if (sessionUser?.role === 'Owner') {
      redirect('/complaints')
    } else {
      redirect('/queue')
    }
  }
}

export async function addCustomer(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const model = (formData.get('model') as string)?.trim()
  const dateStr = (formData.get('purchaseDate') as string)?.trim()
  const village = (formData.get('village') as string)?.trim()

  // 1. Check for compulsory fields
  if (!name) {
    return { error: 'Customer Name is required. Please type the customer\'s name.' }
  }
  if (!phone) {
    return { error: 'Phone Number is required. Please enter a 10-digit mobile number.' }
  }
  if (!model) {
    return { error: 'Vehicle Model is required. Please enter the model of the bike (e.g., Activa, Splendor).' }
  }
  if (!dateStr) {
    return { error: 'Purchase Date is required. Please select or enter the date when the vehicle was bought.' }
  }

  // 2. Validate Phone Number (must be at least 10 digits)
  const digitsOnly = phone.replace(/\D/g, '')
  if (digitsOnly.length < 10) {
    return { error: `The phone number "${phone}" is incomplete. Please enter a valid 10-digit mobile number.` }
  }

  // 3. Validate Date format (handles DD/MM/YYYY, DD/MM/YY, YYYY-MM-DD etc.)
  const normalizedDateStr = dateStr.replace(/-/g, '/')
  let parsedDate = new Date(normalizedDateStr)
  
  if (normalizedDateStr.includes('/')) {
    const parts = normalizedDateStr.split('/')
    let day = parts[0]
    let month = parts[1]
    let yearStr = parts[2]
    
    // Check if the format is YYYY/MM/DD or YY/MM/DD instead of Indian format DD/MM/YYYY
    if (parts[0] && parts[0].length === 4 || (parts[0] && parts[0].length === 2 && parseInt(parts[0]) > 31)) {
      yearStr = parts[0]
      month = parts[1]
      day = parts[2]
    }
    
    if (day && month && yearStr) {
      let year = parseInt(yearStr)
      if (yearStr.length === 2) {
        year = year < 80 ? 2000 + year : 1900 + year
      }
      parsedDate = new Date(`${year}-${month}-${day}`)
    }
  }

  if (isNaN(parsedDate.getTime())) {
    return { error: 'The Purchase Date is not formatted correctly. Please enter a valid date (e.g., DD/MM/YY or DD/MM/YYYY).' }
  }

  // Get dealership and user to associate the customer/task with
  const user = await getSessionUser()
  if (!user) throw new Error("No user found")
  
  let dealership = await prisma.dealership.findFirst()
  if (!dealership) dealership = await prisma.dealership.create({ data: { name: 'Honda Main Branch' } })
  
  // 4. Check for duplicate customer
  const existingCustomer = await prisma.customer.findFirst({
    where: { phone }
  })
  if (existingCustomer) {
    return { error: `Customer with mobile number ${phone} already exists in the system (Name: ${existingCustomer.name}).` }
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

  // Automatically put them in the queue for a follow up aligned to anniversary
  const initialDueDate = getInitialDueDate(parsedDate)
  await prisma.task.create({
    data: {
      type: 'Call',
      status: 'Pending',
      dueDate: initialDueDate,
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
