import { AuthRateLimitConfig } from "./config"

export interface SlidingWindowEntry {
  timestamps: number[]
  lastUpdated: number
}

export interface AuthAccountState {
  consecutiveFailures: number
  lastFailureTime: number
  blockedUntil: number
  totalAttemptsInWindow: number
  firstAttemptInWindow: number
}

const MAX_STORE_SIZE = 10000 // Maximum keys stored before eviction
const CLEANUP_INTERVAL_MS = 60 * 1000 // Clean up expired keys every 60s

class RateLimitMemoryStore {
  private windowStore = new Map<string, SlidingWindowEntry>()
  private authAccountStore = new Map<string, AuthAccountState>()
  private lastCleanup = Date.now()

  constructor() {
    // Periodic garbage collection
    if (typeof setInterval !== "undefined") {
      const timer = setInterval(() => {
        this.cleanup()
      }, CLEANUP_INTERVAL_MS)
      // Prevent timer from holding node process alive if unref is available
      if (timer && typeof timer.unref === "function") {
        timer.unref()
      }
    }
  }

  /**
   * Records a hit in the sliding window for a given key and returns active hits.
   */
  public hitSlidingWindow(key: string, windowSec: number, now: number = Date.now()): { count: number; oldestHit: number } {
    this.maybeCleanup(now)

    const windowMs = windowSec * 1000
    const cutoff = now - windowMs

    let entry = this.windowStore.get(key)
    if (!entry) {
      entry = { timestamps: [now], lastUpdated: now }
      this.windowStore.set(key, entry)
      this.ensureCapacity(this.windowStore)
      return { count: 1, oldestHit: now }
    }

    // Filter out timestamps outside the sliding window
    entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff)
    entry.timestamps.push(now)
    entry.lastUpdated = now

    const oldestHit = entry.timestamps.length > 0 ? entry.timestamps[0] : now
    return { count: entry.timestamps.length, oldestHit }
  }

  /**
   * Retrieves the current auth state for an account identifier or IP.
   */
  public getAuthAccountState(accountKey: string, now: number = Date.now()): AuthAccountState | null {
    const state = this.authAccountStore.get(accountKey)
    if (!state) return null

    // If tracking window has expired and user is not currently blocked, clean up
    const accountWindowMs = 900 * 1000 // default 15 min window
    if (now - state.lastFailureTime > accountWindowMs && now >= state.blockedUntil) {
      this.authAccountStore.delete(accountKey)
      return null
    }

    return state
  }

  /**
   * Records an authentication failure for an account or IP, computing exponential backoff.
   */
  public recordAuthFailure(
    accountKey: string,
    config: AuthRateLimitConfig,
    now: number = Date.now()
  ): { blockedUntil: number; retryAfter: number; consecutiveFailures: number } {
    this.maybeCleanup(now)

    let state = this.authAccountStore.get(accountKey)
    const trackingWindowMs = config.accountWindowSec * 1000

    if (!state || now - state.lastFailureTime > trackingWindowMs) {
      state = {
        consecutiveFailures: 1,
        lastFailureTime: now,
        blockedUntil: 0,
        totalAttemptsInWindow: 1,
        firstAttemptInWindow: now,
      }
    } else {
      state.consecutiveFailures += 1
      state.totalAttemptsInWindow += 1
      state.lastFailureTime = now
    }

    // Check if consecutive failures have reached the threshold
    if (state.consecutiveFailures >= config.accountMaxAttempts) {
      // Exponential backoff calculation:
      // backoff = base * (multiplier ^ (failures - maxAttempts))
      const exponent = state.consecutiveFailures - config.accountMaxAttempts
      const backoffSeconds = Math.min(
        config.backoffBaseSec * Math.pow(config.backoffMultiplier, exponent),
        config.backoffMaxSec
      )

      state.blockedUntil = now + Math.round(backoffSeconds * 1000)
    }

    this.authAccountStore.set(accountKey, state)
    this.ensureCapacity(this.authAccountStore)

    const retryAfter = state.blockedUntil > now ? Math.ceil((state.blockedUntil - now) / 1000) : 0

    return {
      blockedUntil: state.blockedUntil,
      retryAfter,
      consecutiveFailures: state.consecutiveFailures,
    }
  }

  /**
   * Resets the consecutive failures for an account upon successful authentication.
   */
  public recordAuthSuccess(accountKey: string): void {
    this.authAccountStore.delete(accountKey)
  }

  /**
   * Performs housekeeping to remove old records.
   */
  public cleanup(now: number = Date.now()): void {
    this.lastCleanup = now

    // Clean sliding window store
    for (const [key, entry] of this.windowStore.entries()) {
      if (now - entry.lastUpdated > 300 * 1000) {
        this.windowStore.delete(key)
      }
    }

    // Clean auth store
    for (const [key, state] of this.authAccountStore.entries()) {
      if (now - state.lastFailureTime > 1800 * 1000 && now >= state.blockedUntil) {
        this.authAccountStore.delete(key)
      }
    }
  }

  private maybeCleanup(now: number): void {
    if (now - this.lastCleanup > CLEANUP_INTERVAL_MS) {
      this.cleanup(now)
    }
  }

  private ensureCapacity(map: Map<string, any>): void {
    if (map.size > MAX_STORE_SIZE) {
      // Evict oldest 10% entries
      const keysToDelete: string[] = []
      let count = 0
      const target = Math.floor(MAX_STORE_SIZE * 0.1)
      for (const key of map.keys()) {
        keysToDelete.push(key)
        count++
        if (count >= target) break
      }
      for (const key of keysToDelete) {
        map.delete(key)
      }
    }
  }

  /**
   * Resets all store data (useful for test suites).
   */
  public reset(): void {
    this.windowStore.clear()
    this.authAccountStore.clear()
  }
}

// Global singleton instance
const globalForRateLimit = globalThis as unknown as { rateLimitStore?: RateLimitMemoryStore }
export const rateLimitStore = globalForRateLimit.rateLimitStore || new RateLimitMemoryStore()
if (process.env.NODE_ENV !== "production") globalForRateLimit.rateLimitStore = rateLimitStore
