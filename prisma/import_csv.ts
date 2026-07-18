import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const csvData = `S.No,Customer Name (English),Customer Name (Hindi),Father/Spouse (English),Father/Spouse (Hindi),Model,Finance,Mobile,Vehicle Price,Booking/DP,Other Payments,Balance,Notes
1,Tanmay Pandey,तनमय पाण्डेय,Pramod Pandey,प्रमोद पाण्डेय,Jupiter 125,,9826085388,112000,25000,"UPI 87000; UPI 25000 (14/06/2025)",62000,Helmet Gift
2,Ravi Thakur,रवि ठाकुर,Jitendra Thakur,जितेन्द्र ठाकुर,Jupiter 125,Berar Finance,"8269933502;7999946663",124000,25000,,,Both keys received
3,Harday Singh,हृदय सिंह,Manbodh Singh,मनबोध सिंह,XL100,Berar Finance,7828789598,77000,18000,"10000 (22/06/25);6000 (23/06/25);2000 Online (25/06/25)",0,Payment completed
4,Pradeep Kumar Singh,प्रदीप कुमार सिंह,Hanslal Sahu,हंसलाल साहू,Ntorq 125,,7670696930,123000,50000,"72000 (09/07/2025)",1000,Full Paid
5,Lakhan,लक्ष्मण,Devnarayan,देवनारायण,XL100 i-Touch Comfort,Berar Finance,9302765088,82000,19000,"15000;4000 (25/08/2025)",0,Clear DP
6,Ramanuj Singh,रामानुज सिंह,Jai Singh,जय सिंह,XL100 i-Touch Comfort,, "7828511037;6265024427",78500,78500,,0,Full Paid
7,Umesh Lal,उमेश लाल,Ramhit,रामहित,Ntorq 125,,7697863377,130000,50000,"37000 (07/11/25);40000 (20/11/25)",3000,
8,Vikash Thakur,विकास ठाकुर,Banwari Thakur,बनवारी ठाकुर,Raider,, "7803007174;6260461846",125000,50000,,75000,Will pay by February
9,Krishna Ram,कृष्ण राम,Dev Sai Ram,देव साई राम,Ntorq 125,,8718956138,,,,,
10,Munna,मुन्ना,Nawal Say,नवल साय,Jupiter 125,,7987571924,110000,30000,29000,,,
11,Brij Lal,बृजलाल,Amrit Lal,अमृत लाल,Ntorq,,8120575050,120000,35000,"20000 (13/04/26);64000 (15/04/26)",0,Full Paid
12,Ajeet Kumar Mishra,अजीत कुमार मिश्रा,Late Arun Mishra,स्व. अरुण मिश्रा,Jupiter 125,,9244817197,115000,25000,"20000 received;5200 (15/05/26)",,
13,Rohit Minj,,Anil Minj,,Jupiter,,8643004796,100000,100000,,0,Full Paid
14,Anup Kumar,,Ramprasad,,Jupiter 125,Berar Finance,6260964387,115000,35000,,80000,
15,Raja Giri,,Punmai Giri,,Jupiter,,9340938628,107000,,,,Price noted; DP not mentioned
16,Manoj Kumar,,Bheem Bhaiya,,Ntorq 150,Berar Finance,"7974897064;9617534257",145000,38270,30000,76730,"₹8,270 pending towards DP"`

// Simple CSV parser that handles basic quotes
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
  console.log("Importing CSV Data...")
  
  // Find or create dealership
  let dealership = await prisma.dealership.findFirst()
  if (!dealership) {
    dealership = await prisma.dealership.create({ data: { name: 'Honda Main Branch' } })
  }
  
  // Find first user to assign tasks to (fallback to system user if none)
  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({ data: { name: 'Sales Executive', role: 'Sales', dealershipId: dealership.id } })
  }

  const lines = csvData.trim().split('\n').slice(1) // skip header
  
  for (const line of lines) {
    if (!line.trim()) continue
    
    const parts = parseCSVRow(line)
    const nameEng = parts[1]?.trim()
    const model = parts[5]?.trim()
    const mobileRaw = parts[7]?.trim()
    
    // Some mobiles have multiple numbers separated by ;
    const primaryMobile = mobileRaw ? mobileRaw.split(';')[0].replace(/[^0-9]/g, '') : ''
    
    if (!nameEng || !primaryMobile) continue
    
    console.log(`Importing: ${nameEng} - ${primaryMobile}`)

    // Create Customer
    const customer = await prisma.customer.create({
      data: {
        name: nameEng,
        phone: primaryMobile,
        dealershipId: dealership.id,
      }
    })

    // Create Vehicle if model exists
    if (model) {
      await prisma.vehicle.create({
        data: {
          model: model,
          purchaseDate: new Date(),
          customerId: customer.id
        }
      })
    }

    // Assign a default "Pending" Follow-up task for today
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
