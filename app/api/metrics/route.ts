import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { apiCircuitBreaker } from '@/utils/circuitBreaker';

export async function GET(request: NextRequest) {
  // Simple auth check - in production, use proper authentication
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.METRICS_API_KEY}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const metrics = performanceMonitor.getMetrics();
  const hourlyStats = performanceMonitor.getLastHourStats();
  
  return NextResponse.json({
    overall: {
      totalRequests: metrics.requestCount,
      successRate: `${performanceMonitor.getSuccessRate().toFixed(2)}%`,
      averageDuration: `${(metrics.averageDuration / 1000).toFixed(2)}s`,
      minDuration: `${(metrics.minDuration / 1000).toFixed(2)}s`,
      maxDuration: `${(metrics.maxDuration / 1000).toFixed(2)}s`,
    },
    lastHour: {
      requests: hourlyStats.count,
      successRate: `${hourlyStats.successRate.toFixed(2)}%`,
      averageDuration: `${(hourlyStats.averageDuration / 1000).toFixed(2)}s`,
      under15Seconds: `${hourlyStats.under15Seconds.toFixed(2)}%`,
    },
    circuitBreaker: {
      state: apiCircuitBreaker.getState(),
      failureCount: apiCircuitBreaker.getFailureCount(),
    },
  });
}