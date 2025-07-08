interface PerformanceMetrics {
  requestCount: number;
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successCount: number;
  errorCount: number;
  lastHourRequests: Array<{
    timestamp: number;
    duration: number;
    success: boolean;
  }>;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    totalDuration: 0,
    averageDuration: 0,
    minDuration: Infinity,
    maxDuration: 0,
    successCount: 0,
    errorCount: 0,
    lastHourRequests: [],
  };

  recordRequest(duration: number, success: boolean): void {
    const now = Date.now();
    
    // Update basic metrics
    this.metrics.requestCount++;
    this.metrics.totalDuration += duration;
    this.metrics.averageDuration = this.metrics.totalDuration / this.metrics.requestCount;
    this.metrics.minDuration = Math.min(this.metrics.minDuration, duration);
    this.metrics.maxDuration = Math.max(this.metrics.maxDuration, duration);
    
    if (success) {
      this.metrics.successCount++;
    } else {
      this.metrics.errorCount++;
    }

    // Add to hourly tracking
    this.metrics.lastHourRequests.push({
      timestamp: now,
      duration,
      success,
    });

    // Clean up old entries (older than 1 hour)
    const oneHourAgo = now - 3600000;
    this.metrics.lastHourRequests = this.metrics.lastHourRequests.filter(
      req => req.timestamp > oneHourAgo
    );
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getSuccessRate(): number {
    if (this.metrics.requestCount === 0) return 0;
    return (this.metrics.successCount / this.metrics.requestCount) * 100;
  }

  getLastHourStats() {
    const requests = this.metrics.lastHourRequests;
    if (requests.length === 0) {
      return {
        count: 0,
        averageDuration: 0,
        successRate: 0,
        under15Seconds: 0,
      };
    }

    const successCount = requests.filter(r => r.success).length;
    const totalDuration = requests.reduce((sum, r) => sum + r.duration, 0);
    const under15Seconds = requests.filter(r => r.duration < 15000).length;

    return {
      count: requests.length,
      averageDuration: totalDuration / requests.length,
      successRate: (successCount / requests.length) * 100,
      under15Seconds: (under15Seconds / requests.length) * 100,
    };
  }

  logMetrics(): void {
    const metrics = this.getMetrics();
    const hourlyStats = this.getLastHourStats();
    
    console.log('=== Performance Metrics ===');
    console.log(`Total Requests: ${metrics.requestCount}`);
    console.log(`Success Rate: ${this.getSuccessRate().toFixed(2)}%`);
    console.log(`Average Duration: ${(metrics.averageDuration / 1000).toFixed(2)}s`);
    console.log(`Min/Max Duration: ${(metrics.minDuration / 1000).toFixed(2)}s / ${(metrics.maxDuration / 1000).toFixed(2)}s`);
    console.log('\n=== Last Hour ===');
    console.log(`Requests: ${hourlyStats.count}`);
    console.log(`Success Rate: ${hourlyStats.successRate.toFixed(2)}%`);
    console.log(`Under 15s: ${hourlyStats.under15Seconds.toFixed(2)}%`);
    console.log('========================\n');
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();