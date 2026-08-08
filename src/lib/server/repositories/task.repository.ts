import { prisma } from '$lib/server/db'
import type { Task } from '$lib/types'

/**
 * Every method here takes the owner's userId and scopes the query by it, so a
 * task can only ever be read or changed by the account that created it.
 */
export class TaskRepository {
  /** Newest first — the list order the UI shows. */
  async listByUser(userId: number): Promise<Task[]> {
    return prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOwned(id: number, userId: number): Promise<Task | null> {
    return prisma.task.findFirst({ where: { id, userId } })
  }

  async create(userId: number, data: { item: string; isCompleted?: boolean }): Promise<Task> {
    return prisma.task.create({
      data: { item: data.item, isCompleted: data.isCompleted ?? false, userId },
    })
  }

  /** Returns null when the task does not exist or belongs to someone else. */
  async update(
    id: number,
    userId: number,
    data: { item?: string; isCompleted?: boolean }
  ): Promise<Task | null> {
    const { count } = await prisma.task.updateMany({ where: { id, userId }, data })
    if (count === 0) return null
    return prisma.task.findUnique({ where: { id } })
  }

  /** Returns the deleted task, or null when it does not exist or is not theirs. */
  async delete(id: number, userId: number): Promise<Task | null> {
    const task = await this.findOwned(id, userId)
    if (!task) return null
    await prisma.task.delete({ where: { id } })
    return task
  }
}

export const taskRepository = new TaskRepository()
