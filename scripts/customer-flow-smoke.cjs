// Browser flow with intercepted fixtures: never sends SMS, books a lab or pays.
const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const account = { user: { id: 'fixture-user', name: 'Test Customer', firstName: 'Test', lastName: 'Customer', phone: '9876543210', email: 'test@example.com', dateOfBirth: '1990-01-01', gender: 'Female', profileCompleted: true }, identities: [{ method: 'phone', contact: '9876543210' }], addresses: [{ id: 'fixture-address', line1: 'Flat 12 Test Residency', houseNumber: '12', buildingName: 'Test Residency', city: 'Pune', state: 'Maharashtra', postalCode: '411045', location: { provider: 'locationiq', placeId: 'fixture-place', displayName: 'Pune, Maharashtra, India', latitude: 18.56, longitude: 73.78, address: { city: 'Pune', state: 'Maharashtra', country_code: 'in' } } }], members: [{ id: 'fixture-member', name: 'Test Customer', relationship: 'Self', dateOfBirth: '1990-01-01', gender: 'Female', phone: '9876543210' }] };
const testItem = { id: 'redcliffe:fixture-test', packageCode: 'fixture-test', labId: 'redcliffe', labName: 'Redcliffe', name: 'Fixture Heart Package', category: 'Heart', categories: ['Heart', 'Full Body'], parameters: 97, price: 500, mrp: 800, available: true };
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage(); let signedIn = false; let failNextBooking = false; const requests = []; const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/api/app/**', async route => {
    const request = route.request(); const path = new URL(request.url()).pathname.replace('/api/app', '');
    const body = request.postDataJSON(); requests.push({ path, method: request.method(), body, headers: request.headers() });
    let data; let status = 200;
    if (path === '/auth/me') { data = signedIn ? account : { error: 'Login required' }; status = signedIn ? 200 : 401; }
    else if (path === '/auth/otp/request') data = { challengeId: 'fixture-challenge', expiresIn: 600, resendAfter: 30, delivery: 'sms' };
    else if (path === '/auth/otp/verify') { if (body.code === '123456') { signedIn = true; data = account; } else { data = { error: 'Incorrect OTP' }; status = 401; } }
    else if (path === '/redcliffe/catalog') data = { data: [testItem] };
    else if (path === '/labs/lablisting') data = { data: [{ id: 'redcliffe', name: 'Redcliffe', active: true, city: 'Pune', homeCollection: true }], pagination: { page: 1, totalPages: 1 } };
    else if (path.startsWith('/redcliffe/packages/')) data = { data: [{ name: 'Heart markers', parameters: ['Cholesterol'] }] };
    else if (path === '/redcliffe/dates') data = { dates: ['2026-10-15', '2026-10-16'], timeZone: 'Asia/Kolkata' };
    else if (path === '/redcliffe/slots') data = { serviceable: true, slots: [{ id: '27', label: '9:00 AM', available: true }, { id: '28', label: '10:00 AM', available: false }], message: '' };
    else if (path === '/states') data = { data: [{ id: 'fixture-state', name: 'Maharashtra' }] };
    else if (path.startsWith('/states/')) data = { data: [{ id: 'fixture-city', name: 'Pune' }] };
    else if (path === '/locations/map') data = { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=' };
    else if (path === '/lab-bookings' && request.method() === 'POST') { if (failNextBooking) { failNextBooking = false; return route.abort('failed'); } data = { id: 'fixture-booking', kind: 'labs', status: 'Pending', paymentStatus: 'Payment to Redcliffe', total: 500, items: [{ ...testItem, quantity: 1 }], date: '2026-10-14', address: account.addresses[0] }; status = 202; }
    else if (path === '/lab-bookings') data = { data: [], statusRefreshFailed: false };
    else if (path === '/orders') data = { data: [] };
    else if (path === '/faqs') data = { data: [{ id: 'faq1', question: 'Fixture question?', answer: 'Fixture answer.' }] };
    else { status = 404; data = { error: `Unmocked endpoint ${path}` }; }
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
  });
  try {
    await page.goto('http://localhost:3000/profile');
    const main = page.locator('main');
    await main.getByRole('heading', { name: 'Welcome to Merabetta', exact: true }).waitFor();
    assert.equal(await main.getByRole('button', { name: 'Family & Addresses', exact: true }).isDisabled(), true);
    assert.equal(await main.getByRole('button', { name: 'Delete my account', exact: true }).isDisabled(), true);
    await main.getByRole('button', { name: 'My Orders', exact: true }).click();
    await main.getByRole('heading', { name: 'My Orders', exact: true }).waitFor();
    assert.equal(await page.getByRole('dialog', { name: 'Sign in', exact: true }).isVisible(), true);
    assert.equal(await main.getByRole('heading', { name: 'Sign in with your mobile', exact: true }).count(), 1);
    await page.getByRole('button', { name: 'Close login', exact: true }).click();
    await page.waitForURL('http://localhost:3000/');
    await page.goto('http://localhost:3000/profile?tab=orders');
    await page.getByRole('dialog', { name: 'Sign in', exact: true }).waitFor();
    await main.getByLabel('Mobile number', { exact: true }).fill('9876543210');
    await main.getByRole('button', { name: 'Send OTP', exact: true }).click();
    await main.getByLabel('OTP', { exact: true }).fill('000000');
    await main.getByRole('button', { name: 'Verify OTP', exact: true }).click();
    await main.getByText('Incorrect OTP', { exact: true }).waitFor();
    assert.equal(await main.getByLabel('OTP', { exact: true }).isVisible(), true);
    await main.getByLabel('OTP', { exact: true }).fill('123456');
    await main.getByRole('button', { name: 'Verify OTP', exact: true }).click();
    await page.getByRole('dialog', { name: 'Sign in', exact: true }).waitFor({ state: 'hidden' });
    await main.getByRole('heading', { name: 'No product orders yet', exact: true }).waitFor();
    await page.goto('http://localhost:3000/profile');
    await main.getByRole('heading', { name: 'Test Customer', exact: true }).waitFor();
    assert.equal(await main.getByRole('button', { name: 'Family & Addresses', exact: true }).isDisabled(), false);
    assert.equal(await main.getByRole('button', { name: 'Delete my account', exact: true }).isDisabled(), false);
    await page.goto('http://localhost:3000/labtest');
    assert.equal(await main.locator('.cl-lab-card').count(), 6);
    assert.equal(await main.locator('a.cl-lab-card').count(), 1);
    assert.equal(await main.locator('button.cl-lab-card:disabled').count(), 5);
    await main.locator('a.cl-lab-card').click();
    await main.getByText('Fixture Heart Package', { exact: true }).waitFor();
    await main.getByRole('button', { name: 'Packages', exact: true }).click();
    assert.equal(await main.getByText('Fixture Heart Package', { exact: true }).isVisible(), true);
    await main.getByRole('button', { name: 'Add Fixture Heart Package from Redcliffe to cart', exact: true }).click();
    await page.waitForFunction(() => localStorage.getItem('merabetta-web-v2')?.includes('redcliffe:fixture-test'));
    await page.goto('http://localhost:3000/cart?appointment=1');
    await main.getByRole('button', { name: 'Continue to family member', exact: true }).click();
    await main.getByRole('button', { name: 'Continue to address & slot', exact: true }).click();
    await main.getByRole('button', { name: '15 October 2026', exact: true }).click();
    await main.getByRole('button', { name: '9:00 AM', exact: true }).click();
    assert.equal(await main.locator('[aria-label="Collection time"] button:disabled').count(), 1);
    await main.getByRole('button', { name: '16 October 2026', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[aria-label="Collection time"] button:not(:disabled)')?.getAttribute('aria-pressed') === 'false');
    await main.getByRole('button', { name: '9:00 AM', exact: true }).click();
    await main.getByRole('button', { name: 'Review booking', exact: true }).click();
    await main.getByRole('button', { name: 'Confirm booking', exact: true }).click();
    await main.getByRole('heading', { name: /Booking being confirmed/ }).waitFor();
    const booking = requests.filter(r => r.path === '/lab-bookings' && r.method === 'POST');
    assert.equal(booking.length, 1); assert.equal(booking[0].body.items[0].quantity, 1); assert.equal(booking[0].body.address.id, undefined); assert.equal(booking[0].body.address.location.city, undefined);
    assert.ok(booking[0].body.requestKey); assert.equal(booking[0].headers.authorization, undefined); assert.equal(booking[0].headers['x-app-client'], undefined);
    const stored = await page.evaluate(() => localStorage.getItem('merabetta-web-v2'));
    assert.ok(!stored.includes('test@example.com')); assert.ok(!stored.includes('9876543210')); assert.ok(!stored.includes('Test Residency'));
    await page.goto('http://localhost:3000/cart?appointment=1');
    await main.getByRole('heading', { name: 'Check your previous checkout', exact: true }).waitFor();
    fs.mkdirSync('artifacts/integration', { recursive: true });
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('http://localhost:3000/labtest?lab=redcliffe');
      await main.getByText('Fixture Heart Package', { exact: true }).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Horizontal overflow at ${width}`);
      await page.screenshot({ path: `artifacts/integration/labs-${width}.png`, fullPage: true });
    }
    // Reset only the fixture attempt, then simulate an interrupted checkout.
    await page.evaluate(() => sessionStorage.removeItem('merabetta-pending-checkout-fixture-user'));
    failNextBooking = true;
    await page.goto('http://localhost:3000/cart?appointment=1');
    await main.getByRole('button', { name: 'Continue to family member', exact: true }).click();
    await main.getByRole('button', { name: 'Continue to address & slot', exact: true }).click();
    await main.getByRole('button', { name: '15 October 2026', exact: true }).click();
    await main.getByRole('button', { name: '9:00 AM', exact: true }).click();
    await main.getByRole('button', { name: 'Review booking', exact: true }).click();
    await main.getByRole('button', { name: 'Confirm booking', exact: true }).click();
    await main.getByRole('heading', { name: 'Check your previous checkout', exact: true }).waitFor();
    assert.equal(await main.getByRole('button', { name: 'Retry same request', exact: true }).count(), 0);
    await main.getByRole('button', { name: 'Review saved orders', exact: true }).click();
    await main.getByRole('button', { name: 'Retry same request', exact: true }).click();
    await main.getByRole('heading', { name: /Booking being confirmed/ }).waitFor();
    const retried = requests.filter(r => r.path === '/lab-bookings' && r.method === 'POST').slice(-2);
    assert.equal(retried.length, 2); assert.deepEqual(retried[0].body, retried[1].body);
    assert.deepEqual(errors, []);
    console.log('PASS: mocked browser OTP, incorrect OTP, profile, three-filter catalog, available slots, slot reset, 202 booking, strict payload, private storage, reload reconciliation, network interruption with history check and identical retry body, and 390/1440 layouts.');
  } catch (error) { console.error('URL:', page.url()); console.error('Main text:', await page.locator('main').innerText().catch(() => 'unavailable')); console.error('API requests:', JSON.stringify(requests.map(r => ({ path: r.path, method: r.method })))); throw error; } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
