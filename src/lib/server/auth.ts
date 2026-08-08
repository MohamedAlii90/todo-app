import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { Cookies, RequestEvent } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import { prisma } from './db'
import type { User } from '$lib/types'

export const AUTH_COOKIE_NAME = 'access_token'

const SALT_ROUNDS = 10
const JWT_EXPIRES_IN = '30d'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30

function jwtSecret(): string {
  return env.JWT_SECRET || 'fallback-secret-change-in-production'
}

interface JWTPayload {
  userId: number
  email: string
  iat?: number
  exp?: number
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function createToken(userId: number, email: string): string {
  return jwt.sign({ userId, email } as JWTPayload, jwtSecret(), { expiresIn: JWT_EXPIRES_IN })
}

function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, jwtSecret()) as JWTPayload
  } catch {
    // Invalid signature, malformed, or expired.
    return null
  }
}

/**
 * Sets the session cookie.
 *
 * httpOnly: the session is resolved on the server before the page renders, so
 * page code never needs to read the token.
 */
export function setAuthCookie(cookies: Cookies, token: string): void {
  cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE_SECONDS,
    path: '/',
  })
}

export function clearAuthCookie(cookies: Cookies): void {
  cookies.delete(AUTH_COOKIE_NAME, { path: '/' })
}

/**
 * Resolves the signed-in user for a request.
 *
 * Two sources, in order:
 *   1. `Authorization: Bearer <token>` — for API clients and API tests.
 *   2. The httpOnly session cookie — what the browser UI uses.
 *
 * Called once per request by the handle hook, which puts the result on
 * event.locals.user.
 */
export async function getUserFromEvent(event: RequestEvent): Promise<User | null> {
  const authHeader = event.request.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
  const token = bearer || event.cookies.get(AUTH_COOKIE_NAME)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}
