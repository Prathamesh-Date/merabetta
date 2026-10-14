# Client demo check — 15 October 2026

Live URL: https://merabetta-tau.vercel.app/

## Result

The visual preview is accessible. A working authentication/lab-booking demo is blocked by deployment/backend configuration. A successful Vercel build does not confirm working APIs.

## Checked

- Production Next.js build, including TypeScript and static generation.
- Ten API-client tests covering OTP payloads, cookies, logout 204, error handling, address normalization and stable request keys.
- Mocked browser checks for OTP expiry/resend, wrong-code handling, profile completion, public/blocked/empty catalogs, guest-to-sign-in checkout, isolated product/lab carts, family member add/edit, address add/edit/delete, date/slot validation, booking confirmation/pending/recovery, logout failure/success, orders and wishlist.
- Live read-only visits at 1440px and 390px to Home, Products, Labs, Trust, Guidance, Sample Report, Profile, Offers, Support, Cart, Blog, Community and Contact. These visits showed no browser runtime errors, broken main-content images or horizontal overflow.
- No real OTP was requested, customer record changed, booking submitted or payment made during this check.

## Code issue fixed

Guest lab carts previously loaded current test details only after profile completion. Reloading a guest cart could therefore lose the visible test name/price despite retaining its ID. Catalog loading now also runs for guests with saved lab IDs. The guest test verifies reload persistence and continuation through OTP to the four-step checkout. Older profile/wishlist test expectations were updated to match the requested UI.

## Blocking live configuration

1. The live Labs screen displays “The care service is not connected yet.” Live `/api/app/auth/me`, `/api/app/labs/lablisting?limit=100` and `/api/app/redcliffe/catalog` requests return HTML 404 pages. Verify these Vercel environment variables for **Production**, then redeploy:

   ```dotenv
   NEXT_PUBLIC_CUSTOMER_API_URL=/
   CUSTOMER_API_ORIGIN=http://16.4.61.3:3000
   ```

   This is the currently supplied backend origin. Use the backend team's HTTPS origin when available. The browser should keep calling the same-origin `/api/app` paths.

2. Direct backend logout probes without cookies/credentials return HTTP 403 for `Origin: https://merabetta-tau.vercel.app`, with “App origin is not allowed. Check API ALLOWED_ORIGINS configuration.” The backend team must allow that exact website origin in its running configuration and reload/restart the API. Preserve other approved origins.

After configuration, confirm `/auth/me` returns JSON 401 for an anonymous browser, public lab/catalog reads return JSON 200, and a test customer can request/verify OTP, save a profile/address/member and log out. Successful logout should return 204 and the subsequent session check 401. Use an agreed test account for a booking check.

## Features to describe accurately to the client

- Support chat is an unsent UI preview; there is no connected support messaging endpoint.
- Lab coupon entry is present, but the documented lab booking contract does not support discounts. The UI reports that no lab discount was applied.
- Product checkout is disabled until production catalog IDs are confirmed and checkout is explicitly enabled. Products currently use bundled listings.
- The report preview contains illustrative sample values, not a patient's report.
