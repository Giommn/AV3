import { Router } from 'express';
import { getMetrics, clearMetrics } from '../../middlewares/metrics.middleware';

const router = Router();

/**
 * GET /api/v1/metrics
 * Returns all collected metrics entries
 */
router.get('/', (_req, res) => {
  const data = getMetrics();

  // Compute summary statistics grouped by concurrent users
  const groups: Record<number, { latency: number[], processing: number[], response: number[] }> = {};

  for (const entry of data) {
    const c = entry.concurrent ?? 1;
    if (!groups[c]) groups[c] = { latency: [], processing: [], response: [] };
    groups[c].latency.push(entry.latencyMs);
    groups[c].processing.push(entry.processingMs);
    groups[c].response.push(entry.responseMs);
  }

  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const max = (arr: number[]) => arr.length ? Math.max(...arr) : 0;
  const min = (arr: number[]) => arr.length ? Math.min(...arr) : 0;

  const summary = Object.entries(groups).map(([concurrentUsers, vals]) => ({
    concurrentUsers: Number(concurrentUsers),
    requests: vals.latency.length,
    latency: { avg: avg(vals.latency), min: min(vals.latency), max: max(vals.latency) },
    processing: { avg: avg(vals.processing), min: min(vals.processing), max: max(vals.processing) },
    response: { avg: avg(vals.response), min: min(vals.response), max: max(vals.response) },
  })).sort((a, b) => a.concurrentUsers - b.concurrentUsers);

  res.json({
    status: 'ok',
    data: {
      total: data.length,
      entries: data.slice(-100), // last 100 for detail view
      summary,
    },
  });
});

/**
 * DELETE /api/v1/metrics
 * Clears all collected metrics (useful before running a fresh stress test)
 */
router.delete('/', (_req, res) => {
  clearMetrics();
  res.json({ status: 'ok', message: 'Métricas resetadas.' });
});

export default router;
