# My Cart & Checkout — developer discussion report

Reviewed: 14 October 2026. Scope: the current website code, its integration notes, and read-only checks through the local Next.js API proxy. This report does not certify a real customer login, live address mutation, provider booking, or HDFC payment.

## 1. Integration count and its meaning

**19 unique HTTP operations are connected in the cart/checkout journey: 15 checkout operations + 4 authentication/profile dependencies.** An operation means one HTTP method plus one route pattern. GET and POST on the same route count separately. These operations are conditional; visiting Cart does not make all 19 requests.

“Connected” means the frontend has a call site and handles a response. It does not mean the backend business behavior has passed an authenticated live test. Product order creation is connected in code but currently disabled by the product-catalog confirmation setting.

All customer paths below have the prefix **`/api/app`**. Browser requests use the website origin, `credentials: include`, and a fixed Next.js rewrite to the configured backend. They do not use native app authorization headers.

### Authentication/profile dependencies — 4 operations

| # | Method | Path after `/api/app` | Trigger / purpose |
|---|---|---|---|
| 1 | GET | `/auth/me` | Restore session; read account, profile, saved addresses and family members |
| 2 | POST | `/auth/otp/request` | Request mobile sign-in OTP |
| 3 | POST | `/auth/otp/verify` | Verify OTP and receive authenticated account/session |
| 4 | PUT | `/customers/me/profile` | Complete profile when `user.profileCompleted` is false/missing |

### Cart/checkout operations — 15 operations

| # | Method | Path after `/api/app` | Trigger / purpose |
|---|---|---|---|
| 5 | POST | `/customers/me/addresses` | Save a new address |
| 6 | PUT | `/customers/me/addresses/:id` | Update a saved address |
| 7 | DELETE | `/customers/me/addresses/:id` | Delete an address after UI confirmation |
| 8 | GET | `/states` | Populate State options in the address editor |
| 9 | GET | `/states/:stateId/cities` | Populate City options for the selected state |
| 10 | GET | `/locations/search?q=...` | Search area/street/landmark; minimum 3 characters; debounced |
| 11 | GET | `/locations/reverse?lat=...&lon=...` | Convert browser GPS coordinates into an address |
| 12 | GET | `/locations/map?lat=...&lon=...&zoom=15` | Show a map for the selected pin |
| 13 | GET | `/redcliffe/catalog` | Obtain live lab IDs, prices and availability; resolve saved preview tests |
| 14 | GET | `/redcliffe/dates` | Available collection dates |
| 15 | GET | `/redcliffe/slots?collectionDate=...&latitude=...&longitude=...` | Available slots and serviceability for a date/pin |
| 16 | POST | `/lab-bookings` | Submit a lab booking with patient, address, date, slot and stable request key |
| 17 | GET | `/lab-bookings` | Check booking history after an uncertain checkout attempt |
| 18 | POST | `/orders` | Save a product order and obtain its payment URL; presently disabled in UI |
| 19 | GET | `/orders` | Check product order history after an uncertain checkout attempt |

### Related existing APIs not counted in the 19

| API | Current use / recommendation |
|---|---|
| `GET /customers/me/addresses` | Documented, but checkout uses `Account.addresses` from `/auth/me` and address mutation responses. Add a separate fetch only if that account response is incomplete or independent refresh is needed. |
| `GET /customers/me` | Documented account endpoint; current session restore uses `/auth/me`. Confirm whether both return the same full account shape. |
| `GET /customers/me/family-members` | Documented; checkout currently uses `Account.members`. |
| POST/PUT/DELETE family-member endpoints | Already connected on the Family & Addresses page, reached from “Manage family members”; not direct checkout operations. |
| `GET /orders/:id` | Already used in My Orders to verify product payment status. Should also be used on the website payment-return flow. |
| `GET /products` | Exists, but live anonymous response is demo data; website product cards currently come from bundled catalog data. |
| `GET /cart` | Documented demo cart endpoint; website cart is currently browser-local, not synchronized with it. |
| `/api/payments/hdfc/webhook` | Backend-to-backend gateway callback. The browser must not call this endpoint. |
| GET/POST `/api/payments/hdfc/return` | Documented gateway return handlers; confirm the website return destination and behavior. These are outside `/api/app`. |

## 2. Checks performed and limits

Fresh live checks used GET requests without a signed-in customer's cookie. No SMS was requested, no real address was saved/deleted, no booking was created, and no payment was initiated.

| Live GET check | Result | Interpretation |
|---|---|---|
| `/states` | 200; 36 records | State list is reachable |
| `/states/:stateId/cities` | 200 for a returned state ID | City list is reachable |
| `/products` | 200; `demo: true`; 2 records | Not verified as a production product catalog |
| `/auth/me` | 401; `Login required` | Authentication is required; does not prove signed-in session restoration works |
| `/customers/me/addresses` | 401; `Login required` | Protected address list |
| `/redcliffe/catalog` | 401; `Login required` | Live lab catalog is protected |
| `/redcliffe/dates` | 401; `Login required` | Protected collection dates |
| `/lab-bookings` | 401; `Login required` | Protected booking history |
| `/orders` | 401; `Login required` | Protected order history |
| `/cart` | 401; `Login required` | Cart endpoint is protected; its authenticated contract was not checked |

Browser checks with intercepted/mock responses passed: address POST/PUT and selection after reload; delete cancellation, failed deletion, selected-address fallback and deleting the last address; downward scrolling State/City options; collection-location selection; separate Products/Labs totals and booking payloads; keeping the other section's items after booking; desktop/mobile layout. TypeScript checks passed after the checkout/deletion implementation.

**Still unverified live:** successful OTP/cookie, profile persistence across sign-outs, address mutation response shape, real lab serviceability/slots/booking, real product totals/order creation, HDFC redirect/callback/payment verification.

## 3. Access/permissions and information required from the customer

### Browser/device permission

**Only location permission is requested, and only when “Use current location” is clicked.** The customer can decline and search/type an address. Background location is not used. A lab booking still needs a selected collection pin; the search API can provide coordinates without browser GPS permission.

The website does not request contacts, SMS-reading, camera, microphone, device files, or notification permission for this checkout flow. OTP is entered manually or supplied through browser one-time-code autofill; no SMS-reading API is integrated.

Session cookies, browser cart storage and pending-checkout storage operate through normal website storage, not an OS permission dialog.

### Information/forms

| Purpose | Information currently needed |
|---|---|
| Sign in | Indian mobile number and six-digit OTP |
| Profile completion | Current form requires first name, last name, phone, email, date of birth and a gender selection. Discuss whether DOB/gender should be required for product-only customers; this depends on backend validation. |
| Product delivery | Selected saved address or a newly saved address: address line 1, State, City, PIN code; house/flat number is required by the UI when a location pin is present. Building, line 2 and landmark are optional. |
| Lab collection | A selected collection pin, saved collection address, patient/member selection, date and available slot. Family-member creation on the separate management page collects name, relationship, DOB and gender; member phone is optional there. |
| Notes | Delivery notes are optional, up to 1,000 characters |
| Payment | The customer completes payment on the gateway. This website does not collect card/UPI credentials or bank passwords in checkout. |
| Address deletion | Explicit confirmation in the checkout UI |

## 4. Request/response contracts the backend developer must confirm

The shapes below are **what the current frontend expects**, not proof of the live backend's authenticated responses.

### A. Account/session and saved data

`GET /auth/me`, successful OTP verification, profile save, and address create/update/delete are currently expected to return a full `Account` object:

```json
{
  "user": {
    "id": "customer-id",
    "name": "Customer Name",
    "firstName": "Customer",
    "lastName": "Name",
    "phone": "customer-mobile",
    "email": "customer-email",
    "dateOfBirth": "YYYY-MM-DD",
    "gender": "Female",
    "profileCompleted": true
  },
  "identities": [],
  "addresses": [],
  "members": []
}
```

Important questions:

- Does profile save persist to the database and return `profileCompleted: true`? Do OTP verification and `/auth/me` return that same saved profile on the next login?
- What backend condition produces the reported **“Account unavailable”** error? The exact condition has not been established from an authenticated response or backend logs.
- Do address POST/PUT/DELETE return `Account`, a standalone address/list, or 204? The frontend currently expects `Account`; a 204 delete or a different response shape needs an adapter/change.
- Do new addresses have stable IDs, and does an update retain the address ID? Selection and deletion use those IDs.
- Are cookie Domain/Path/Secure/SameSite and session lifetime compatible with the website's proxy and production HTTPS origin?
- Is the deployed website origin allowed by backend origin/CSRF rules?

### B. OTP payloads

Request: `POST /auth/otp/request`

```json
{ "method": "phone", "contact": "customer-mobile" }
```

Expected challenge fields: `challengeId`, `expiresIn`, `resendAfter`, `delivery`; development delivery may also include `devCode`.

Verification: `POST /auth/otp/verify`

```json
{ "challengeId": "challenge-id", "code": "six-digit-otp", "deviceInfo": { "platform": "web" } }
```

The frontend currently has a 60-second OTP entry window, even if the backend challenge lasts longer. Confirm the intended server expiry, resend limit and error handling. The previous integration notes recorded development delivery, which does not send SMS; SMS-provider readiness must be confirmed for production.

### C. Address create/update/delete

Create: `POST /customers/me/addresses`. Update: `PUT /customers/me/addresses/:id`. Delete: `DELETE /customers/me/addresses/:id` without an address payload.

Create/update body includes address lines, State/City/PIN, optional house/building/landmark, and optional location. The frontend strips the address ID from the body and sends it in the update URL.

Location fields sent: `provider`, `placeId`, `displayName`, `latitude`, `longitude`, and `address` containing provider address components. Confirm the strict accepted schema and whether product delivery requires a pin or accepts manually entered addresses.

### D. Product order

`POST /orders` receives:

```json
{
  "requestKey": "stable-uuid-for-this-attempt",
  "items": [{ "id": "real-backend-product-id", "quantity": 1 }],
  "address": {
    "line1": "customer-address",
    "state": "customer-state",
    "city": "customer-city",
    "postalCode": "customer-pin"
  },
  "notes": "optional delivery notes",
  "coupon": true
}
```

- Product IDs currently come from bundled frontend data such as `p1`; do not assume these match the production backend catalog.
- Address is sent inline, not just as `addressId`.
- `coupon` is currently a boolean. The literal code `MERA20` is not sent as a `couponCode` string.
- Client price/total is not included in the order payload. Backend must calculate and validate final pricing.
- Expected order fields include `id`, `paymentStatus`, `status`, and optional `paymentUrl`.
- An HTTPS payment URL for the real gateway and a supported website return flow must be confirmed.
- Backend must deduplicate retries with the same `requestKey`.

### E. Lab booking

`POST /lab-bookings` sends the same stable request key, live item IDs, inline address and notes, plus:

```json
{ "memberId": "patient-id", "collectionDate": "YYYY-MM-DD", "slotId": "available-slot-id" }
```

Lab quantities are 1. Product and lab checkout are separated. Address/date changes invalidate the previously selected slot. Backend must revalidate serviceability, slot availability, patient ownership, live prices and the request key.

A 202 response is treated as pending confirmation; the frontend preserves the attempt and asks the customer to check orders rather than claim a confirmed booking.

## 5. Missing/remaining integrations, in priority order

### Required before real product checkout

1. **Production product catalog.** Existing `/products` returned demo data. Provide a confirmed production response with stable IDs, selling price, MRP, stock/availability and images. Then replace bundled product data in browsing/cart and enable checkout. The existing `NEXT_PUBLIC_PRODUCT_CHECKOUT_ENABLED` setting currently evaluates to false.
2. **Server checkout quote/validation.** Recommended new API, for example `POST /checkout/quote` (proposed name; not an existing verified endpoint). Send item IDs/quantities, address or PIN, and coupon code. Return item total/MRP, product saving, valid coupon discount, delivery charge, final total, availability and actionable errors. This can cover coupon validation and product serviceability without separate endpoints.
3. **Real coupon contract.** Today `MERA20` is applied locally with a boolean submitted to `/orders`. Agree on code validation, expiry, eligibility, minimum spend, per-user limits and cap. If `/orders` already validates the boolean offer, confirm that contract; for configurable codes, introduce `couponCode` and server validation, preferably through the quote API.
4. **Website payment return + verification.** Integrate the existing `GET /orders/:id` into a website return page. Never treat URL query text such as `success=true` as proof of payment. Confirm backend webhook/return configuration and the customer order status after success, failure, cancellation and pending payment. The integration notes describe a mobile return deep link; the website destination needs confirmation.

### Existing behavior that needs backend confirmation/fixes

5. **Profile persistence and account availability.** Investigate the reported OTP/account error and repeated profile-completion form using backend logs and signed-in API responses. This is not solved merely by adding another frontend save call.
6. **Address response contracts.** Confirm complete Account responses and saved address IDs for POST/PUT/DELETE, or adapt the frontend to the actual API contract.
7. **Authenticated lab flow.** Live catalog/dates are protected. Test actual location-provider responses, available slots, real booking and pending reconciliation with a designated test customer. If guests should see current live lab prices, backend must support public read access/a public catalog contract.
8. **Provider and hosting configuration.** Confirm SMS, location/maps, Redcliffe and HDFC server credentials/configuration. These are backend/deployment configuration, not permissions or credentials requested from the customer. The configured backend origin currently uses HTTP; production transport and cookies need HTTPS hosting alignment.

### Optional, depending on product requirements

9. **Server cart synchronization.** Cart/wishlist/coupon state currently lives in browser storage. Logout clears cart state through the account store; there is no cross-device server cart synchronization. Existing `/cart` is documented as demo and no production cart mutations are connected. If cross-device persistence is required, agree on GET cart plus add/update/remove item operations and guest-to-account merge rules. Endpoint names/methods are proposals until the backend contract is supplied.
10. **Independent address/member refresh.** Existing address/member list APIs can be used if full `/auth/me` responses are not sufficient. They are not mandatory duplicate calls when Account already contains fresh lists.

### Current frontend pricing rules requiring business confirmation

- Item total = selling-price subtotal + MRP savings.
- Product saving = sum of positive `(MRP - selling price) × quantity`.
- `MERA20` = 20% of selling-price subtotal, rounded to whole rupees, maximum ₹200; not applied to labs.
- Product delivery = ₹40 when selling-price subtotal is below ₹499, otherwise free.
- Final displayed amount = selling-price subtotal − coupon discount + delivery.

These are frontend estimates. Backend quote/order pricing must be the authoritative source before payment.

## 6. Backend discussion checklist

Ask the developer for:

- Current API specification/OpenAPI or request-response examples, including authenticated Account and mutation responses.
- A designated test customer and approved test environment; confirm whether OTP is SMS or development delivery.
- Logs for “Account unavailable” and saved profile state after a second sign-in.
- A production product catalog and ID mapping; stock, MRP, delivery/serviceability rules and offer rules.
- Quote/coupon validation contract or confirmation of an existing equivalent API.
- Address CRUD response examples and whether deleting a booking/order address changes past orders; backend should retain the historical order address snapshot.
- Real lab sample catalog, date/slot responses, patient/member rules and booking status semantics.
- HDFC sandbox flow, website return URLs, webhook readiness and order-status verification responses.
- Idempotency behavior for order/booking retries and recovery after a timeout.
- Production HTTPS origin, cookie/origin settings, and provider configuration readiness.
- Decision on cross-device cart persistence and whether logout should keep a customer's cart.

## 7. Frontend implementation references

- `app/components/customer-cart.tsx`: totals, section-specific cart, slots, booking/order submission, pending recovery and payment modal.
- `app/components/checkout-delivery.tsx`: saved address cards, add/edit/delete APIs and selected-address fallback.
- `app/components/customer-address.tsx`: State/City and location-provider calls.
- `app/components/customer-auth.tsx`: OTP and profile completion.
- `app/components/care-store.tsx`: session restore and browser-local cart persistence.
- `app/lib/customer-api.ts`: routes, payload types, cookie-based requests, errors and timeouts.
- `next.config.ts`: fixed same-origin API rewrite.
- `scripts/checkout-address-smoke.cjs`, `scripts/delete-address-smoke.cjs`, `scripts/cart-sections-smoke.cjs`: mocked browser verification.

This report is an audit and handoff. Proposed new endpoints have not been invented or silently integrated into the website.
