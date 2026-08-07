import { NextRequest, NextResponse } from 'next/server'
import { verifyCredentials, createSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()
  if (!verifyCredentials(username, password)) {
    return NextResponse.json(
      { error: 'Usuario o contraseña incorrectos' },
      { status: 401 },
    )
  }
  const token = await createSession(username)
  const res = NextResponse.json({ ok: true, username })
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
  return res
}
