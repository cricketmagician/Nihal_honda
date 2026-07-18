import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  let dealer = await prisma.dealership.findFirst()
  if (!dealer) {
    dealer = await prisma.dealership.create({ data: { name: 'Honda Dealership' } })
  }

  // Owner
  await prisma.user.upsert({
    where: { username: 'owner' },
    update: { password: 'honda123', role: 'Owner' },
    create: { name: 'Owner', username: 'owner', password: 'honda123', role: 'Owner', dealershipId: dealer.id }
  })

  // Sales
  await prisma.user.upsert({
    where: { username: 'sales' },
    update: { password: 'honda123', role: 'Sales' },
    create: { name: 'Sales Executive', username: 'sales', password: 'honda123', role: 'Sales', dealershipId: dealer.id }
  })
  
  console.log("Successfully created owner and sales accounts")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
