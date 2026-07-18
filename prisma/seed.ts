import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const dealer = await prisma.dealership.create({
    data: { name: 'Honda City Motors' },
  })

  const user = await prisma.user.create({
    data: { name: 'John Salesman', role: 'Sales Executive', dealershipId: dealer.id },
  })

  const customer1 = await prisma.customer.create({
    data: {
      name: 'Alice Smith',
      phone: '555-0101',
      dealershipId: dealer.id,
      vehicles: {
        create: { model: 'Honda Civic', purchaseDate: new Date() },
      },
      tasks: {
        create: { type: 'Call', status: 'Pending', dueDate: new Date(), userId: user.id },
      },
    },
  })
  
  const customer2 = await prisma.customer.create({
    data: {
      name: 'Bob Johnson',
      phone: '555-0102',
      dealershipId: dealer.id,
      vehicles: {
        create: { model: 'Honda CR-V', purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      tasks: {
        create: { type: 'Call', status: 'Pending', dueDate: new Date(), userId: user.id },
      },
    },
  })

  console.log('Seeded successfully with Dealership, User, Customers, and Tasks.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
