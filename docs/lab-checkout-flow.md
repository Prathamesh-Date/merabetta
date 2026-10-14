# Lab checkout

The website now follows Tests → Member → Visit → Review, based on the supplied APK screenshots. The existing Primary summary stays beside the flow on desktop and below it on smaller screens. Product checkout keeps its existing payment flow.

## Connected APIs

All paths below have the `/api/app` prefix and use the existing API client with session cookies.

| Endpoint | Use |
| --- | --- |
| GET /auth/me | Signed-in profile, saved members and addresses |
| GET /redcliffe/catalog | Current test IDs, prices and availability; resolves public preview listings |
| POST /customers/me/family-members | Add and select a saved family member |
| PUT /customers/me/family-members/:id | Edit selected family member |
| POST /customers/me/addresses | Add collection address |
| PUT /customers/me/addresses/:id | Edit collection address |
| DELETE /customers/me/addresses/:id | Delete saved address |
| GET /states; GET /states/:id/cities | Address options |
| GET /locations/search; /locations/reverse; /locations/map | Search, optional current location and map |
| GET /redcliffe/dates | Backend collection dates |
| GET /redcliffe/slots?collectionDate=…&latitude=…&longitude=… | Available slots and serviceability |
| POST /lab-bookings | Submit after explicit review confirmation |
| GET /lab-bookings | Review saved orders following an interrupted submission |

Member and address writes expect the refreshed Account response. Collection slots come from the backend; no sample slots or hardcoded time cutoff are substituted on failure. Changing the collection date or location loads slots for the new selection. Changing date or coordinates clears the selected slot. Every test in one booking is assigned to the same saved member.

Booking body uses `requestKey`, current `items: [{ id, quantity: 1 }]`, `memberId`, cleaned `address` including collection coordinates, optional `notes`, `collectionDate`, and `slotId`. The existing request-key recovery and 202 pending handling remain in place. Product cart items survive a lab booking.

## Verification

`scripts/lab-checkout-smoke.cjs` uses mocked APIs to check member POST/PUT, empty-member validation, saved-address selection, slot error/retry, unavailable slots, date-change invalidation, explicit review confirmation, booking body and layouts at 1440/900/390/320 pixels. No real customer record or booking is created by this test.

Live authenticated booking and backend response contracts still require verification with a developer-provided test account. The summary uses current catalog prices; it is not a backend price quote. A quote API remains separate backend work, as recorded in the checkout handoff.
