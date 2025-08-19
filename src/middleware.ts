import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create a new ratelimiter that allows 10 requests per 10 seconds
// You'll need to set up Upstash Redis and add the environment variables
const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
      analytics: true,
    })
  : null

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Configure allowed origins (update this for production)
    const allowedOrigins = [
      'http://localhost:3000',
      'https://estilador-revisor-site.vercel.app',
      // Add your production domain here
    ]
    
    const origin = request.headers.get('origin')
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400')
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: response.headers })
    }
    
    // Apply rate limiting to API routes
    if (ratelimit && request.nextUrl.pathname === '/api/process-document') {
      try {
        // Get IP address for rate limiting
        const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous'
        const { success, limit, reset, remaining } = await ratelimit.limit(ip)
        
        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit', limit.toString())
        response.headers.set('X-RateLimit-Remaining', remaining.toString())
        response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString())
        
        if (!success) {
          return new NextResponse(
            JSON.stringify({
              error: 'Muitas requisições. Por favor, aguarde antes de tentar novamente.',
              retryAfter: Math.ceil((reset - Date.now()) / 1000)
            }),
            {
              status: 429,
              headers: {
                ...response.headers,
                'Content-Type': 'application/json',
                'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString()
              }
            }
          )
        }
      } catch (error) {
        // If rate limiting fails, log error but continue
        console.error('Rate limiting error:', error)
      }
    }
  }
  
  // Content Security Policy
  if (!request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data:",
        "connect-src 'self' https://api.openai.com https://vercel.live wss://vercel.live",
        "frame-src 'self' https://vercel.live",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
      ].join('; ')
    )
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}