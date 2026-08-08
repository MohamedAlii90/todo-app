import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * Seeds the demo account the courses log in with:
 * user@qacart.com / Test@1234
 */
async function main() {
  await prisma.task.deleteMany()
  await prisma.user.deleteMany()

  const user = await prisma.user.create({
    data: {
      email: 'user@qacart.com',
      password: await bcrypt.hash('Test@1234', 10),
      firstName: 'QAcart',
      lastName: 'User',
    },
  })

  console.log(`Seeded demo user ${user.email} (password: Test@1234) with no tasks.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
