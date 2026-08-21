import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware para manejar el health check endpoint del gateway
// Next.js excluye las carpetas que empiezan con _ del routing,
// así que manejamos /__health aquí directamente.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/__health') {
    return NextResponse.json(
      { status: 'ok', timestamp: new Date().toISOString(), service: 'crochetera-cix' },
      { status: 200 },
    )
  }
  return NextResponse.next()
}

export const config = {
  // Aplicar solo a /__health para no afectar el resto de rutas
  matcher: ['/__health'],
}
