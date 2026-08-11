import { NextRequest, NextResponse } from 'next/server'
import { verifyCredentials, createSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/auth'
import { authRateLimit, getClientIP } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // Rate limiting: máximo 10 intentos por IP cada 15 minutos
  const clientIP = getClientIP(req)
  const limit = authRateLimit(clientIP)
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Demasiados intentos. Intenta de nuevo en ${Math.ceil(limit.resetIn / 60000)} minutos.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(limit.resetIn / 1000)),
        },
      },
    )
  }

  const { username, password } = await req.json()
  if (!verifyCredentials(username, password)) {
    return NextResponse.json(
      { error: 'Usuario o contraseña incorrectos' },
      { status: 401 },
    )
  }
  const token = await createSession(username)
  const res = NextResponse.json({ ok: true, username })
  const forwardedProto = req.headers.get('x-forwarded-proto') || ''
  const isHttps = forwardedProto.toLowerCase() === 'https'
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps,
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
  return res
}
