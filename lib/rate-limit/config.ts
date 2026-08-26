export type RateLimitTier = "AUTH" | "PUBLIC" | "AUTHENTICATED" | "AI_HEAVY"

export interface AuthRateLimitConfig {
  /** Max requests per IP within the IP window */
  ipMax: number
  /** Window for IP rate limiting in seconds */
  ipWindowSec: number
  /** Max failed attempts on an account before exponential backoff activates */
  accountMaxAttempts: number
  /** Tracking window for failed attempts in seconds (default 15 mins) */
  accountWindowSec: number
  /** Base delay in seconds for exponential backoff (e.g. 2s) */
  backoffBaseSec: number
  /** Multiplier for exponential backoff (e.g. 2 -> 2s, 4s, 8s, 16s...) */
  backoffMultiplier: number
  /** Maximum backoff delay cap in seconds (default 15 mins) */
  backoffMaxSec: number
}

export interface WindowRateLimitConfig {
  /** Max requests allowed per window */
  maxRequests: number
  /** Window duration in seconds */
  windowSec: number
}

export interface RateLimitingConfig {
  auth: AuthRateLimitConfig
  public: WindowRateLimitConfig
  authenticated: WindowRateLimitConfig
  aiHeavy: WindowRateLimitConfig
}

/**
 * Parses integer environment variable with fallback default
 */
function getEnvInt(key: string, defaultValue: number): number {
  const val = process.env[key]
  if (!val) return defaultValue
  const parsed = parseInt(val, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Parses float environment variable with fallback default
 */
function getEnvFloat(key: string, defaultValue: number): number {
  const val = process.env[key]
  if (!val) return defaultValue
  const parsed = parseFloat(val)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Centralized, fully configurable rate limiting parameters.
 * Values can be configured via environment variables.
 */
export function getRateLimitConfig(): RateLimitingConfig {
  return {
    auth: {
      ipMax: getEnvInt("RATE_LIMIT_AUTH_IP_MAX", 10), // 10 auth requests per minute per IP
      ipWindowSec: getEnvInt("RATE_LIMIT_AUTH_IP_WINDOW_SEC", 60),
      accountMaxAttempts: getEnvInt("RATE_LIMIT_AUTH_ACCOUNT_MAX", 5), // 5 failed attempts before backoff kicks in
      accountWindowSec: getEnvInt("RATE_LIMIT_AUTH_ACCOUNT_WINDOW_SEC", 900), // 15 mins tracking
      backoffBaseSec: getEnvFloat("RATE_LIMIT_AUTH_BACKOFF_BASE_SEC", 2), // 2s base backoff
      backoffMultiplier: getEnvFloat("RATE_LIMIT_AUTH_BACKOFF_MULTIPLIER", 2), // 2x exponential growth
      backoffMaxSec: getEnvInt("RATE_LIMIT_AUTH_BACKOFF_MAX_SEC", 900), // Max 15 minutes wait
    },
    public: {
      maxRequests: getEnvInt("RATE_LIMIT_PUBLIC_IP_MAX", 60), // 60 requests per minute for public endpoints
      windowSec: getEnvInt("RATE_LIMIT_PUBLIC_WINDOW_SEC", 60),
    },
    authenticated: {
      maxRequests: getEnvInt("RATE_LIMIT_USER_MAX", 200), // 200 requests per minute for logged-in users
      windowSec: getEnvInt("RATE_LIMIT_USER_WINDOW_SEC", 60),
    },
    aiHeavy: {
      maxRequests: getEnvInt("RATE_LIMIT_AI_MAX", 20), // 20 heavy AI requests per minute
      windowSec: getEnvInt("RATE_LIMIT_AI_WINDOW_SEC", 60),
    },
  }
}

/**
 * Routes classified as Authentication / High-Security routes (Strict + Exponential Backoff)
 */
export const AUTH_ROUTE_PATTERNS: RegExp[] = [
  /^\/api\/auth(\/.*)?$/,
  /^\/api\/register$/,
  /^\/api\/labs\/register$/,
  /^\/api\/doctor\/access$/,
  /^\/api\/setup-admin$/,
]

/**
 * Routes classified as AI / Heavy Resource routes
 */
export const AI_HEAVY_ROUTE_PATTERNS: RegExp[] = [
  /^\/api\/analyze-scan$/,
  /^\/api\/extract-report$/,
  /^\/api\/generate-summary$/,
  /^\/api\/qurix-plus-report$/,
  /^\/api\/pdf\/generate$/,
]

/**
 * Routes classified as Public / Unauthenticated
 */
export const PUBLIC_ROUTE_PATTERNS: RegExp[] = [
  /^\/api\/doctors$/,
  /^\/api\/telehealth\/join$/,
  /^\/api\/setup-db$/,
]

/**
 * Classifies an incoming API pathname into its rate limit tier.
 */
export function classifyRoute(pathname: string, isAuthenticated: boolean = false): RateLimitTier {
  for (const pattern of AUTH_ROUTE_PATTERNS) {
    if (pattern.test(pathname)) return "AUTH"
  }

  for (const pattern of AI_HEAVY_ROUTE_PATTERNS) {
    if (pattern.test(pathname)) return "AI_HEAVY"
  }

  if (isAuthenticated) {
    return "AUTHENTICATED"
  }

  for (const pattern of PUBLIC_ROUTE_PATTERNS) {
    if (pattern.test(pathname)) return "PUBLIC"
  }

  // Fallback: If not authenticated, treat general endpoints as public
  return isAuthenticated ? "AUTHENTICATED" : "PUBLIC"
}
