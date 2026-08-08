import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { apiHandler, requireUser } from '$lib/server/guard'

/** GET /api/v1/users/me — the signed-in user, for token smoke-checks. */
export const GET: RequestHandler = apiHandler(async (event) => {
  return json({ user: requireUser(event) })
})
