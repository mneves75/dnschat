/**
 * Network Health Check Service
 * 
 * Monitors health of network libraries and provides circuit breaker
 * functionality for SDK 54 compatibility with unmaintained packages.
 */

interface NetworkMethodHealth {
  method: string;
  healthy: boolean;
  lastCheck: Date;
  failures: number;
  lastError?: string;
}

export class NetworkHealthService {
  private static healthStatus: Map<string, NetworkMethodHealth> = new Map();
  private static readonly MAX_FAILURES = 3;
  private static readonly HEALTH_CHECK_INTERVAL = 60000; // 1 minute
  private static readonly RECOVERY_INTERVAL = 300000; // 5 minutes

  /**
   * Check if a network method is healthy
   */
  static isHealthy(method: string): boolean {
    const health = this.healthStatus.get(method);
    
    if (!health) {
      // First time checking, assume healthy
      this.healthStatus.set(method, {
        method,
        healthy: true,
        lastCheck: new Date(),
        failures: 0
      });
      return true;
    }

    // Check if we should attempt recovery
    const timeSinceLastCheck = Date.now() - health.lastCheck.getTime();
    if (!health.healthy && timeSinceLastCheck > this.RECOVERY_INTERVAL) {
      console.log(`🔄 Attempting recovery for ${method} after ${this.RECOVERY_INTERVAL}ms`);
      health.failures = 0;
      health.healthy = true;
      health.lastCheck = new Date();
    }

    return health.healthy;
  }

  /**
   * Report a successful use of a network method
   */
  static reportSuccess(method: string): void {
    const health = this.healthStatus.get(method) || {
      method,
      healthy: true,
      lastCheck: new Date(),
      failures: 0
    };

    health.healthy = true;
    health.failures = 0;
    health.lastCheck = new Date();
    delete health.lastError;

    this.healthStatus.set(method, health);
    console.log(`✅ ${method} healthy`);
  }

  /**
   * Report a failure of a network method
   */
  static reportFailure(method: string, error: string): void {
    const health = this.healthStatus.get(method) || {
      method,
      healthy: true,
      lastCheck: new Date(),
      failures: 0
    };

    health.failures++;
    health.lastCheck = new Date();
    health.lastError = error;

    if (health.failures >= this.MAX_FAILURES) {
      health.healthy = false;
      console.error(`❌ ${method} marked unhealthy after ${health.failures} failures`);
      console.error(`   Last error: ${error}`);
    }

    this.healthStatus.set(method, health);
  }

  /**
   * Get current health status for all methods
   */
  static getHealthStatus(): NetworkMethodHealth[] {
    return Array.from(this.healthStatus.values());
  }

  /**
   * Reset health status (for testing)
   */
  static reset(): void {
    this.healthStatus.clear();
  }

  /**
   * Circuit breaker wrapper for network methods
   */
  static async withCircuitBreaker<T>(
    method: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    // Check health before attempting
    if (!this.isHealthy(method)) {
      console.warn(`⚠️ ${method} is unhealthy, skipping`);
      if (fallback) {
        return fallback();
      }
      throw new Error(`${method} is currently unavailable due to repeated failures`);
    }

    try {
      const result = await operation();
      this.reportSuccess(method);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check for specific errors that indicate the library is broken
      const criticalErrors = [
        'Cannot read property',
        'undefined is not',
        'null is not',
        'Module not found',
        'Native module cannot be null',
        'Invariant Violation'
      ];

      const isCritical = criticalErrors.some(err => errorMessage.includes(err));
      
      if (isCritical) {
        // Immediately mark as unhealthy for critical errors
        this.reportFailure(method, errorMessage);
        this.reportFailure(method, errorMessage);
        this.reportFailure(method, errorMessage);
      } else {
        this.reportFailure(method, errorMessage);
      }

      if (fallback && !this.isHealthy(method)) {
        console.log(`🔄 Using fallback for ${method}`);
        return fallback();
      }

      throw error;
    }
  }
}

export default NetworkHealthService;