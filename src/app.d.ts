import type { User } from '$lib/types'

declare global {
  namespace App {
    interface Locals {
      /**
       * The signed-in user, resolved once per request by the handle hook in
       * src/hooks.server.ts from either the Bearer token or the session
       * cookie. Null when not signed in.
       */
      user: User | null
    }
  }
}

export {}
