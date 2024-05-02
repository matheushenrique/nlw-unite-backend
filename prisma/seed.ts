import { prisma } from "../src/lib/prisma";

async function seed() {
  await prisma.event.create({
    data: {
      id: '10891b77-1075-4f54-a028-005df440e903',
      title: 'Unite Summit',
      slug: 'unite-summit',
      details: 'Um evento para apaixonados',
      maximumAttendees: 20
    }
  })
}

seed().then(() => {
  console.log('Database seeded!')
  prisma.$disconnect()
})