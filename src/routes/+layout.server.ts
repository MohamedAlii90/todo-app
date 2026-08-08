import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

const PUBLIC_ROUTES = ['/login', '/signup']

/**
 * Auth is resolved on the server before anything renders, so the redirect
 * happens before the HTML is sent and a signed-out visitor never catches a
 * glimpse of a protected page.
 */
export const load: LayoutServerLoad = async ({ locals, url }) => {
  const isPublicRoute = PUBLIC_ROUTES.includes(url.pathname)

  if (!locals.user && !isPublicRoute) {
    redirect(303, '/login')
  }

  if (locals.user && isPublicRoute) {
    redirect(303, '/todo')
  }

  return { user: locals.user }
}
