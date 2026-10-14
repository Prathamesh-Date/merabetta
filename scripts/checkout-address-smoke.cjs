// Local mocked checkout only. No real locations, SMS, payments or bookings.
const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    const context = await browser.newContext({ geolocation: { latitude: 18.56, longitude: 73.78 }, permissions: ['geolocation'] });
    const page = await context.newPage();
    const account = { user: { id: 'checkout-address-fixture', name: 'Test Customer', profileCompleted: true }, identities: [], addresses: [], members: [] };
    const location = { provider: 'locationiq', placeId: 'fixture', displayName: 'Test Residency, Pune, Maharashtra', latitude: 18.56, longitude: 73.78, city: 'Pune', state: 'Maharashtra', postalCode: '411045', address: { city: 'Pune', state: 'Maharashtra' } };
    const states = ['Maharashtra', 'Karnataka', ...Array.from({ length: 35 }, (_, i) => `Test State ${i + 1}`)].map((name, i) => ({ id: `${i}`, name }));
    const cities = ['Pune', ...Array.from({ length: 35 }, (_, i) => `Test City ${i + 1}`)].map((name, i) => ({ id: `${i}`, name }));
    await page.route('**/api/app/**', async route => {
      const path = new URL(route.request().url()).pathname.replace('/api/app', '');
      let data;
      if (path === '/auth/me') data = account;
      else if (path.startsWith('/customers/me/addresses')) {
        const body = route.request().postDataJSON();
        const id = route.request().method() === 'PUT' ? path.split('/').at(-1) : 'address-' + (account.addresses.length + 1);
        account.addresses = [...account.addresses.filter(a => a.id !== id), { ...body, id }];
        data = account;
      }
      else if (path === '/states') data = { data: states };
      else if (path.startsWith('/states/')) data = { data: cities };
      else if (path === '/locations/search') data = { data: [location, { ...location, placeId: 'fixture-2', displayName: 'Second test address, Pune' }] };
      else if (path === '/locations/reverse') data = location;
      else if (path === '/locations/map') data = { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=' };
      else return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"Unmocked request"}' });
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
    });
    fs.mkdirSync('artifacts/checkout-address', { recursive: true });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('http://localhost:3000/cart', { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => localStorage.setItem('merabetta-web-v2', JSON.stringify({ cart: { p1: 2 }, wishlist: [], coupon: true })));
      await page.reload({ waitUntil: 'domcontentloaded' });
      const main = page.locator('main');
      await main.getByRole('button', { name: 'Proceed to checkout - Rs. 123', exact: true }).click();
      await main.getByRole('heading', { name: 'Checkout', exact: true }).waitFor();
      await main.getByRole('button', { name: 'Back to cart', exact: true }).waitFor();
      for (const name of ['Apply', 'Remove']) assert.equal(await main.getByRole('button', { name, exact: true }).count(), 0);
      assert.equal(await main.getByLabel('Coupon code', { exact: true }).count(), 0);
      assert.equal(await main.getByText('Care for the ones you love', { exact: true }).count(), 0);
      assert.equal(await main.getByText('Use MERA20 for 20% off, up to ₹200.', { exact: true }).count(), 0);
      assert.equal(await main.getByText('Final amount and status are confirmed by the server.', { exact: true }).count(), 0);
      assert.equal(await main.getByRole('heading', { name: 'Primary summary' }).evaluate(el => getComputedStyle(el).fontWeight), await main.locator('.ca-total dt').evaluate(el => getComputedStyle(el).fontWeight));
      await main.getByRole('heading', { name: 'Ordered by', exact: true }).waitFor();
      if (!(await main.getByLabel('Search your area', { exact: true }).count())) await main.getByRole('button', { name: 'Add address', exact: true }).click();
      await main.getByLabel('Search your area', { exact: true }).fill('Test');
      const results = main.getByRole('group', { name: 'Collection location options' });
      await results.getByRole('button', { name: location.displayName, exact: true }).waitFor();
      await page.screenshot({ path: `artifacts/checkout-address/location-options-${width}.png`, fullPage: true });
      await results.getByRole('button', { name: location.displayName, exact: true }).click();
      await page.waitForFunction(name => document.querySelector('input[placeholder="Search area, street or landmark"]')?.value === name, location.displayName);
      await main.getByRole('button', { name: 'Clear location', exact: true }).click();
      assert.equal(await main.getByLabel('Search your area', { exact: true }).inputValue(), '');
      assert.equal(await main.getByLabel('Search your area', { exact: true }).evaluate(el => el === document.activeElement), true);
      assert.equal(await main.getByRole('button', { name: 'Clear location', exact: true }).count(), 0);
      assert.equal(await main.getByAltText('Selected collection location map').count(), 0);
      await main.getByLabel('Search your area', { exact: true }).fill('Test');
      await results.getByRole('button', { name: location.displayName, exact: true }).click();
      await main.getByLabel('House / flat number', { exact: true }).fill('12');
      await main.getByLabel('Address line 1', { exact: true }).fill('Test Residency');
      await main.getByRole('button', { name: 'Save address', exact: true }).click();
      await main.getByRole('radiogroup', { name: 'Delivery address', exact: true }).waitFor();
      assert.equal(await main.getByRole('radio', { checked: true }).count(), 1);
      assert.equal(await main.getByLabel('Search your area', { exact: true }).count(), 0);
      await main.getByRole('button', { name: 'Change selected address details', exact: true }).click();
      assert.equal(await main.getByLabel('Search your area', { exact: true }).inputValue(), location.displayName);
      assert.equal(await main.getByText(/^Selected pin:/).count(), 0);
      for (const resizeWidth of [1440, 1200, 1024, 1000, 900, 768, 701, 700, 480, 390, 320]) {
        await page.setViewportSize({ width: resizeWidth, height: 700 });
        const layout = await main.evaluate(el => {
          const grid = el.querySelector('.ca-cart-layout');
          const left = grid.firstElementChild.getBoundingClientRect();
          const summary = grid.querySelector('.ca-summary').getBoundingClientRect();
          return { overlaps: left.left < summary.right && left.right > summary.left && left.top < summary.bottom && left.bottom > summary.top, pageOverflow: document.documentElement.scrollWidth > innerWidth, mainOverflow: el.scrollWidth > el.clientWidth + 1, gridOverflow: grid.scrollWidth > grid.clientWidth + 1, stacked: summary.left < left.right };
        });
        assert.equal(layout.overlaps, false, 'overlap at ' + resizeWidth);
        assert.equal(layout.pageOverflow, false, 'page overflow at ' + resizeWidth);
        assert.equal(layout.mainOverflow, false, 'main overflow at ' + resizeWidth);
        assert.equal(layout.gridOverflow, false, 'grid overflow at ' + resizeWidth);
        assert.equal(layout.stacked, resizeWidth < 1024, 'breakpoint at ' + resizeWidth);
      }
      await page.setViewportSize({ width, height: 900 });
      const state = main.getByRole('combobox', { name: 'State', exact: true });
      const city = main.getByRole('combobox', { name: 'City', exact: true });
      await state.click();
      const stateList = main.getByRole('listbox', { name: 'State', exact: true });
      await stateList.waitFor();
      const layout = await stateList.evaluate(el => {
        const trigger = el.parentElement.querySelector('[role="combobox"]');
        return { downward: el.getBoundingClientRect().top >= trigger.getBoundingClientRect().bottom, fits: el.getBoundingClientRect().bottom <= Math.min(innerHeight, document.querySelector('main').getBoundingClientRect().bottom), scrolls: el.scrollHeight > el.clientHeight };
      });
      assert.deepEqual(layout, { downward: true, fits: true, scrolls: true });
      await page.screenshot({ path: `artifacts/checkout-address/state-options-${width}.png`, fullPage: true });
      await stateList.getByRole('option', { name: 'Karnataka', exact: true }).click();
      assert.equal(await city.textContent(), 'Select city');
      await city.click();
      await main.getByRole('listbox', { name: 'City', exact: true }).getByRole('option', { name: 'Test City 35', exact: true }).waitFor();
      await city.press('End'); await city.press('Enter');
      assert.equal(await city.textContent(), 'Test City 35');
      await state.click(); await state.press('Escape');
      assert.equal(await state.getAttribute('aria-expanded'), 'false');
      await main.getByRole('button', { name: 'Use current location', exact: true }).click();
      await page.waitForFunction(name => document.querySelector('input[placeholder="Search area, street or landmark"]')?.value === name, location.displayName);
      assert.equal(await state.textContent(), 'Maharashtra');
      assert.equal(await city.textContent(), 'Pune');
      await main.getByLabel('Address line 1', { exact: true }).fill('Updated Test Residency');
      await main.getByRole('button', { name: 'Save address', exact: true }).click();
      await main.getByRole('radiogroup', { name: 'Delivery address', exact: true }).getByText('Updated Test Residency, Pune, Maharashtra, 411045', { exact: true }).first().waitFor();
      await main.evaluate(el => { el.scrollTop = 0; });
      await page.screenshot({ path: `artifacts/checkout-address/saved-address-${width}.png`, fullPage: true });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await main.getByRole('button', { name: 'Proceed to checkout - Rs. 123', exact: true }).click();
      await main.getByRole('radiogroup', { name: 'Delivery address', exact: true }).getByText('Updated Test Residency, Pune, Maharashtra, 411045', { exact: true }).first().waitFor();
      assert.equal(await main.getByLabel('Search your area', { exact: true }).count(), 0);
      assert.equal(await main.getByRole('radio', { checked: true }).count(), 1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await main.getByRole('button', { name: 'Back to cart', exact: true }).click();
      await main.getByRole('button', { name: 'Proceed to checkout - Rs. 123', exact: true }).waitFor();
    }
    console.log('PASS: reference checkout, address POST/PUT and selection after reload, summary preserved, location options, downward scrolling selects, keyboard selection, desktop/mobile.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
