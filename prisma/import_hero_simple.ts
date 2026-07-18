import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

// Parse DD/MM/YYYY to Date object
function parseDate(dateStr: string) {
  if (!dateStr || dateStr === '—') return new Date()
  const [day, month, year] = dateStr.split('/')
  return new Date(`${year}-${month}-${day}`)
}

const translationMap: Record<string, string> = {
  "उदित नारायण": "Udit Narayan",
  "उमेश मिंज": "Umesh Minj",
  "राम दुलारे": "Ram Dulare",
  "बादल": "Badal",
}

async function run() {
  const fileContent = fs.readFileSync('prisma/hero_data_simple.tsv', 'utf-8')
  const lines = fileContent.trim().split('\n').slice(1)
  
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
    
    // Header format: Entry	Date	Vehicle Model	Customer Name	Mobile 1	Mobile 2	Address
    const parts = line.split('\t')
    
    const hindiName = parts[3]?.trim()
    if (!hindiName) continue

    const name = translationMap[hindiName] ? `${translationMap[hindiName]} (${hindiName})` : hindiName

    const mobile1 = parts[4]?.trim().replace(/[^0-9]/g, '')
    if (!mobile1 || mobile1 === '') continue
    
    const mobile2 = parts[5]?.trim().replace(/[^0-9]/g, '')
    const address = parts[6]?.trim() === '—' ? null : parts[6]?.trim()

    console.log(`Importing: ${name} - ${mobile1}`)

    const customer = await prisma.customer.create({
      data: {
        name: name,
        phone: mobile1,
        phone2: mobile2 || null,
        address: address || null,
        dealershipId: dealership.id,
      }
    })

    const modelName = parts[2]?.trim()
    if (modelName) {
      await prisma.vehicle.create({
        data: {
          model: modelName,
          purchaseDate: parseDate(parts[1]?.trim()),
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
