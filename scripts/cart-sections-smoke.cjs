// Mock API responses only: checks section isolation without SMS, payment or real bookings.
const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const address = { id: 'fixture-address', line1: 'Test address', houseNumber: '12', city: 'Pune', state: 'Maharashtra', postalCode: '411045', location: { provider: 'locationiq', placeId: 'fixture-pin', displayName: 'Pune, India', latitude: 18.56, longitude: 73.78, address: { city: 'Pune' } } };
const account = { user: { id: 'cart-fixture', name: 'Test Customer', firstName: 'Test', lastName: 'Customer', email: '', profileCompleted: true }, identities: [], addresses: [address], members: [{ id: 'fixture-member', name: 'Test Customer', relationship: 'Self' }] };
const lab = { id: 'redcliffe:cart-fixture', packageCode: 'CART', labId: 'redcliffe', labName: 'Redcliffe', name: 'Cart Fixture Checkup', price: 799, mrp: 999, category: 'Full Body', available: true };
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    let signedIn = true; let booking;
    await page.route('**/api/app/**', async route => {
      const path = new URL(route.request().url()).pathname.replace('/api/app', '');
      let data; let status = 200;
      if (path === '/auth/me') { data = signedIn ? account : { error: 'Login required' }; status = signedIn ? 200 : 401; }
      else if (path === '/redcliffe/catalog') data = { data: [lab] };
      else if (path === '/redcliffe/dates') data = { dates: ['2026-10-15'] };
      else if (path === '/redcliffe/slots') data = { serviceable: true, message: '', slots: [{ id: '27', label: '9:00 AM', available: true }] };
      else if (path === '/states') data = { data: [{ id: 'state', name: 'Maharashtra' }] };
      else if (path.startsWith('/states/')) data = { data: [{ id: 'city', name: 'Pune' }] };
      else if (path === '/locations/map') data = { uri: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>' };
      else if (path === '/lab-bookings' && route.request().method() === 'POST') { booking = route.request().postDataJSON(); data = { id: 'fixture-booking', status: 'Confirmed', paymentStatus: 'Payment to Redcliffe' }; status = 201; }
      else { status = 404; data = { error: 'Unmocked request' }; }
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    });
    await page.goto('http://localhost:3000/cart', { waitUntil: 'domcontentloaded' });
    async function seed(cart) { await page.evaluate(value => localStorage.setItem('merabetta-web-v2', JSON.stringify({ cart: value, wishlist: [], coupon: false })), cart); await page.reload({ waitUntil: 'domcontentloaded' }); }
    const main = page.locator('main'); const sections = main.locator('[aria-label="Cart sections"]');
    await sections.waitFor();
    await main.getByRole('heading', { name: 'Your products cart is empty' }).waitFor();
    await sections.getByRole('button', { name: 'Labs', exact: true }).click();
    await main.getByRole('heading', { name: 'Your labs cart is empty' }).waitFor();
    await seed({ p1: 2, [lab.id]: 1 });
    await main.getByRole('heading', { name: 'Crocin Advance Tablet', exact: true }).waitFor();
    assert.equal(await main.getByRole('heading', { name: lab.name }).count(), 0);
    assert.equal(await main.locator('.ca-summary dl').textContent(), 'Item total₹172Product saving−₹68Coupon discount−₹0Delivery₹40Total amount₹144');
    const hint = main.getByText('Use MERA20 for 20% off, up to ₹200.', { exact: true });
    assert.equal(await hint.evaluate(el => getComputedStyle(el).fontSize), '11px');
    await main.getByLabel('Coupon code', { exact: true }).fill('MERA20');
    await main.getByRole('button', { name: 'Apply', exact: true }).click();
    await main.getByRole('button', { name: 'Remove', exact: true }).waitFor();
    assert.equal(await main.getByRole('button', { name: 'Apply', exact: true }).count(), 0);
    assert.equal(await hint.isVisible(), false);
    assert.equal(await main.getByText('MERA20 applied', { exact: false }).count(), 0);
    assert.equal(await main.getByLabel('Coupon code').inputValue(), 'MERA20');
    assert.equal(await main.getByLabel('Coupon code').getAttribute('readonly'), '');
    assert.equal(await main.locator('.ca-summary dl').textContent(), 'Item total₹172Product saving−₹68Coupon discount−₹21Delivery₹40Total amount₹123');
    await main.getByRole('button', { name: 'Proceed to checkout - Rs. 123', exact: true }).waitFor();
    assert.equal(await main.getByText('Offers & coupons', { exact: true }).count(), 0);
    for (const label of ['Product saving', 'Coupon discount', 'Delivery']) {
      assert.equal(await main.locator('.ca-summary dl > div').filter({ has: page.locator('dt', { hasText: label }) }).locator('dd').evaluate(el => getComputedStyle(el).color), 'rgb(211, 47, 47)');
    }
    await main.getByRole('button', { name: 'Remove', exact: true }).click();
    await hint.waitFor();
    assert.equal(await main.getByLabel('Coupon code').inputValue(), '');
    await main.getByRole('button', { name: 'Proceed to checkout - Rs. 144', exact: true }).waitFor();
    await main.getByLabel('Coupon code').fill('MERA20');
    await main.getByRole('button', { name: 'Apply', exact: true }).click();
    await main.getByRole('button', { name: 'Remove', exact: true }).waitFor();
    await sections.getByRole('button', { name: 'Labs', exact: true }).click();
    await main.getByRole('heading', { name: lab.name }).waitFor();
    assert.equal(await main.getByRole('heading', { name: 'Crocin Advance Tablet', exact: true }).count(), 0);
    assert.equal(await main.locator('.ca-summary dl').textContent(), 'Item total₹999Product saving−₹200Coupon discount−₹0DeliveryFreeTotal amount₹799');
    assert.equal(await main.getByText('Book lab tests and purchase products separately. Lab payment is handled by Redcliffe.').count(), 0);
    fs.mkdirSync('artifacts/cart-sections', { recursive: true });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const kind of ['Products', 'Labs']) {
        await sections.getByRole('button', { name: kind, exact: true }).click();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await page.screenshot({ path: `artifacts/cart-sections/${kind.toLowerCase()}-${width}.png`, fullPage: true });
      }
    }
    await main.getByRole('button', { name: 'Proceed to checkout - Rs. 799', exact: true }).click();
    await main.getByRole('button', { name: 'Continue to family member', exact: true }).click();
    await main.getByRole('button', { name: 'Continue to address & slot', exact: true }).click();
    await main.getByRole('button', { name: '15 October 2026', exact: true }).click();
    await main.getByRole('button', { name: '9:00 AM', exact: true }).click();
    await main.getByRole('button', { name: 'Review booking', exact: true }).click();
    await main.getByRole('button', { name: 'Confirm booking', exact: true }).click();
    await main.getByRole('heading', { name: /Booking status: Confirmed/ }).waitFor();
    assert.deepEqual(booking.items, [{ id: lab.id, quantity: 1 }]);
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('merabetta-web-v2')).cart.p1 === 2 && !JSON.parse(localStorage.getItem('merabetta-web-v2')).cart['redcliffe:cart-fixture']);
    await page.goto('http://localhost:3000/cart', { waitUntil: 'domcontentloaded' });
    await sections.getByRole('button', { name: 'Labs', exact: true }).click();
    await main.getByRole('heading', { name: 'Your labs cart is empty' }).waitFor();
    signedIn = false; await seed({ p1: 2, [lab.id]: 1 });
    await main.getByRole('heading', { name: 'Crocin Advance Tablet', exact: true }).waitFor();
    assert.equal(await sections.count(), 0);
    console.log('PASS: signed-in sections, isolated totals and booking payload, other section retained, empty states, desktop/mobile layout, guest cart unchanged.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
