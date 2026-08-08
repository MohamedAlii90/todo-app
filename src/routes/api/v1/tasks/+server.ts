import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { apiHandler, requireUser } from '$lib/server/guard'
import { taskRepository } from '$lib/server/repositories'
import { createTaskSchema, firstError } from '$lib/server/validators/schemas'

/**
 * GET /api/v1/tasks — the signed-in user's tasks, newest first.
 * 200 -> { tasks: Task[] }
 */
export const GET: RequestHandler = apiHandler(async (event) => {
  const user = requireUser(event)
  return json({ tasks: await taskRepository.listByUser(user.id) })
})

/**
 * POST /api/v1/tasks — create a task owned by the signed-in user.
 * 201 -> Task
 * 400 -> validation error
 */
export const POST: RequestHandler = apiHandler(async (event) => {
  const user = requireUser(event)

  const parsed = createTaskSchema.safeParse(await event.request.json())
  if (!parsed.success) {
    return json({ message: firstError(parsed.error) }, { status: 400 })
  }

  const task = await taskRepository.create(user.id, parsed.data)
  return json(task, { status: 201 })
})
