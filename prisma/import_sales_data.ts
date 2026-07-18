import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

// Simple CSV parser
function parseCSVRow(text: string) {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"' && text[i+1] === '"') {
      current += '"'
      i++
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

async function run() {
  const fileContent = fs.readFileSync('prisma/sales_data.csv', 'utf-8')
  const lines = fileContent.trim().split('\n').slice(1) // skip header
  
  let dealership = await prisma.dealership.findFirst()
  if (!dealership) {
    dealership = await prisma.dealership.create({ data: { name: 'Honda Main Branch' } })
  }
  
  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({ data: { name: 'Sales Executive', role: 'Sales', dealershipId: dealership.id } })
  }

  for (const line of lines) {
    if (!line.trim()) continue
    
    // Header format:
    // S.No,Date,Model,Color,Customer Name,Father Name,Address,Mobile 1,Mobile 2,Mobile 3,Finance,Vehicle Price,DP,Chassis No,Engine No,Key No,Remarks
    const parts = parseCSVRow(line)
    
    const customerName = parts[4]?.trim()
    if (!customerName) continue

    const mobile1 = parts[7]?.trim().replace(/[^0-9]/g, '')
    if (!mobile1) continue

    console.log(`Importing: ${customerName} - ${mobile1}`)

    const customer = await prisma.customer.create({
      data: {
        name: customerName,
        phone: mobile1,
        fatherName: parts[5]?.trim() || null,
        address: parts[6]?.trim() || null,
        phone2: parts[8]?.trim() || null,
        phone3: parts[9]?.trim() || null,
        dealershipId: dealership.id,
      }
    })

    const modelName = parts[2]?.trim()
    if (modelName) {
      const priceStr = parts[11]?.trim().replace(/[^0-9]/g, '')
      const dpStr = parts[12]?.trim().replace(/[^0-9]/g, '')

      await prisma.vehicle.create({
        data: {
          model: modelName,
          color: parts[3]?.trim() || null,
          finance: parts[10]?.trim() || null,
          price: priceStr ? parseInt(priceStr) : null,
          downPayment: dpStr ? parseInt(dpStr) : null,
          chassisNo: parts[13]?.trim() || null,
          engineNo: parts[14]?.trim() || null,
          keyNo: parts[15]?.trim() || null,
          remarks: parts[16]?.trim() || null,
          purchaseDate: new Date(),
          customerId: customer.id
        }
      })
    }

    await prisma.task.create({
      data: {
        type: 'Call',
        status: 'Pending',
        dueDate: new Date(),
        customerId: customer.id,
        userId: user.id
      }
    })
  }
  
  console.log("Import successful!")
}

run().catch(console.error).finally(() => prisma.$disconnect())
