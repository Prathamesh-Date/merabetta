// Intercepted OTP responses only. Does not send SMS or verify a real code.
const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    for (const delivery of ['sms', 'development']) {
      const context = await browser.newContext(); const page = await context.newPage();
      await page.addInitScript(() => { const originalNow = Date.now.bind(Date); window.__otpTestOffset = 0; Date.now = () => originalNow() + window.__otpTestOffset; });
      let requests = 0;
      await page.route('**/api/app/**', async route => {
        const path = new URL(route.request().url()).pathname;
        if (path.endsWith('/auth/otp/request')) {
          requests++;
          return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ challengeId: `fixture-${requests}`, expiresIn: 600, resendAfter: 30, delivery, devCode: '123456' }) });
        }
        return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Login required' }) });
      });
      await page.goto('http://localhost:3000/profile');
      const main = page.locator('main');
      await main.getByRole('button', { name: 'Sign in', exact: true }).click();
      await main.getByLabel('Mobile number', { exact: true }).fill('9876543210');
      await main.getByRole('button', { name: 'Send OTP', exact: true }).click();
      await main.getByText(/^OTP entry expires in (59|60) seconds\.$/).waitFor();
      if (delivery === 'sms') assert.equal(await main.getByText(/Development OTP:/).count(), 0);
      else await main.getByText(/Development OTP:/).waitFor();
      await page.evaluate(() => { window.__otpTestOffset = 61000; });
      await main.getByText('OTP entry expires in 0 seconds.', { exact: true }).waitFor();
      assert.equal(await main.getByRole('button', { name: 'Verify OTP', exact: true }).isDisabled(), true);
      assert.equal(await main.getByText(/Development OTP:/).count(), 0);
      await main.getByRole('button', { name: 'Resend OTP', exact: true }).click();
      await main.getByText(/^OTP entry expires in (59|60) seconds\.$/).waitFor();
      assert.equal(requests, 2); assert.equal(await main.getByRole('button', { name: 'Verify OTP', exact: true }).isDisabled(), false);
      await context.close();
    }
    console.log('PASS: 60-second entry limit, expired verification disabled, resend resets deadline, dev OTP visible only for development delivery in dev UI, never for SMS delivery.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
