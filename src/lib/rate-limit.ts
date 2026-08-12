// Rate limiting simple en memoria (para producción usar Redis)
const requests = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 30, // 30 requests por minuto por IP
}

const AUTH_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 10, // 10 intentos de auth por 15 min
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const key = identifier
  const existing = requests.get(key)

  if (!existing || existing.resetTime < now) {
    requests.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs }
  }

  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: existing.resetTime - now,
    }
  }

  existing.count++
  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetIn: existing.resetTime - now,
  }
}

export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  return forwarded?.split(',')[0]?.trim() || realIP || 'unknown'
}

export function authRateLimit(identifier: string) {
  return rateLimit(`auth:${identifier}`, AUTH_CONFIG)
}
