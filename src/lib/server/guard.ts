import { json } from '@sveltejs/kit'
import type { RequestEvent } from '@sveltejs/kit'
import type { User } from '$lib/types'

/**
 * Thrown by requireUser() when there is no session. API routes catch it and
 * turn it into the 401 body the course material expects.
 */
export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized, please insert a correct token')
    this.name = 'UnauthorizedError'
  }
}

export function requireUser(event: RequestEvent): User {
  if (!event.locals.user) throw new UnauthorizedError()
  return event.locals.user
}

/**
 * Wraps an API handler so an UnauthorizedError becomes a 401 and anything else
 * becomes a generic 500, instead of leaking a stack trace.
 */
export function apiHandler<T extends RequestEvent>(
  handler: (event: T) => Promise<Response>
): (event: T) => Promise<Response> {
  return async (event: T) => {
    try {
      return await handler(event)
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        return json({ message: err.message }, { status: 401 })
      }
      console.error('API error:', err)
      return json({ message: 'Something went wrong, please try again' }, { status: 500 })
    }
  }
}
