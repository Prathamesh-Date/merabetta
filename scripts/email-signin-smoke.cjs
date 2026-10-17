// All OTP requests are intercepted: no real SMS or email is sent.
const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    for (const width of [1440, 390]) {
      for (const method of ['phone', 'email']) {
        const page = await browser.newPage({ viewport: { width, height: 1000 } });
        await page.addInitScript(() => { const realNow = Date.now.bind(Date); window.otpOffset = 0; Date.now = () => realNow() + window.otpOffset; });
        const requests = [], verifications = [], errors = [];
        page.on('pageerror', e => errors.push(e.message));
        let signedIn = false;
        const account = { user: { id: 'demo', name: 'Demo Customer', firstName: 'Demo', lastName: 'Customer', phone: '9876543210', email: 'demo@example.com', profileCompleted: true, gender: 'Female', dateOfBirth: '1990-01-01' }, identities: [{ method, contact: method === 'email' ? 'demo@example.com' : '9876543210' }], addresses: [], members: [] };
        await page.route('**/api/app/**', async route => {
          const path = new URL(route.request().url()).pathname;
          let status = 200, body;
          if (path.endsWith('/auth/otp/request')) {
            const payload = route.request().postDataJSON(); requests.push(payload);
            body = { challengeId: `demo-${payload.method}-${requests.length}`, expiresIn: 600, resendAfter: 30, delivery: payload.method === 'phone' ? 'sms' : 'email' };
          } else if (path.endsWith('/auth/otp/verify')) {
            const payload = route.request().postDataJSON(); verifications.push(payload);
            if (payload.code !== '123456') { status = 400; body = { error: 'Incorrect OTP' }; }
            else { signedIn = true; body = account; }
          } else if (path.endsWith('/auth/me') && signedIn) body = account;
          else { status = 401; body = { error: 'Login required' }; }
          await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
        });
        await page.goto('http://localhost:3000/profile');
        const main = page.locator('main');
        await main.getByRole('button', { name: 'Sign in', exact: true }).click();
        const dialog = main.locator('dialog[open]');
        await dialog.getByRole('button', { name: method === 'email' ? 'Email' : 'Phone', exact: true }).click();
        const input = dialog.getByLabel(method === 'email' ? 'Email address' : 'Mobile number', { exact: true });
        if (method === 'email') {
          await input.fill('invalid');
          await dialog.getByRole('button', { name: 'Send OTP', exact: true }).click();
          assert.equal(requests.length, 0);
        }
        await input.fill(method === 'email' ? 'demo@example.com' : '9876543210');
        await dialog.screenshot({ path: `artifacts/signin-${method}-${width}.png` });
        await dialog.getByRole('button', { name: 'Send OTP', exact: true }).click();
        await dialog.getByLabel('OTP', { exact: true }).waitFor();
        assert.equal(requests[0].method, method);
        assert.equal(requests[0].contact, method === 'email' ? 'demo@example.com' : '9876543210');
        await page.evaluate(() => { window.otpOffset += 31000; });
        await Promise.all([
          page.waitForResponse(r => r.url().endsWith('/auth/otp/request')),
          dialog.getByRole('button', { name: 'Resend OTP', exact: true }).click(),
        ]);
        await dialog.getByLabel('OTP', { exact: true }).fill('000000');
        await dialog.getByRole('button', { name: 'Verify OTP', exact: true }).click();
        await dialog.getByRole('alert').filter({ hasText: 'Incorrect OTP' }).waitFor();
        assert.equal(requests.length, 2);
        assert.equal(requests[1].method, method);
        assert.equal(verifications[0].challengeId, `demo-${method}-2`);
        // Switching discards the previous challenge while retaining the send cooldown.
        await dialog.getByRole('button', { name: method === 'email' ? 'Phone' : 'Email', exact: true }).click();
        assert.equal(await dialog.getByLabel('OTP', { exact: true }).count(), 0);
        assert.equal(await dialog.getByRole('alert').count(), 0);
        assert.equal(await dialog.getByRole('button', { name: /Send OTP in/ }).isDisabled(), true);
        await dialog.getByRole('button', { name: method === 'email' ? 'Email' : 'Phone', exact: true }).click();
        await page.evaluate(() => { window.otpOffset += 31000; });
        await dialog.getByRole('button', { name: 'Send OTP', exact: true }).click();
        await dialog.getByLabel('OTP', { exact: true }).fill('123456');
        await dialog.getByRole('button', { name: 'Verify OTP', exact: true }).click();
        await main.getByRole('heading', { name: 'Demo Customer', exact: true }).waitFor();
        assert.equal(verifications.at(-1).challengeId, `demo-${method}-3`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        assert.deepEqual(errors, []);
        console.log(`PASS ${method} ${width}px: payload, resend, wrong OTP, method switching, cooldown and successful login.`);
        await page.close();
      }
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
