# Test Strategy

## Purpose

This page explains the risk-based testing approach for the Restful Booker Platform demo application.

## Target Application

`https://automationintesting.online`

The application supports room discovery, availability checks, reservations, contact submission, and supporting REST APIs.

## Covered Layers

| Layer | Why It Is Covered |
| --- | --- |
| UI | Validates that a guest can discover rooms and enter the booking journey |
| API | Validates the room data contract that powers the UI |
| Negative validation | Confirms invalid user or booking data is rejected |
| Accessibility | Detects critical automated WCAG issues with axe-core |
| Observability | Sends test outcomes to Datadog and Slack for release visibility |

## Prioritized Workflows

1. Room discovery
2. Availability check
3. Reservation intent
4. Room API inventory contract
5. Invalid booking/contact validation
6. Critical accessibility checks

## Automated Tests

| Test | File | Reason |
| --- | --- | --- |
| Room reservation intent UI smoke | `tests/ui/room-reservation-intent.spec.ts` | Highest-value guest journey without creating shared data |
| Room API inventory contract | `tests/api/rooms.api.spec.ts` | Confirms UI-critical room data is usable |
| Future availability API contract | `tests/api/rooms.api.spec.ts` | Validates availability behavior for a future stay |
| Invalid booking API rejection | `tests/api/rooms.api.spec.ts` | High-signal negative test without polluting shared data |
| Contact form mandatory validation | `tests/ui/contact-form.negative.spec.ts` | Confirms visible form validation behavior |
| Home page accessibility smoke | `tests/accessibility/home.accessibility.spec.ts` | Detects critical accessibility defects |

## Deprioritized Areas

| Area | Reason |
| --- | --- |
| Successful booking creation | Public shared environment has no reset/teardown strategy |
| Admin workflows | Credentials and data reset are not provided |
| Pixel-perfect visual regression | Requires stable approved baselines |
| Exhaustive calendar navigation | Lower value than contract and core journey checks |
| Social links and map tiles | Lower business risk for this challenge |

## Flakiness Controls

- No fixed sleeps.
- Tests wait for visible user outcomes.
- Future dates are generated dynamically.
- Mutating tests focus on negative validation.
- CI retries are enabled only in CI.
- Failure artifacts include screenshots, videos, and traces.

## Current Known Risk

The accessibility test currently detects a critical label issue in the public app. This is a valid product finding. For a production gate, the team should fix the labels or baseline the known issue with a tracked defect.

