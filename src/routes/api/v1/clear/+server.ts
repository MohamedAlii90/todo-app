import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { apiHandler, requireUser } from '$lib/server/guard'
import { prisma } from '$lib/server/db'

/**
 * Test-data reset hook: deletes every task belonging to the caller.
 *
 * Scoped to the signed-in user, so one test run cannot disturb another account.
 * To reset the entire database instead, run `npm run reset`.
 *
 * Exposed as both GET and DELETE: DELETE is the honest verb, GET is convenient
 * to hit from a browser or a fixture.
 */
const clear: RequestHandler = apiHandler(async (event) => {
  const user = requireUser(event)
  const { count } = await prisma.task.deleteMany({ where: { userId: user.id } })
  return json({ message: `Deleted ${count} task(s)`, deletedCount: count })
})

export const GET = clear
export const DELETE = clear
