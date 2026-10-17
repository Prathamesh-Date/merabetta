const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const enquiryId = '5761f3c9-3a01-4eb7-866f-3e92cff9402e';
  try {
    for (const width of [1440, 768, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      let requests = 0;
      let releaseSubmission;
      await page.route('**/api/app/contact-enquiries', async route => {
        requests++;
        if (requests === 1) {
          await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Please retry shortly.' }) });
        } else {
          await new Promise(resolve => { releaseSubmission = resolve; });
          await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ enquiryId, message: 'Received' }) });
        }
      });
      await page.goto('http://localhost:3000/contact', { waitUntil: 'networkidle' });
      await page.getByLabel('Full name').fill('Demo Customer');
      await page.getByLabel('Email address').fill('demo@example.com');
      await page.getByLabel('Phone number').fill('9876543210');
      await page.getByLabel('Your message').fill('Preview only: checking contact confirmation.');
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: 'Please retry shortly.' }).waitFor();
      assert.equal(await page.getByLabel('Full name').inputValue(), 'Demo Customer');
      assert.equal(await page.getByRole('heading', { name: 'Thank you!', exact: true }).count(), 0);
      await Promise.all([
        page.waitForRequest('**/api/app/contact-enquiries'),
        page.getByRole('button', { name: 'Submit', exact: true }).click(),
      ]);
      assert.equal(await page.getByRole('button', { name: 'Submitting…' }).isDisabled(), true);
      assert.equal(requests, 2);
      releaseSubmission();
      const success = page.getByRole('status').filter({ hasText: enquiryId });
      await success.waitFor();
      assert.equal(await page.getByRole('form', { name: 'Contact enquiry' }).count(), 0);
      assert.equal(await page.getByRole('heading', { name: 'Thank you!', exact: true }).isVisible(), true);
      assert.equal(await success.getByText('Submitted', { exact: true }).isVisible(), true);
      assert.equal(await success.evaluate(el => el.contains(document.activeElement)), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await success.evaluate(el => el.scrollWidth > el.clientWidth), false);
      assert.deepEqual(errors, []);
      await page.evaluate(() => document.fonts.ready);
      const preview = width < 751 ? success : page.locator('section[aria-label="Contact Merabetta"]');
      await preview.screenshot({ path: `artifacts/contact-success-implemented-${width}.png` });
      console.log(`PASS ${width}px: errors retain form; pending submission disabled; success replaces form, focuses confirmation, and fits real enquiry ID.`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
