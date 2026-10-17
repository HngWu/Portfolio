/**
 * In-memory Circuit Breaker for Supabase database operations.
 *
 * Trips OPEN when remote Supabase operations fail, allowing the DB Gateway
 * to immediately route queries to the local SQLite fallback without waiting
 * for network timeouts or spamming error logs.
 */

export const CircuitState = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
} as const

export type CircuitState = (typeof CircuitState)[keyof typeof CircuitState]

export interface CircuitBreakerOptions {
  /**
   * Cooldown period in milliseconds before an OPEN circuit transitions to HALF_OPEN.
   * Defaults to 30,000ms (30 seconds).
   */
  cooldownMs?: number
}

export interface CircuitBreakerStatus {
  state: CircuitState
  isOpen: boolean
  consecutiveFailures: number
  lastFailureTime: number | null
  lastErrorMessage: string | null
  cooldownRemainingMs: number
}

export interface RecordFailureResult {
  tripped: boolean
  message: string
}

const DEFAULT_COOLDOWN_MS = 30_000

function formatErrorMessage(err: unknown): string {
  if (!err) {
    return 'Unknown error'
  }
  if (typeof err === 'string') {
    return err
  }
  if (err instanceof Error) {
    if ('cause' in err && err.cause) {
      const cause = err.cause
      const causeStr =
        cause instanceof Error
          ? cause.message
          : typeof cause === 'object' && cause !== null && 'code' in cause
          ? String((cause as { code: unknown }).code)
          : String(cause)
      if (causeStr && causeStr !== 'undefined') {
        return `${err.message} (${causeStr})`
      }
    }
    return err.message || err.name || 'Error'
  }
  if (typeof err === 'object') {
    if ('message' in err && typeof (err as { message: unknown }).message === 'string') {
      return (err as { message: string }).message
    }
    if ('error_description' in err && typeof (err as { error_description: unknown }).error_description === 'string') {
      return (err as { error_description: string }).error_description
    }
    try {
      return JSON.stringify(err)
    } catch {
      return String(err)
    }
  }
  return String(err)
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED'
  private consecutiveFailures: number = 0
  private lastFailureTime: number | null = null
  private lastErrorMessage: string | null = null
  private readonly cooldownMs: number

  constructor(options?: CircuitBreakerOptions) {
    this.cooldownMs = options?.cooldownMs ?? DEFAULT_COOLDOWN_MS
  }

  /**
   * Returns true if the circuit is currently in the OPEN cooldown window.
   * If the cooldown duration has elapsed while OPEN, transitions to HALF_OPEN
   * and returns false to allow a probe request through.
   */
  isOpen(): boolean {
    if (this.state === 'OPEN') {
      const now = Date.now()
      if (this.lastFailureTime === null || now - this.lastFailureTime >= this.cooldownMs) {
        this.state = 'HALF_OPEN'
        return false
      }
      return true
    }
    return false
  }

  /**
   * Records a successful operation, resetting the circuit state to CLOSED
   * and clearing consecutive failure counters.
   */
  recordSuccess(): void {
    this.state = 'CLOSED'
    this.consecutiveFailures = 0
  }

  /**
   * Records a failure, trips the circuit to OPEN, updates consecutive failures,
   * records the failure timestamp and a cleaned error message.
   *
   * Returns `{ tripped: true }` if this failure caused a state transition to OPEN,
   * or `{ tripped: false }` if the circuit was already OPEN.
   */
  recordFailure(err: unknown): RecordFailureResult {
    const now = Date.now()
    const message = formatErrorMessage(err)

    // Check if currently open (cooldown taken into account)
    const currentlyOpen = this.isOpen()
    const tripped = !currentlyOpen

    this.state = 'OPEN'
    this.consecutiveFailures += 1
    // Only update failure timestamp on initial trip or half-open failure,
    // avoiding straggler in-flight requests from resetting the cooldown clock
    if (tripped || this.lastFailureTime === null) {
      this.lastFailureTime = now
    }
    this.lastErrorMessage = message

    return {
      tripped,
      message,
    }
  }

  /**
   * Forces the circuit breaker back to its initial CLOSED state,
   * clearing all failure counts, timestamps, and error messages.
   */
  reset(): void {
    this.state = 'CLOSED'
    this.consecutiveFailures = 0
    this.lastFailureTime = null
    this.lastErrorMessage = null
  }

  /**
   * Returns a snapshot of the current circuit breaker status idempotently.
   */
  getStatus(): CircuitBreakerStatus {
    const now = Date.now()
    let effectiveState = this.state
    let open = false
    let cooldownRemainingMs = 0

    if (this.state === 'OPEN') {
      if (this.lastFailureTime !== null && now - this.lastFailureTime < this.cooldownMs) {
        open = true
        cooldownRemainingMs = Math.max(0, this.cooldownMs - (now - this.lastFailureTime))
      } else {
        effectiveState = 'HALF_OPEN'
        open = false
      }
    }

    return {
      state: effectiveState,
      isOpen: open,
      consecutiveFailures: this.consecutiveFailures,
      lastFailureTime: this.lastFailureTime,
      lastErrorMessage: this.lastErrorMessage,
      cooldownRemainingMs,
    }
  }
}

/**
 * Singleton Circuit Breaker instance for Supabase operations across the application.
 */
export const supabaseCircuitBreaker = new CircuitBreaker()
