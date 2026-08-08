import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { hashPassword, createToken, setAuthCookie } from '$lib/server/auth'
import { userRepository } from '$lib/server/repositories'
import { signupSchema, firstError } from '$lib/server/validators/schemas'
import { apiHandler } from '$lib/server/guard'

/**
 * POST /api/v1/users/register
 *
 * 201 -> { access_token, userID, firstName }
 * 400 -> validation error, or the email is already taken
 */
export const POST: RequestHandler = apiHandler(async ({ request, cookies }) => {
  const parsed = signupSchema.safeParse(await request.json())
  if (!parsed.success) {
    return json({ message: firstError(parsed.error) }, { status: 400 })
  }

  const { firstName, lastName, email, password } = parsed.data

  if (await userRepository.findByEmail(email)) {
    return json({ message: 'Email is already exists in the Database' }, { status: 400 })
  }

  const user = await userRepository.create({
    email,
    password: await hashPassword(password),
    firstName,
    lastName,
  })

  const token = createToken(user.id, user.email)
  setAuthCookie(cookies, token)

  return json(
    { access_token: token, userID: user.id, firstName: user.firstName },
    { status: 201 }
  )
})
