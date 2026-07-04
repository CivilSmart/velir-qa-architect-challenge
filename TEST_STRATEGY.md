# Test Strategy

## Context

The target application is the Restful Booker Platform demo at `https://automationintesting.online`. It represents a bed-and-breakfast booking funnel with public room discovery, availability checks, reservation intent, contact submission, and supporting APIs.

This solution intentionally keeps the automated suite small. A senior architecture answer should show where confidence comes from, not automate every visible element.

## Scope

Covered initially:

- UI smoke coverage for the room discovery to reservation-intent funnel.
- API contract coverage for room inventory and availability.
- API negative validation for invalid booking payloads.
- UI negative validation for the contact form.
- Accessibility smoke coverage with axe-core.

Deferred:

- Full booking creation in the shared public environment.
- Admin workflows without credentials and a reset strategy.
- Pixel-perfect visual checks.
- Map tile behavior and social media links.
- Exhaustive calendar navigation.

## Prioritization

The highest ROI automation is the public booking funnel because it is the most business-critical path:

1. Users must see available rooms.
2. Room data must be valid and priced.
3. Users must be able to begin reservation.
4. Invalid booking/contact data must be rejected clearly.

API checks are prioritized where they provide faster and less brittle confidence than UI checks. UI coverage is reserved for proving that the main integrated user path renders and navigates correctly.

## Architecture Decisions

- Page Object Model is used only for user-facing page behavior. This keeps tests readable without hiding assertions in excessive abstraction.
- Fixtures create page objects and API clients consistently across tests.
- API helpers isolate endpoint usage from test intent.
- Schema-style assertions live in `utils/schemas.ts` so response expectations are reusable.
- Test data is centralized in `utils/testData.ts`, including future dates to avoid stale date failures.
- Environment configuration is centralized in `utils/env.ts` and supports `BASE_URL` for CI and test environments.

## UI Strategy

The UI test validates a high-value, low-mutation flow:

Room discovery -> first room -> reservation intent.

This was selected because it proves that the home page hydrates, room cards render from API-backed data, and the user can enter the booking funnel without creating shared state.

Selectors prefer:

- `getByRole`
- `getByLabel`
- Stable visible names

CSS selectors are avoided except for bounded structural checks such as room cards inside `#rooms`.

## API Strategy

The API tests validate:

- `GET /api/room` returns usable inventory.
- `GET /api/room?checkin=&checkout=` returns available room data.
- `POST /api/booking` rejects invalid data with a `400` response and validation errors.

This gives strong confidence in the data contract supporting the UI while avoiding test pollution from creating live bookings.

## Accessibility Strategy

An axe-core smoke test runs against the home page after the main room inventory is visible. The test currently gates critical violations. This is pragmatic for a demo application because third-party styling and component-library behavior can produce noisy lower-severity findings.

Noted opportunities from inspection:

- Contact textarea label association appears inconsistent.
- Navbar toggle should have an accessible name.
- Icon-only social links should have accessible names.
- Room image alt text is generic.
- Loading spinner text appears empty.

## CI/CD Integration

Recommended pipeline:

- Pull request: `npm run typecheck` and `npm run test:smoke`
- Main branch: full Chromium suite with API and accessibility projects
- Nightly: broader browser matrix and retry quarantine review
- Release gate: smoke plus API contract tests against the deployment candidate

Artifacts:

- HTML report
- Trace on failure
- Screenshot on failure
- Video on failure

Retries are enabled only in CI to reduce local masking of failures.

## Flakiness Controls

- No `waitForTimeout`.
- Tests wait on visible user outcomes.
- Future dates are generated dynamically.
- Mutating tests are limited to negative validation.
- Shared public environment assumptions are documented.

## Future Improvements

- Add authenticated admin tests if credentials and data reset are provided.
- Add contract tests with a formal schema validator if the API stabilizes.
- Add visual snapshots for key booking pages after design baselines are agreed.
- Add monitoring checks for production smoke coverage.
- Add booking creation only in an isolated environment with teardown support.
