/**
 * Aerocode – Stress Test Script (AV3)
 * ─────────────────────────────────────────────────────────────────────────────
 * This script simulates concurrent users hitting the API, collecting the metrics
 * required by AV3: latency, processing time and response time.
 *
 * Usage:
 *   node stress-test.js
 *
 * Requirements:
 *   - Backend running at http://localhost:3000
 *   - A valid admin account (admin / admin123)
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3000';
const CREDENTIALS = { usuario: 'admin', senha: 'admin123' };

// ─── Helper: raw HTTP request that measures all three metrics ─────────────────
function timedRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    let processingStart;

    const protocol = options.protocol === 'https:' ? https : http;

    const req = protocol.request(options, (res) => {
      processingStart = Date.now();
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const end = Date.now();
        const latencyMs = processingStart - start;
        const processingMs = end - processingStart;
        const responseMs = end - start;
        try {
          resolve({ body: JSON.parse(data), latencyMs, processingMs, responseMs, statusCode: res.statusCode });
        } catch {
          resolve({ body: data, latencyMs, processingMs, responseMs, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ─── Build request options ─────────────────────────────────────────────────────
function buildOptions(path, method = 'GET', token = null, concurrentUsers = 1) {
  const url = new URL(BASE_URL + path);
  const headers = {
    'Content-Type': 'application/json',
    'X-Concurrent-Users': String(concurrentUsers),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname + url.search,
    method,
    headers,
  };
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
async function login() {
  const opts = buildOptions('/api/v1/funcionarios/login', 'POST');
  const result = await timedRequest(opts, CREDENTIALS);
  if (!result.body?.data?.token) {
    throw new Error('Login failed: ' + JSON.stringify(result.body));
  }
  return result.body.data.token;
}

// ─── Single "workload" request (list aeronaves) ────────────────────────────────
async function workload(token, concurrentUsers) {
  const opts = buildOptions('/api/v1/aeronaves', 'GET', token, concurrentUsers);
  return timedRequest(opts);
}

// ─── Run a scenario with N concurrent users ────────────────────────────────────
async function runScenario(token, n, iterationsPerUser = 5) {
  console.log(`\n▶  Running scenario: ${n} concurrent user(s), ${iterationsPerUser} requests each...`);

  const results = { latency: [], processing: [], response: [] };

  // Each user fires iterationsPerUser sequential requests; all users start simultaneously
  const userTasks = Array.from({ length: n }, async (_, userId) => {
    for (let i = 0; i < iterationsPerUser; i++) {
      const r = await workload(token, n);
      results.latency.push(r.latencyMs);
      results.processing.push(r.processingMs);
      results.response.push(r.responseMs);
    }
  });

  await Promise.all(userTasks);

  const avg = (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  const min = (arr) => Math.min(...arr);
  const max = (arr) => Math.max(...arr);

  const summary = {
    concurrentUsers: n,
    totalRequests: results.latency.length,
    latency:    { avg: avg(results.latency),    min: min(results.latency),    max: max(results.latency)    },
    processing: { avg: avg(results.processing), min: min(results.processing), max: max(results.processing) },
    response:   { avg: avg(results.response),   min: min(results.response),   max: max(results.response)   },
  };

  console.log(`   ✔ Completed ${summary.totalRequests} requests`);
  console.log(`   Latency    → avg: ${summary.latency.avg}ms  min: ${summary.latency.min}ms  max: ${summary.latency.max}ms`);
  console.log(`   Processing → avg: ${summary.processing.avg}ms  min: ${summary.processing.min}ms  max: ${summary.processing.max}ms`);
  console.log(`   Response   → avg: ${summary.response.avg}ms  min: ${summary.response.min}ms  max: ${summary.response.max}ms`);

  return summary;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' AEROCODE – AV3 Stress Test');
  console.log('═══════════════════════════════════════════════════════════');

  let token;
  try {
    console.log('\n🔑 Authenticating...');
    token = await login();
    console.log('   ✔ Token obtained');
  } catch (err) {
    console.error('❌ Could not authenticate:', err.message);
    process.exit(1);
  }

  // Clear previous metrics on server
  const clearOpts = buildOptions('/api/v1/metrics', 'DELETE', token);
  await timedRequest(clearOpts);

  const allResults = [];

  for (const n of [1, 5, 10]) {
    const result = await runScenario(token, n);
    allResults.push(result);
    // Short pause between scenarios
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(' FINAL SUMMARY (all units in milliseconds)');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Users | Requests | Lat.avg | Proc.avg | Resp.avg');
  for (const r of allResults) {
    console.log(
      `  ${String(r.concurrentUsers).padEnd(5)}|  ${String(r.totalRequests).padEnd(9)}| ${String(r.latency.avg).padEnd(8)}| ${String(r.processing.avg).padEnd(9)}| ${r.response.avg}`
    );
  }
  console.log('\n✅ Test complete! Open http://localhost:5173/metricas to see charts.');
  console.log('   (metrics are also stored at GET /api/v1/metrics)');
})();
