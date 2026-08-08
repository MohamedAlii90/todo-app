import { z } from 'zod'

/**
 * The validation rules for the whole app.
 *
 * Forms and API handlers both read from here, so the UI and the endpoint can
 * never disagree about what counts as valid.
 */

export const NAME_MIN = 2
export const NAME_MAX = 30
export const PASSWORD_MIN = 8
export const TASK_ITEM_MIN = 3
export const TASK_ITEM_MAX = 120

export const signupSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(NAME_MIN, `First name must be at least ${NAME_MIN} characters`)
    .max(NAME_MAX, `First name must be at most ${NAME_MAX} characters`),
  lastName: z
    .string()
    .trim()
    .min(NAME_MIN, `Last name must be at least ${NAME_MIN} characters`)
    .max(NAME_MAX, `Last name must be at most ${NAME_MAX} characters`),
  email: z.string().trim().toLowerCase().email('Please insert a correct email format'),
  password: z.string().min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please insert a correct email format'),
  password: z.string().min(1, 'Password is required'),
})

export const createTaskSchema = z.object({
  item: z
    .string()
    .trim()
    .min(TASK_ITEM_MIN, `Todo item must be at least ${TASK_ITEM_MIN} characters`)
    .max(TASK_ITEM_MAX, `Todo item must be at most ${TASK_ITEM_MAX} characters`),
  isCompleted: z.boolean().optional().default(false),
})

export const updateTaskSchema = z
  .object({
    item: z
      .string()
      .trim()
      .min(TASK_ITEM_MIN, `Todo item must be at least ${TASK_ITEM_MIN} characters`)
      .max(TASK_ITEM_MAX, `Todo item must be at most ${TASK_ITEM_MAX} characters`)
      .optional(),
    isCompleted: z.boolean().optional(),
  })
  .refine((data) => data.item !== undefined || data.isCompleted !== undefined, {
    message: 'Nothing to update: provide item, isCompleted, or both',
  })

/** The first error message only — what the API returns to the client. */
export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Invalid request body'
}
