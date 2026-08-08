import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { apiHandler, requireUser } from '$lib/server/guard'
import { taskRepository } from '$lib/server/repositories'
import { updateTaskSchema, firstError } from '$lib/server/validators/schemas'

const notFound = () =>
  json({ message: 'We could not find the task in our database' }, { status: 404 })

/** Ids are integers now, so a non-numeric id is a 404 rather than a cast error. */
function parseId(raw: string): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

/**
 * GET /api/v1/tasks/:id — one task, if the caller owns it.
 * 200 -> Task | 404 -> unknown id, or someone else's task
 *
 * A task owned by another user answers 404 rather than 403, so the response
 * does not confirm that the id exists.
 */
export const GET: RequestHandler = apiHandler(async (event) => {
  const user = requireUser(event)
  const id = parseId(event.params.id)
  if (!id) return notFound()

  const task = await taskRepository.findOwned(id, user.id)
  return task ? json(task) : notFound()
})

/**
 * PUT /api/v1/tasks/:id — update item and/or isCompleted.
 * 200 -> Task | 400 -> validation error | 404 -> not the caller's task
 */
export const PUT: RequestHandler = apiHandler(async (event) => {
  const user = requireUser(event)
  const id = parseId(event.params.id)
  if (!id) return notFound()

  const parsed = updateTaskSchema.safeParse(await event.request.json())
  if (!parsed.success) {
    return json({ message: firstError(parsed.error) }, { status: 400 })
  }

  const task = await taskRepository.update(id, user.id, parsed.data)
  return task ? json(task) : notFound()
})

/**
 * DELETE /api/v1/tasks/:id
 * 200 -> the deleted Task | 404 -> not the caller's task
 */
export const DELETE: RequestHandler = apiHandler(async (event) => {
  const user = requireUser(event)
  const id = parseId(event.params.id)
  if (!id) return notFound()

  const task = await taskRepository.delete(id, user.id)
  return task ? json(task) : notFound()
})
