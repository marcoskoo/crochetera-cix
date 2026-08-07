import { NextResponse } from 'next/server'
import { getAuthToken, destroySession, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST() {
  const token = await getAuthToken()
  if (token) await destroySession(token)
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(SESSION_COOKIE_NAME)
  return res
}
