import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { getRateLimitConfig, classifyRoute } from "@/lib/rate-limit/config"
import {
  checkSlidingWindow,
  checkAuthLimit,
  getClientIp,
  createRateLimitResponse,
  applyRateLimitHeaders,
} from "@/lib/rate-limit/limiter"

const SECRET = process.env.NEXTAUTH_SECRET || "qurix-production-secret-2026"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only apply rate limiting to API routes
  if (!pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Skip static assets or internal health check / favicon if any
  if (pathname.startsWith("/api/cron")) {
    return NextResponse.next()
  }

  const clientIp = getClientIp(req)
  const config = getRateLimitConfig()

  // Attempt to extract authenticated session token
  let token: any = null
  try {
    token = await getToken({ req, secret: SECRET })
  } catch (err) {
    // If token parsing fails, continue as unauthenticated
    token = null
  }

  const isAuthenticated = !!(token && (token.id || token.email))
  const tier = classifyRoute(pathname, isAuthenticated)

  let result: ReturnType<typeof checkSlidingWindow>

  switch (tier) {
    case "AUTH": {
      // Stricter IP limits on authentication routes
      result = checkAuthLimit(clientIp, undefined, config)
      if (!result.allowed) {
        return createRateLimitResponse(
          result.retryAfter,
          result.limit,
          result.remaining,
          result.reset,
          `Too many authentication requests from this IP. Please wait ${result.retryAfter} second${result.retryAfter === 1 ? "" : "s"} before trying again.`
        )
      }
      break
    }

    case "AI_HEAVY": {
      // Specialized limits on computationally heavy AI routes
      const aiKey = isAuthenticated
        ? `ai:user:${token.id || token.email}`
        : `ai:ip:${clientIp}`
      result = checkSlidingWindow(aiKey, config.aiHeavy.maxRequests, config.aiHeavy.windowSec)
      if (!result.allowed) {
        return createRateLimitResponse(
          result.retryAfter,
          result.limit,
          result.remaining,
          result.reset,
          `AI processing rate limit exceeded. Please wait ${result.retryAfter} second${result.retryAfter === 1 ? "" : "s"} before submitting another request.`
        )
      }
      break
    }

    case "AUTHENTICATED": {
      // Looser limits for logged-in user actions
      const userKey = `user:${token.id || token.email}`
      result = checkSlidingWindow(
        userKey,
        config.authenticated.maxRequests,
        config.authenticated.windowSec
      )
      if (!result.allowed) {
        return createRateLimitResponse(
          result.retryAfter,
          result.limit,
          result.remaining,
          result.reset,
          `User request limit exceeded. Please wait ${result.retryAfter} second${result.retryAfter === 1 ? "" : "s"}.`
        )
      }
      break
    }

    case "PUBLIC":
    default: {
      // Moderate limits on public endpoints
      const publicIpKey = `public:ip:${clientIp}`
      result = checkSlidingWindow(
        publicIpKey,
        config.public.maxRequests,
        config.public.windowSec
      )
      if (!result.allowed) {
        return createRateLimitResponse(
          result.retryAfter,
          result.limit,
          result.remaining,
          result.reset,
          `Public rate limit reached. Please wait ${result.retryAfter} second${result.retryAfter === 1 ? "" : "s"}.`
        )
      }
      break
    }
  }

  // Request is allowed: attach standard rate limiting headers to the response
  const response = NextResponse.next()
  applyRateLimitHeaders(response.headers, result.limit, result.remaining, result.reset)
  return response
}

export const config = {
  matcher: ["/api/:path*"],
}
