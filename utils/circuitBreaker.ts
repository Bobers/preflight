interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

export class CircuitBreaker {
  private state: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    state: 'closed',
  };

  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly halfOpenAttempts: number;
  private halfOpenCount: number = 0;

  constructor(
    failureThreshold: number = 5,
    resetTimeout: number = 60000, // 1 minute
    halfOpenAttempts: number = 3
  ) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.halfOpenAttempts = halfOpenAttempts;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.state.lastFailureTime;
      
      if (timeSinceLastFailure > this.resetTimeout) {
        // Try half-open state
        this.state.state = 'half-open';
        this.halfOpenCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN. Service temporarily unavailable.');
      }
    }

    try {
      const result = await operation();
      
      // Success - reset or progress in half-open state
      if (this.state.state === 'half-open') {
        this.halfOpenCount++;
        if (this.halfOpenCount >= this.halfOpenAttempts) {
          // Enough successful attempts, close the circuit
          this.reset();
        }
      } else if (this.state.state === 'closed') {
        // Reset failure count on success
        this.state.failures = 0;
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();

    if (this.state.state === 'half-open') {
      // Failed in half-open state, immediately open
      this.state.state = 'open';
      this.halfOpenCount = 0;
    } else if (this.state.failures >= this.failureThreshold) {
      // Threshold reached, open the circuit
      this.state.state = 'open';
    }
  }

  private reset(): void {
    this.state = {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed',
    };
    this.halfOpenCount = 0;
  }

  getState(): string {
    return this.state.state;
  }

  getFailureCount(): number {
    return this.state.failures;
  }
}

// Singleton instance for API calls
export const apiCircuitBreaker = new CircuitBreaker(5, 60000, 3);