import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

/** `/` is just a doorway: signed in -> /todo, otherwise the layout sends you to /login. */
export const load: PageServerLoad = async () => {
  redirect(303, '/todo')
}
