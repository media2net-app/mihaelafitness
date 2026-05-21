/**
 * API smoke + integration tests for online (Training-Only) clients.
 * Run: node scripts/test-online-client-api.js [baseUrl]
 * Default baseUrl: http://localhost:3000
 */
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const BASE = process.argv[2] || 'http://localhost:3000';
const EMAIL = process.env.TEST_ONLINE_EMAIL || 'demo-online@mihaelafitness.com';
const PASSWORD = process.env.TEST_ONLINE_PASSWORD || 'DemoOnline2025';

const results = [];
let token = '';
let userId = '';

function pass(name) {
  results.push({ name, ok: true });
  console.log(`  ✓ ${name}`);
}
function fail(name, detail) {
  results.push({ name, ok: false, detail });
  console.log(`  ✗ ${name}: ${detail}`);
}

async function json(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text };
  }
}

async function login() {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await json(res);
  if (!res.ok) {
    fail('Login', data.error || res.status);
    return false;
  }
  token = data.token;
  userId = data.user?.id;
  if (!token || !userId) {
    fail('Login', 'missing token or user id');
    return false;
  }
  pass('Login');
  return true;
}

function authHeaders(extra = {}) {
  return { Authorization: `Bearer ${token}`, ...extra };
}

async function run() {
  console.log(`\nOnline client API tests → ${BASE}\n`);

  if (!(await login())) {
    printSummary();
    process.exit(1);
  }

  // Profile
  {
    const res = await fetch(`${BASE}/api/online-profile?customerId=${userId}`, {
      headers: authHeaders(),
    });
    const data = await json(res);
    if (res.ok && data.user) pass('GET online-profile');
    else fail('GET online-profile', data.error || res.status);
  }

  // Training days
  {
    const res = await fetch(`${BASE}/api/online-training-days`, { headers: authHeaders() });
    const data = await json(res);
    if (res.ok && data.slots?.length >= 1) pass('GET online-training-days');
    else fail('GET online-training-days', data.error || JSON.stringify(data));
  }

  // Water
  {
    const res = await fetch(`${BASE}/api/online-water`, { headers: authHeaders() });
    const data = await json(res);
    if (res.ok && typeof data.cups === 'number') pass('GET online-water');
    else fail('GET online-water', data.error || res.status);

    const post = await fetch(`${BASE}/api/online-water`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ action: 'add' }),
    });
    const postData = await json(post);
    if (post.ok && postData.cups >= 1) pass('POST online-water add');
    else fail('POST online-water add', postData.error || post.status);
  }

  // Habits
  {
    const res = await fetch(`${BASE}/api/online-habits`, { headers: authHeaders() });
    const data = await json(res);
    if (res.ok && Array.isArray(data.habits)) pass('GET online-habits');
    else fail('GET online-habits', data.error || res.status);

    const activate = await fetch(`${BASE}/api/online-habits`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ action: 'activate', habitKey: 'replace-soda' }),
    });
    if (activate.ok) pass('POST online-habits activate');
    else fail('POST online-habits activate', (await json(activate)).error);

    const toggle = await fetch(`${BASE}/api/online-habits`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ action: 'toggle', habitKey: 'replace-soda' }),
    });
    if (toggle.ok) pass('POST online-habits toggle');
    else fail('POST online-habits toggle', (await json(toggle)).error);
  }

  // Food tracking
  const today = new Date().toISOString().slice(0, 10);
  {
    const res = await fetch(
      `${BASE}/api/food-tracking?customerId=${userId}&date=${today}`,
      { headers: authHeaders() },
    );
    const data = await json(res);
    if (res.ok && data.requiredCount === 6) pass('GET food-tracking day');
    else fail('GET food-tracking day', data.error || res.status);

    const stats = await fetch(`${BASE}/api/food-tracking/stats?customerId=${userId}`, {
      headers: authHeaders(),
    });
    if (stats.ok) pass('GET food-tracking/stats');
    else fail('GET food-tracking/stats', (await json(stats)).error || stats.status);
  }

  // Food upload (1x1 PNG)
  {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );
    const form = new FormData();
    form.append('customerId', userId);
    form.append('date', today);
    form.append('mealSlot', '1');
    form.append('file', new Blob([png], { type: 'image/png' }), 'test.png');

    const res = await fetch(`${BASE}/api/food-tracking`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    });
    const data = await json(res);
    if (res.ok && data.photo?.imageUrl) pass('POST food-tracking upload');
    else fail('POST food-tracking upload', data.error || data._raw?.slice(0, 120) || res.status);
  }

  // Schedule assignments
  {
    const res = await fetch(
      `${BASE}/api/customer-schedule-assignments?customerId=${userId}`,
    );
    const data = await json(res);
    if (res.ok && Array.isArray(data) && data.length > 0) pass('GET schedule assignments');
    else fail('GET schedule assignments', res.status);
  }

  // Workout flow
  let sessionId = '';
  let workoutId = '';
  let exerciseId = '';
  {
    const res = await fetch(`${BASE}/api/online-workout?day=1`, { headers: authHeaders() });
    const data = await json(res);
    if (res.ok && data.exercises?.length) {
      pass('GET online-workout');
      workoutId = data.workout?.id;
      const main = data.exercises.find((e) => e.section !== 'warmup') || data.exercises[0];
      exerciseId = main.exerciseId;
    } else fail('GET online-workout', data.error || res.status);

    const start = await fetch(`${BASE}/api/online-workout`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ action: 'start', trainingDay: 1 }),
    });
    const startData = await json(start);
    if (start.ok && startData.session?.id) {
      pass('POST online-workout start');
      sessionId = startData.session.id;
    } else fail('POST online-workout start', startData.error || start.status);

    if (sessionId && exerciseId && workoutId) {
      const log = await fetch(`${BASE}/api/exercise-set-logs`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          sessionId,
          customerId: userId,
          trainingDay: 1,
          workoutId,
          exerciseId,
          setNumber: 1,
          weightKg: 20,
          repsDone: 10,
        }),
      });
      if (log.ok) pass('POST exercise-set-logs');
      else fail('POST exercise-set-logs', (await json(log)).error || log.status);

      const complete = await fetch(`${BASE}/api/online-workout`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          action: 'complete',
          sessionId,
          durationSec: 120,
        }),
      });
      if (complete.ok) pass('POST online-workout complete');
      else fail('POST online-workout complete', (await json(complete)).error);
    }

    const progress = await fetch(`${BASE}/api/online-training-progress`, {
      headers: authHeaders(),
    });
    if (progress.ok) pass('GET online-training-progress');
    else fail('GET online-training-progress', (await json(progress)).error || progress.status);
  }

  printSummary();
  process.exit(results.some((r) => !r.ok) ? 1 : 0);
}

function printSummary() {
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    console.log('\nFailed:');
    failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
