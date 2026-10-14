# Merabetta website API integration

Based on the developer's WEB-INTEGRATION.md and APP-API.md dated 11 October 2026. These are interface references, not proof that provider services or payments have been tested.

## Kitni APIs hain?

APP-API.md mein **40 customer API operations** hain. Count method + path se hai: ek hi path ka GET aur POST alag operation hai. Sabka prefix `/api/app` hai.

Iske alawa **4 health/payment URLs** hain, jin par **5 operations** hain (payment return par GET aur POST dono). Total **45 documented operations**. Optional external catalog adapter ki `/categories` aur `/products` is backend ki registered APIs nahi hain.

| Group | Count | Kis kaam ke liye |
| --- | ---: | --- |
| Authentication | 5 | OTP bhejna/verify karna, session restore, logout, all devices logout |
| Customer profile | 3 | Account read, complete/update profile, account delete |
| Addresses | 4 | Address list, add, update, remove |
| Family members | 4 | Patient list, add, update, remove |
| Public ping | 1 | App API response check |
| FAQs | 1 | Website questions/answers |
| States and cities | 2 | Address dropdowns |
| Demo products and cart | 2 | Sample data only; production catalog/cart sync nahi |
| Labs listing | 1 | Available labs, filters, pagination |
| Redcliffe catalog/details/dates/slots | 4 | Real tests/prices, included parameters, collection dates and available times |
| Lab areas | 1 | Area search / serviceability lookup; selected location flow does not need this extra lookup |
| Lab bookings | 5 | History, create, cancel, amend, PDF report |
| Product orders | 3 | Create product order/payment session, history, verify payment status |
| Locations | 3 | Address search, coordinate reverse lookup, static map |
| Native version policy | 1 | Android/iOS minimum build; website ke liye nahi |
| **Customer total** | **40** | |

## Har operation ka purpose

All following paths are relative to `/api/app`.

| Method | Path | Purpose / website use |
| --- | --- | --- |
| POST | `/auth/otp/request` | Mobile number par OTP request |
| POST | `/auth/otp/verify` | OTP verify; HttpOnly cookie receive; password login nahi |
| GET | `/auth/me` | Reload par session aur account restore |
| POST | `/auth/logout` | Current session revoke |
| POST | `/auth/logout-all` | All device sessions revoke |
| GET | `/customers/me` | Account read; current UI uses `/auth/me` Account response instead |
| PUT | `/customers/me/profile` | Onboarding/profile save; backend creates initial Self member |
| DELETE | `/customers/me` | Confirmed account deletion |
| GET | `/customers/me/addresses` | Address-only list; UI uses Account.addresses |
| POST | `/customers/me/addresses` | New saved address |
| PUT | `/customers/me/addresses/:id` | Saved address edit |
| DELETE | `/customers/me/addresses/:id` | Saved address remove |
| GET | `/customers/me/family-members` | Member-only list; UI uses Account.members |
| POST | `/customers/me/family-members` | New patient/member |
| PUT | `/customers/me/family-members/:id` | Member edit |
| DELETE | `/customers/me/family-members/:id` | Member remove |
| GET | `/public` | Public connectivity check; not a user screen |
| GET | `/faqs` | FAQs display |
| GET | `/states` | Address state selection |
| GET | `/states/:stateId/cities` | Selected state's cities |
| GET | `/products` | Demo sample products; intentionally not a production source |
| GET | `/cart` | Demo cart; website manages cart locally |
| GET | `/labs/lablisting` | Active labs, including additional pages |
| GET | `/redcliffe/catalog` | Test/package IDs, prices and all categories |
| GET | `/redcliffe/packages/:code/parameters` | Included test parameter groups |
| GET | `/redcliffe/dates` | Allowed India collection dates |
| GET | `/redcliffe/slots` | Date + pin based available slots |
| GET | `/lab-areas` | Optional lab service area search; not called by selected-coordinate checkout |
| GET | `/lab-bookings` | Lab booking history and refreshed statuses |
| POST | `/lab-bookings` | Real lab booking with stable requestKey |
| POST | `/lab-bookings/:id/cancel` | Cancellation request with reason; backend decides eligibility |
| POST | `/lab-bookings/:id/amend` | Change tests using stable amendment requestKey |
| GET | `/lab-bookings/:id/reports/:reportId` | Authenticated base64 PDF download |
| POST | `/orders` | Product checkout; disabled until bundled catalog IDs are confirmed |
| GET | `/orders` | Product order history |
| GET | `/orders/:id` | Backend payment verification; never trust redirect query flags |
| GET | `/locations/search` | Debounced address lookup |
| GET | `/locations/reverse` | Current GPS coordinates to address |
| GET | `/locations/map` | Selected location map image |
| GET | `/version-policy` | Mobile store/build policy; not needed on website |

Absolute paths outside the customer prefix:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health/live` | Server is running |
| GET | `/health/ready` | Database readiness |
| POST | `/api/payments/hdfc/webhook` | HDFC to backend callback; website must not call |
| GET | `/api/payments/hdfc/return` | Payment return page |
| POST | `/api/payments/hdfc/return` | Payment form return callback |

## Configuration

The supplied backend origin is `http://16.4.61.3:3000`.

Local `.env.local` has been configured (ignored by Git):

```dotenv
NEXT_PUBLIC_CUSTOMER_API_URL=/
CUSTOMER_API_ORIGIN=http://16.4.61.3:3000
```

Next.js rewrites only `/api/app/:path*` to this fixed backend. Browser requests use the website origin and `credentials: include`; no native header, Authorization token, or frontend provider secrets. This avoids direct cross-site browser cookies and browser mixed-content requests. Backend cookie Domain/Secure settings still need login verification. Use HTTPS between hosting and backend before production.

Earlier checks accepted `Origin: http://localhost:3000`. On 2026-10-14, unauthenticated POST `/api/app/auth/logout` probes with JSON `{}` and no cookies returned HTTP 403 `App origin is not allowed. Check API ALLOWED_ORIGINS configuration.` for both `http://localhost:3000` and `http://127.0.0.1:3000`. The user's website is `http://localhost:3000/profile`; its origin is `http://localhost:3000` without `/profile`. The backend team must add that exact origin to the existing `ALLOWED_ORIGINS` configuration and reload/restart the API service. Preserve existing approved origins. Verify authenticated logout returns 204 and the subsequent `/auth/me` returns 401. A 403 response leaves the existing customer session active. Do not strip/spoof Origin to bypass its checks. Deployed website origins also need explicit approval, even with the rewrite.

```powershell
npm run dev -- --port 3000
```

Restart dev server after configuration changes. Set both variables on production hosting before a new build; NEXT_PUBLIC values are embedded at build time. Optional `NEXT_PUBLIC_CUSTOMER_IMAGE_ORIGIN` maps relative provider images; otherwise local lab artwork is used.

`NEXT_PUBLIC_PRODUCT_CHECKOUT_ENABLED=false` is the safe default. Only enable after the backend developer confirms bundled product IDs (`p1`, etc.) match its active checkout catalog. The live `/products?limit=1` returned `demo:true` with a sample Keyboard item, which does not match this website's fixtures.

## Implemented behavior

- Mobile OTP replaces demo email/password sign-in; resend and expiry use server timers.
- Website styles now reuse the original lab cards/banners, profile avatar/menu/dialog, cart item/summary layout, wishlist tabs and order filters. The lab directory always presents the original six brands; only Redcliffe is selectable, while the other five cards are disabled.
- Guest browsing: labs (including packages/details), products, profile, wishlist and cart open without authentication. Sign in is requested at Proceed to checkout, and OTP verification resumes the same checkout instead of navigating to Profile. Anonymous session checks do not delete a guest basket.
- The backend lab catalog is currently protected. Guests browse the existing bundled Redcliffe content with indicative prices. After login, checkout loads the live catalog and replaces a guest selection only on a unique exact name match. Otherwise the customer explicitly selects the current test. Only current backend IDs/availability/prices are used to submit a booking. A backend-approved public catalog endpoint is still needed for fresh anonymous API catalog data. Product checkout remains disabled pending production catalog confirmation.
- Catalog source clarification: authenticated lab browsing loads the API even when the customer profile is incomplete. An empty or failed authenticated catalog does not silently switch to bundled preview tests. Guest preview is kept separate. A fresh anonymous request to `/api/app/redcliffe/catalog` still returned HTTP 401 `Login required`.
- Latest change: the lab browsing screen no longer renders bundled preview tests for guests. Both anonymous and authenticated visits request the same lab-list and Redcliffe catalog APIs. HTTP 401/failed/empty catalog responses show an unavailable/empty state, never hardcoded test cards. Anonymous live checks confirmed both `/api/app/labs/lablisting` and `/api/app/redcliffe/catalog` still return 401; the backend must allow anonymous read access (including package parameters) for API-only guest browsing. Earlier preview behavior above is historical. Legacy IDs may still be resolved against live API records to recover previously saved carts.
- Follow-up OTP change: the frontend now limits each OTP entry attempt to 60 seconds (or the shorter server expiry), while resend still respects the backend cooldown. This does not change the server's actual expiry. A user-authorized request confirmed `delivery: development`, `expiresIn: 600`, `resendAfter: 30`; this mode does not send SMS. The real backend-provided devCode is shown only in a local development build and only for development delivery. Production UI rejects development delivery. The backend team must enable its SMS provider and set a 60-second server expiry if required.
- Cookie account restore; 401 requests login; network/provider failure offers retry.
- Complete profile, address and family member CRUD; strict location normalization.
- Active lab listing with pagination, full Redcliffe catalog, category filtering, parameter details.
- Address lookup/reverse/static map; India dates and pin-specific available slots.
- Separate lab and product checkout; unique IDs and lab quantity one; no client totals sent.
- Checkout body/requestKey is reused in memory for the same attempt. Pending/network-uncertain checkout requires order reconciliation and prevents a new attempt after reload.
- Separate backend history lists; cancellation reason, test amendments, PDF report action when booking exposes report IDs.
- Payment opens in a new tab so order ID/originating page remains available. Purchased items clear only after server-confirmed Paid status.
- Personal account/address/patient/report payloads are not stored in localStorage; old demo personal data is dropped on restore. Cart/wishlist IDs may persist. SessionStorage retains only a pending attempt UUID/order ID for reconciliation.

## Verification and remaining work

Read-only live checks on 14 October 2026:

- `/health/live`, `/health/ready`, `/api/app/public`, `/api/app/faqs`, `/api/app/states`: HTTP 200.
- `/api/app/auth/me` without cookie: HTTP 401, `Login required` as expected.
- OTP POST preflight for localhost:3000: HTTP 204, allowed origin matches, credentials true.
- `/api/app/products?limit=1`: demo response; not used as a production catalog.

The website's actual proxy also returned HTTP 200 for `/api/app/public` and `/api/app/faqs`, and expected 401 for `/api/app/auth/me`. `/profile`, `/labtest`, `/cart` returned HTTP 200.

Ten API-helper tests passed. Run `node --test scripts/customer-api.test.cjs`. An intercepted headless browser flow passed wrong/correct OTP, account/profile display, multi-category filtering, unavailable slots, slot reset after date change, 202 pending booking, strict address body, no personal data in localStorage, and pending checkout recovery after reload. Mobile 390px and desktop 1440px layouts had no horizontal overflow. This test uses fake responses and does not send SMS, create bookings or collect payment. Run `node scripts/customer-flow-smoke.cjs` with the bundled Playwright runtime and local dev server.

Production `npm run build` passed, including TypeScript and generation of all 21 pages. Final TypeScript checks and the browser flow also passed after adding history-first manual retries; the browser test verifies that an interrupted checkout retry sends the identical body and requestKey. The rewrite timeout permits the documented two-minute catalog load, while the browser helper still applies per-operation timeouts.

Still requires a test customer login and provider checks: received OTP/cookie, reload, completed/new profiles, live catalog, real serviceable pin/slots, booking 201/202/reconciliation, reports and payment gateway. Do not describe these as live-tested yet. The provider booking/report metadata shapes must be confirmed against an authenticated response; the reference only describes them at a high level.

The documented HDFC return page currently links to the mobile deep link `merabetta://payment-return`. A production website return page must be agreed with the backend team. No product cancellation/refund API is documented.
