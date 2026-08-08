import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { verifyPassword, createToken, setAuthCookie } from '$lib/server/auth'
import { userRepository } from '$lib/server/repositories'
import { loginSchema, firstError } from '$lib/server/validators/schemas'
import { apiHandler } from '$lib/server/guard'

/**
 * POST /api/v1/users/login
 *
 * 200 -> { access_token, userID, firstName }
 * 400 -> malformed body
 * 401 -> wrong email or password
 *
 * A wrong email and a wrong password return the same 401, so the response
 * cannot be used to work out which addresses are registered.
 */
export const POST: RequestHandler = apiHandler(async ({ request, cookies }) => {
  const parsed = loginSchema.safeParse(await request.json())
  if (!parsed.success) {
    return json({ message: firstError(parsed.error) }, { status: 400 })
  }

  const { email, password } = parsed.data
  const invalid = json(
    {
      message:
        'The email and password combination is not correct, please fill a correct email and password',
    },
    { status: 401 }
  )

  const user = await userRepository.findByEmailWithPassword(email)
  if (!user) return invalid
  if (!(await verifyPassword(password, user.password))) return invalid

  const token = createToken(user.id, user.email)
  setAuthCookie(cookies, token)

  return json({ access_token: token, userID: user.id, firstName: user.firstName })
})
