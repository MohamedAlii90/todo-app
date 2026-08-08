import type { PageServerLoad } from './$types'
import { taskRepository } from '$lib/server/repositories'

/**
 * Tasks are loaded on the server and rendered with the page, so the list
 * arrives complete rather than flashing an empty state while it fetches.
 */
export const load: PageServerLoad = async ({ locals }) => {
  // The layout load has already redirected anonymous visitors to /login.
  const user = locals.user!
  return { tasks: await taskRepository.listByUser(user.id) }
}
