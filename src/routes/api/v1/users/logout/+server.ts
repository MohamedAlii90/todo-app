import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { clearAuthCookie } from '$lib/server/auth'

/** POST /api/v1/users/logout — clears the session cookie. */
export const POST: RequestHandler = async ({ cookies }) => {
  clearAuthCookie(cookies)
  return json({ message: 'Logged out successfully' })
}
