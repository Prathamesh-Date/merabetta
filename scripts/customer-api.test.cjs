const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('app/lib/customer-api.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
function client(fetch, origin = 'https://api.example.test') {
  const events = [];
  const context = { exports: {}, process: { env: { NEXT_PUBLIC_CUSTOMER_API_URL: origin } }, fetch, URL, URLSearchParams, AbortController, setTimeout, clearTimeout, Event, window: { dispatchEvent: event => events.push(event.type) } };
  vm.runInNewContext(source, context);
  return { ...context.exports, events };
}
test('OTP uses web cookies and never native authorization headers', async () => {
  let sent;
  const c = client(async (url, options) => { sent = { url, ...options }; return new Response(JSON.stringify({ challengeId: 'c1', expiresIn: 600, resendAfter: 30, delivery: 'sms' })); });
  await c.customerApi.requestOtp('9876543210');
  assert.equal(sent.url, 'https://api.example.test/api/app/auth/otp/request');
  assert.equal(sent.credentials, 'include');
  assert.equal(sent.headers.Authorization, undefined);
  assert.equal(sent.headers['X-App-Client'], undefined);
  assert.deepEqual(JSON.parse(sent.body), { method: 'phone', contact: '9876543210' });
});
test('204 logout succeeds without trying to parse JSON', async () => {
  const c = client(async () => new Response(null, { status: 204 }));
  assert.equal(await c.customerApi.logout(), undefined);
});

test('email OTP sends the selected method and trimmed email with browser cookies', async () => {
  let sent;
  const c = client(async (url, options) => { sent = { url, ...options }; return new Response(JSON.stringify({ challengeId: 'email-c1', expiresIn: 600, resendAfter: 30, delivery: 'email' })); });
  const result = await c.customerApi.requestOtp(' demo@example.com ', 'email');
  assert.deepEqual(JSON.parse(sent.body), { method: 'email', contact: 'demo@example.com' });
  assert.equal(sent.credentials, 'include');
  assert.equal(result.delivery, 'email');
});
test('incorrect OTP keeps the session flow; protected 401 expires it', async () => {
  const c = client(async () => new Response(JSON.stringify({ error: 'Expired' }), { status: 401 }));
  await assert.rejects(c.customerApi.verifyOtp('c1', '123456'), e => e.status === 401);
  assert.equal(c.events.length, 0);
  await assert.rejects(c.customerApi.me(), e => e.status === 401);
  assert.deepEqual(c.events, ['merabetta-session-expired']);
});
test('validation details and Retry-After survive the helper', async () => {
  const c = client(async () => new Response(JSON.stringify({ error: 'Validation failed', details: [{ path: 'phone', message: 'Invalid phone' }] }), { status: 422, headers: { 'Retry-After': '30' } }));
  await assert.rejects(c.customerApi.requestOtp('x'), e => e.status === 422 && e.retryAfter === 30 && e.details[0].path === 'phone');
});
test('pending 202 is preserved and uses the same checkout requestKey', async () => {
  const keys = [];
  const c = client(async (_, options) => { keys.push(JSON.parse(options.body).requestKey); return new Response(JSON.stringify({ id: 'order1', status: 'Pending' }), { status: 202 }); });
  const body = { requestKey: 'stable-attempt-uuid', items: [{ id: 'p1', quantity: 1 }], address: {} };
  assert.equal((await c.customerApi.checkout(body)).status, 202);
  await c.customerApi.checkout(body);
  assert.deepEqual(keys, ['stable-attempt-uuid', 'stable-attempt-uuid']);
});
test('malformed successful mutation response remains uncertain', async () => {
  const c = client(async () => new Response('<html>bad gateway</html>', { status: 200 }));
  await assert.rejects(c.customerApi.checkout({}), e => e.status === 200);
});
test('network failure is not reported as an expired session', async () => {
  const c = client(async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(c.customerApi.me(), /Could not reach/);
  assert.equal(c.events.length, 0);
  await assert.rejects(c.customerApi.checkout({}), /may still be processing/);
});
test('address removes UUID and extra location fields rejected by strict schema', () => {
  const c = client();
  const normalized = c.cleanAddress({ id: 'private-uuid', line1: 'Flat 1', state: 'Maharashtra', city: 'Pune', postalCode: '411045', location: { provider: 'locationiq', placeId: '1', displayName: 'Pune', latitude: 18, longitude: 73, address: { city: 'Pune' }, city: 'Pune', postalCode: '411045' } });
  assert.equal(normalized.id, undefined); assert.equal(normalized.location.city, undefined); assert.equal(normalized.location.postalCode, undefined);
});
test('missing origin fails clearly without calling the website as a backend', async () => {
  let called = false;
  const c = client(async () => { called = true; }, '');
  await assert.rejects(c.customerApi.me(), /not connected/); assert.equal(called, false);
});
test('same-origin mode uses only the fixed website customer API prefix', async () => {
  let requested;
  const c = client(async url => { requested = url; return new Response(JSON.stringify({ data: [] })); }, '/');
  await c.customerApi.faqs(); assert.equal(requested, '/api/app/faqs');
});
test('public contact enquiry posts the four fields and returns its confirmation', async () => {
  let sent;
  const c = client(async (url, options) => {
    sent = { url, ...options };
    return new Response(JSON.stringify({ enquiryId: 'enquiry-test-1', message: 'Enquiry received' }), { status: 201 });
  }, '/');
  const enquiry = { name: 'Integration Test', email: 'test@example.com', phone: '9000000000', message: 'Automated test' };
  const result = await c.customerApi.contactEnquiry(enquiry);
  assert.equal(sent.url, '/api/app/contact-enquiries');
  assert.equal(sent.method, 'POST');
  assert.equal(sent.headers.Authorization, undefined);
  assert.deepEqual(JSON.parse(sent.body), enquiry);
  assert.equal(result.enquiryId, 'enquiry-test-1');
  assert.equal(result.message, 'Enquiry received');
});
test('contact validation and rate limits retain backend details without expiring a session', async () => {
  const c = client(async () => new Response(JSON.stringify({ error: 'Too many enquiries', details: [{ path: 'phone', message: 'Invalid phone' }] }), { status: 429, headers: { 'Retry-After': '45' } }));
  await assert.rejects(c.customerApi.contactEnquiry({}), e => e.status === 429 && e.retryAfter === 45 && e.details[0].path === 'phone');
  const unauthorized = client(async () => new Response(JSON.stringify({ error: 'Origin rejected' }), { status: 401 }));
  await assert.rejects(unauthorized.customerApi.contactEnquiry({}), e => e.status === 401);
  assert.equal(unauthorized.events.length, 0);
});
test('contact network failures and missing enquiry IDs do not claim confirmed delivery', async () => {
  const offline = client(async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(offline.customerApi.contactEnquiry({}), /enquiry may have been received/);
  const malformed = client(async () => new Response(JSON.stringify({ message: 'Received' })));
  await assert.rejects(malformed.customerApi.contactEnquiry({}), /confirmation could not be loaded/);
});
