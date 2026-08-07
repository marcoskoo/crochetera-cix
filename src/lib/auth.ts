import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { db } from './db'
import { ADMIN_CREDENTIALS } from './types'

const SESSION_COOKIE = 'crochetera_admin_session'
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7 // 7 días

export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

export async function createSession(username: string): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  await db.adminSession.create({
    data: { token, username, expiresAt },
  })
  return token
}

export async function validateSession(token: string): Promise<boolean> {
  if (!token) return false
  const session = await db.adminSession.findUnique({
    where: { token },
  })
  if (!session) return false
  if (session.expiresAt < new Date()) {
    await db.adminSession.delete({ where: { token } })
    return false
  }
  return true
}

export async function destroySession(token: string): Promise<void> {
  try {
    await db.adminSession.delete({ where: { token } })
  } catch {
    // ignore
  }
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken()
  if (!token) return false
  return validateSession(token)
}

export function verifyCredentials(username: string, password: string): boolean {
  return (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  )
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE
export const SESSION_MAX_AGE = SESSION_DURATION_MS / 1000
