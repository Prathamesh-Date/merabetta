// Mocked DELETE responses only. Never removes a real saved address.
const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      const account = { user: { id: 'delete-fixture', name: 'Test Customer', profileCompleted: true }, identities: [], members: [], addresses: ['a1', 'a2', 'a3'].map(id => ({ id, line1: `Test address ${id}`, city: 'Pune', state: 'Maharashtra', postalCode: '411045' })) };
      const calls = []; let failDelete = true;
      await page.route('**/api/app/**', async route => {
        const path = new URL(route.request().url()).pathname.replace('/api/app', '');
        let status = 200; let data = { data: [] };
        if (path === '/auth/me') data = account;
        else if (route.request().method() === 'DELETE') {
          calls.push(path);
          if (failDelete) { status = 500; data = { error: 'Fixture deletion failed' }; }
          else { account.addresses = account.addresses.filter(a => a.id !== path.split('/').at(-1)); data = account; }
        }
        await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
      });
      await page.goto('http://localhost:3000/cart', { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => localStorage.setItem('merabetta-web-v2', JSON.stringify({ cart: { p1: 1 }, wishlist: [], coupon: false })));
      await page.reload({ waitUntil: 'domcontentloaded' });
      const main = page.locator('main');
      await main.getByRole('button', { name: 'Proceed to checkout - Rs. 92', exact: true }).click();
      const confirmation = main.getByRole('group', { name: 'Confirm address deletion' });
      const selected = () => main.getByRole('radio', { checked: true }).inputValue();
      await main.getByRole('button', { name: 'Delete address: Test address a2', exact: true }).click();
      await confirmation.getByRole('button', { name: 'Cancel', exact: true }).click();
      assert.equal(calls.length, 0); assert.equal(await selected(), 'a1');
      await main.getByRole('button', { name: 'Delete address: Test address a2', exact: true }).click();
      await confirmation.getByRole('button', { name: 'Delete', exact: true }).click();
      await main.getByRole('alert').getByText('Fixture deletion failed', { exact: true }).waitFor();
      assert.equal(await main.getByRole('radio').count(), 3); assert.equal(await selected(), 'a1');
      failDelete = false;
      await confirmation.getByRole('button', { name: 'Delete', exact: true }).click();
      await page.waitForFunction(() => document.querySelectorAll('input[name="checkout-address"]').length === 2);
      assert.equal(await selected(), 'a1');
      await main.getByRole('button', { name: 'Delete address: Test address a1', exact: true }).click();
      await confirmation.getByRole('button', { name: 'Delete', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('input[name="checkout-address"]:checked')?.value === 'a3');
      assert.equal(await main.getByLabel('Search your area', { exact: true }).count(), 0);
      await main.getByRole('button', { name: 'Delete address: Test address a3', exact: true }).click();
      await confirmation.getByRole('button', { name: 'Delete', exact: true }).click();
      await main.getByRole('heading', { name: 'Add a new address', exact: true }).waitFor();
      assert.equal(await main.getByRole('radio').count(), 0);
      assert.equal(await main.getByRole('button', { name: 'Change selected address details', exact: true }).count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.deepEqual(calls, ['/customers/me/addresses/a2', '/customers/me/addresses/a2', '/customers/me/addresses/a1', '/customers/me/addresses/a3']);
      await context.close();
      console.log('PASS', width, 'cancel, failed deletion preserved, nonselected deletion, selected fallback, last address opens editor.');
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
