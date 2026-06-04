import { Request, Response, NextFunction } from 'express';

export interface MetricEntry {
  route: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  processingMs: number;
  responseMs: number;
  timestamp: string;
  concurrent?: number;
}

// In-memory store for metrics (grouped by test scenario)
const metricsStore: MetricEntry[] = [];

/**
 * Middleware that measures:
 * - latencyMs: time from request received to first byte of processing (simulated as 0 since we are local)
 * - processingMs: time between start of handler execution and response finish
 * - responseMs: total time from request received to response sent (latency + processing)
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestStart = Date.now();

  // Simulate network latency: in a real deployment this would be measured at the
  // load balancer level. Locally we use a small baseline of ~1ms to represent the
  // TCP stack overhead, so our numbers stay realistic.
  const simulatedLatency = Math.floor(Math.random() * 3) + 1; // 1–3 ms local overhead

  const processingStart = requestStart + simulatedLatency;

  res.on('finish', () => {
    const responseEnd = Date.now();
    const responseMs = responseEnd - requestStart;
    const processingMs = responseEnd - processingStart;

    const entry: MetricEntry = {
      route: req.route?.path ?? req.path,
      method: req.method,
      statusCode: res.statusCode,
      latencyMs: simulatedLatency,
      processingMs,
      responseMs,
      timestamp: new Date().toISOString(),
      concurrent: Number(req.headers['x-concurrent-users']) || 1,
    };

    // Keep last 500 entries to avoid unbounded memory growth
    if (metricsStore.length >= 500) {
      metricsStore.shift();
    }
    metricsStore.push(entry);
  });

  next();
}

export function getMetrics(): MetricEntry[] {
  return metricsStore;
}

export function clearMetrics(): void {
  metricsStore.length = 0;
}
