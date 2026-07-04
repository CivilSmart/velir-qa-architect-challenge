# Framework Architecture

## Purpose

This page describes how the Playwright framework is structured and why it was designed this way.

## High-Level Architecture

```text
Playwright tests
  -> fixtures/test-fixtures.ts
  -> pages/
  -> utils/apiClient.ts
  -> utils/accessibilityScanner.ts
  -> reporters/
  -> CI, Datadog, Slack, Playwright artifacts
```

The architecture keeps test intent readable while centralizing shared behavior.

## Folder Structure

| Path | Responsibility |
| --- | --- |
| `tests/ui/` | Browser-level user workflow and negative UI tests |
| `tests/api/` | REST API contract and negative tests |
| `tests/accessibility/` | axe-core accessibility smoke checks |
| `pages/` | Page objects for user-facing workflows |
| `fixtures/` | Playwright fixtures that construct page objects and helpers |
| `utils/` | Shared helpers for environment, API calls, schemas, test data, accessibility, telemetry |
| `reporters/` | Custom Playwright reporters for Datadog and Slack |
| `.circleci/` | CI pipeline configuration |
| `prompts/` | AI prompt artifact required by the challenge |

## Page Object Model

Page objects model user behavior, not every element on the page.

Examples:

- `HomePage.open()`
- `HomePage.expectRoomInventoryVisible()`
- `HomePage.checkAvailability()`
- `HomePage.openFirstRoomReservation()`
- `ReservationPage.expectReservationIntentReady()`

This keeps tests readable and avoids leaking selector details into every spec.

## Fixtures

`fixtures/test-fixtures.ts` extends Playwright's base test with:

- `homePage`
- `reservationPage`
- `apiClient`
- `accessibilityScanner`

This gives every test consistent construction without repeated setup code.

## API Client

`utils/apiClient.ts` centralizes REST calls and reusable assertions.

The API tests validate:

- Room inventory response contract
- Future availability response contract
- Invalid booking rejection behavior

## Test Metadata and Tags

`utils/test-metadata.ts` defines reusable tags:

| Category | Tags |
| --- | --- |
| Suite | `@smoke`, `@regression`, `@negative` |
| Layer | `@ui`, `@api`, `@accessibility` |
| Module | `@booking`, `@rooms`, `@contact` |
| Priority | `@critical`, `@high` |

These tags support focused local runs, CI smoke selection, and Datadog reporting.

## Reporters

The framework uses Playwright's reporter system:

- `DatadogReporter.ts` sends metrics and events.
- `SlackReporter.ts` sends suite summaries.
- Built-in list and HTML reporters remain enabled.
- JUnit is enabled in CI for test result collection.

## Design Principles

- Keep the suite small and high-signal.
- Prefer API checks when they provide the same confidence faster than UI.
- Use UI tests for integrated user flows.
- Avoid destructive data creation in the shared public demo environment.
- Centralize config, test data, schema assertions, and external integrations.

