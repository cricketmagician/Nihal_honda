import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function run() {
  const fileContent = fs.readFileSync('prisma/hero_data.tsv', 'utf-8')
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
    
    // Format: Page	Model	Customer Name	Father Name	Mobile	Chassis No.	Engine No.	Model Code	Key No.	Finance	Price	DP
    const parts = line.split('\t')
    
    const customerName = parts[2]?.trim()
    if (!customerName) continue

    const mobileFull = parts[4]?.trim() || ''
    const mobiles = mobileFull.split(',').map(m => m.replace(/[^0-9]/g, ''))
    
    const mobile1 = mobiles[0]
    if (!mobile1 || mobile1 === '') continue
    
    const mobile2 = mobiles.length > 1 ? mobiles[1] : null
    const mobile3 = mobiles.length > 2 ? mobiles[2] : null

    console.log(`Importing: ${customerName} - ${mobile1}`)

    const customer = await prisma.customer.create({
      data: {
        name: customerName,
        phone: mobile1,
        phone2: mobile2,
        phone3: mobile3,
        fatherName: parts[3]?.trim() !== '—' ? parts[3]?.trim() : null,
        dealershipId: dealership.id,
      }
    })

    const modelName = parts[1]?.trim()
    if (modelName) {
      const priceStr = parts[10]?.trim().replace(/[^0-9]/g, '')
      const dpStr = parts[11]?.trim().replace(/[^0-9]/g, '')

      await prisma.vehicle.create({
        data: {
          model: modelName,
          purchaseDate: new Date(),
          chassisNo: parts[5]?.trim() !== '—' ? parts[5]?.trim() : null,
          engineNo: parts[6]?.trim() !== '—' ? parts[6]?.trim() : null,
          keyNo: parts[8]?.trim() !== '—' ? parts[8]?.trim() : null,
          finance: parts[9]?.trim() !== '—' ? parts[9]?.trim() : null,
          price: priceStr ? parseInt(priceStr) : null,
          downPayment: dpStr ? parseInt(dpStr) : null,
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
