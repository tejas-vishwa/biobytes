import { NextResponse } from "next/server"
import { getRateLimitConfig, RateLimitingConfig } from "./config"
import { rateLimitStore } from "./store"

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter: number
  reason?: "IP_LIMIT_EXCEEDED" | "ACCOUNT_BACKOFF_ACTIVE"
  consecutiveFailures?: number
}

/**
 * Extracts client IP from incoming request or headers.
 */
export function getClientIp(reqOrHeaders: Request | Headers | { headers: Headers }): string {
  let headers: Headers

  if ("headers" in reqOrHeaders) {
    headers = reqOrHeaders.headers instanceof Headers ? reqOrHeaders.headers : new Headers(reqOrHeaders.headers as any)
  } else {
    headers = reqOrHeaders
  }

  // Common headers in order of priority
  const candidates = [
    headers.get("x-forwarded-for"),
    headers.get("x-real-ip"),
    headers.get("cf-connecting-ip"),
    headers.get("true-client-ip"),
    headers.get("x-client-ip"),
  ]

  for (const candidate of candidates) {
    if (candidate) {
      // In case of comma-separated proxies, take the first/original client IP
      const firstIp = candidate.split(",")[0].trim()
      if (firstIp) return firstIp
    }
  }

  return "127.0.0.1"
}

/**
 * Checks a sliding window rate limit for any arbitrary key.
 */
export function checkSlidingWindow(
  key: string,
  limit: number,
  windowSec: number,
  now: number = Date.now()
): RateLimitResult {
  const { count, oldestHit } = rateLimitStore.hitSlidingWindow(key, windowSec, now)
  const allowed = count <= limit
  const remaining = Math.max(0, limit - count)
  const reset = Math.ceil((oldestHit + windowSec * 1000) / 1000)
  const retryAfter = allowed ? 0 : Math.max(1, reset - Math.ceil(now / 1000))

  return {
    allowed,
    limit,
    remaining,
    reset,
    retryAfter,
    reason: allowed ? undefined : "IP_LIMIT_EXCEEDED",
  }
}

/**
 * Checks authentication rate limits combining IP limit and account-level exponential backoff.
 */
export function checkAuthLimit(
  ip: string,
  accountIdentifier?: string,
  config: RateLimitingConfig = getRateLimitConfig(),
  now: number = Date.now()
): RateLimitResult {
  // 1. Check if account is in exponential backoff penalty
  if (accountIdentifier) {
    const normalizedIdentifier = accountIdentifier.trim().toLowerCase()
    const accountKey = `auth:account:${normalizedIdentifier}`
    const accountState = rateLimitStore.getAuthAccountState(accountKey, now)

    if (accountState && accountState.blockedUntil > now) {
      const retryAfter = Math.ceil((accountState.blockedUntil - now) / 1000)
      return {
        allowed: false,
        limit: config.auth.accountMaxAttempts,
        remaining: 0,
        reset: Math.ceil(accountState.blockedUntil / 1000),
        retryAfter,
        reason: "ACCOUNT_BACKOFF_ACTIVE",
        consecutiveFailures: accountState.consecutiveFailures,
      }
    }
  }

  // 2. Check IP rate limit for auth endpoints
  const ipKey = `auth:ip:${ip}`
  const ipResult = checkSlidingWindow(ipKey, config.auth.ipMax, config.auth.ipWindowSec, now)

  if (!ipResult.allowed) {
    return {
      ...ipResult,
      reason: "IP_LIMIT_EXCEEDED",
    }
  }

  return ipResult
}

/**
 * Records an authentication failure for both IP and account identifier, calculating exponential backoff.
 */
export function recordAuthFailure(
  ip: string,
  accountIdentifier?: string,
  config: RateLimitingConfig = getRateLimitConfig(),
  now: number = Date.now()
): { blockedUntil: number; retryAfter: number; consecutiveFailures: number } {
  if (!accountIdentifier) {
    return { blockedUntil: 0, retryAfter: 0, consecutiveFailures: 0 }
  }

  const normalizedIdentifier = accountIdentifier.trim().toLowerCase()
  const accountKey = `auth:account:${normalizedIdentifier}`

  return rateLimitStore.recordAuthFailure(accountKey, config.auth, now)
}

/**
 * Clears consecutive failed authentication attempts on successful auth.
 */
export function recordAuthSuccess(ip: string, accountIdentifier?: string): void {
  if (accountIdentifier) {
    const normalizedIdentifier = accountIdentifier.trim().toLowerCase()
    const accountKey = `auth:account:${normalizedIdentifier}`
    rateLimitStore.recordAuthSuccess(accountKey)
  }
}

/**
 * Creates a standard JSON 429 Too Many Requests response with standard RFC rate limit headers.
 */
export function createRateLimitResponse(
  retryAfter: number,
  limit?: number,
  remaining: number = 0,
  reset?: number,
  customMessage?: string
): NextResponse {
  const message =
    customMessage ||
    `Too many requests. Please slow down and try again in ${retryAfter} second${retryAfter === 1 ? "" : "s"}.`

  const headers: Record<string, string> = {
    "Retry-After": retryAfter.toString(),
    "Content-Type": "application/json",
  }

  if (limit !== undefined) {
    headers["X-RateLimit-Limit"] = limit.toString()
  }
  headers["X-RateLimit-Remaining"] = remaining.toString()
  if (reset !== undefined) {
    headers["X-RateLimit-Reset"] = reset.toString()
  }

  return new NextResponse(
    JSON.stringify({
      error: message,
      retryAfter,
    }),
    {
      status: 429,
      headers,
    }
  )
}

/**
 * Attaches rate limit information headers to a response.
 */
export function applyRateLimitHeaders(
  headers: Headers,
  limit: number,
  remaining: number,
  reset: number
): void {
  headers.set("X-RateLimit-Limit", limit.toString())
  headers.set("X-RateLimit-Remaining", remaining.toString())
  headers.set("X-RateLimit-Reset", reset.toString())
}
