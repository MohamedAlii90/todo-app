import { prisma } from '$lib/server/db'
import type { User } from '$lib/types'

const publicFields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  createdAt: true,
  updatedAt: true,
} as const

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email }, select: publicFields })
  }

  /** Includes the password hash — only for the login check. */
  async findByEmailWithPassword(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  async create(data: {
    email: string
    password: string
    firstName: string
    lastName: string
  }): Promise<User> {
    return prisma.user.create({ data, select: publicFields })
  }
}

export const userRepository = new UserRepository()
