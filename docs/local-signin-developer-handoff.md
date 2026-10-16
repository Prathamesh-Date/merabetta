# Local mobile OTP sign-in — developer handoff

Checked on 16 October 2026 against http://localhost:3000, without a customer session.

## Local status

- `GET /api/app/auth/me`: JSON 401 `Login required`, expected for a guest.
- `GET /api/app/labs/lablisting?limit=100`: JSON 200, one active Redcliffe lab.
- `GET /api/app/redcliffe/catalog`: JSON 200, 1,305 tests/packages at check time.
- A fresh logged-out local browser displayed the backend lab and all 1,305 tests; search, test details and included parameters opened without a login prompt. The directory now uses active backend lab records rather than six bundled lab names.
- Frontend mobile OTP request, verification, resend, error handling and account restoration are already implemented in `app/components/customer-auth.tsx`, `app/components/care-store.tsx` and `app/lib/customer-api.ts`.
- Real SMS delivery and successful authenticated-session persistence are not yet verified. No real customer's number or OTP was used in this check.

## Message to send the backend developer

Please confirm and test the existing mobile OTP integration for our local web frontend at `http://localhost:3000`. Browser requests use the same-origin `/api/app` proxy and `credentials: include`; do not require a mobile-app bearer token for this website flow.

1. Enable SMS delivery using the configured SMS provider and approved OTP template. Supply an agreed test mobile number/test environment and explain whether testing uses real SMS or development delivery. Do not send provider credentials to the frontend.
2. Support `POST /api/app/auth/otp/request` with:

   ```json
   { "method": "phone", "contact": "<10-digit Indian mobile number>" }
   ```

   Return `{ "challengeId": "...", "expiresIn": 600, "resendAfter": 30, "delivery": "sms" }` with the actual server-configured expiry and resend values. Return `devCode` only in an approved development environment; development delivery does not prove SMS works.
3. Support `POST /api/app/auth/otp/verify` with:

   ```json
   { "challengeId": "...", "code": "<6-digit OTP>", "deviceInfo": { "platform": "web" } }
   ```

   On success, set the HTTP-only browser session cookie and return the full account object: `user` (including `id`, `name`, `phone`, profile fields and `profileCompleted`), `identities`, `addresses`, and `members`. Confirm that an existing customer is restored and a new customer can complete their profile without an “Account unavailable” error.
4. Allow `http://localhost:3000` in the backend's origin/CSRF configuration. Make cookie Domain/Path/SameSite/Secure settings compatible with the local same-origin proxy. Confirm `GET /api/app/auth/me` returns the same account after refresh and `POST /api/app/auth/logout` clears the session with HTTP 204, followed by a 401 session check.
5. Return JSON errors for incorrect/expired OTP and validation failures. Enforce server-side expiry and resend/verification rate limits; send `Retry-After` when appropriate. The current UI has a maximum 60-second OTP entry window; confirm whether this should match a different backend expiry.
6. Keep lab directory, catalog and public test parameters accessible without a session. Require authentication for private customer information and booking submission.

Acceptance check: request OTP → receive SMS → verify → refresh and retain account → logout → session check returns 401. Also test wrong/expired OTP and resend. Please return sanitized response shapes/statuses and any backend error condition; do not share cookies, OTPs or provider secrets in screenshots/logs.

## Local configuration

The local project already has `NEXT_PUBLIC_CUSTOMER_API_URL=/` and a configured `CUSTOMER_API_ORIGIN` in untracked `.env.local`. Restart the local Next.js server after changing these values. No deployment changes are needed for this local check.
