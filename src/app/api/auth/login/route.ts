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
  // Detectar si la conexión original del cliente fue HTTPS vía el header
  // X-Forwarded-Proto que inyecta el proxy Caddy. NO usar NODE_ENV porque
  // en el sandbox la conexión interna Caddy→Next.js es HTTP aunque el
  // cliente navegue por HTTPS, y poner secure=true haría que el navegador
  // rechazara la cookie.
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
