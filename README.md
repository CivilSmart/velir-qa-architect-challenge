# QA Architect Playwright Challenge

This repository contains a compact, interview-quality Playwright solution for `https://automationintesting.online`.

The suite is intentionally focused: it demonstrates architecture, maintainability, API coverage, UI coverage, accessibility, and negative validation without turning the challenge into an oversized framework.

## Why These Tests

The highest-value workflow is the public booking funnel. The implemented UI smoke test validates that a user can discover rooms and move into reservation intent without creating shared data in the public demo environment.

API tests cover the room inventory contract because the UI depends on that data. Negative booking validation is included because it is high-signal and non-destructive.

## Install

```bash
npm install
npx playwright install
```

## Run

```bash
npm test
npm run test:ui
npm run test:api
npm run test:a11y
npm run test:smoke
npm run typecheck
```

Use a different environment:

```bash
BASE_URL=https://automationintesting.online npm test
```

On Windows PowerShell:

```powershell
$env:BASE_URL = "https://automationintesting.online"
npm test
```

## Folder Structure

```text
fixtures/          Playwright fixtures for page objects and API clients
pages/             Page objects for user-facing workflows
tests/ui/          Browser-level user workflow tests
tests/api/         REST API contract and negative tests
tests/accessibility/ axe-core accessibility smoke tests
utils/             Environment, constants, API helper, schemas, test data
prompts/           AI prompt deliverable
```

## Key Architecture Decisions

- Page objects model page behavior, not every element.
- Fixtures provide consistent construction of page objects and API helpers.
- API validation is kept close to reusable schema-style assertions.
- Dynamic future dates reduce stale test data failures.
- Mutating behavior is limited because the target is a shared public demo environment.
- axe-core is included as a smoke gate for critical accessibility issues.

## Assumptions

- The public application is available during test execution.
- Room inventory contains at least one bookable room.
- The API response shapes observed during assessment remain stable.
- No dedicated test data reset endpoint is available.

## Tradeoffs

- The suite does not create successful bookings by default to avoid polluting shared state.
- Accessibility checks gate critical violations only; lower-severity findings should be reviewed but may include demo-app noise.
- The UI suite is intentionally small because API tests provide faster confidence for data contracts.

## CI/CD Recommendation

Pull request:

```bash
npm run typecheck
npm run test:smoke
```

Main branch:

```bash
npm test
```

Recommended artifacts:

- Playwright HTML report
- Trace on failure
- Screenshot on failure
- Video on failure

## Future Improvements

- Add full booking creation in an isolated test environment with teardown.
- Add admin coverage when credentials and reset strategy are available.
- Add formal OpenAPI/schema contract validation if an API specification exists.
- Add visual regression once stable design baselines are approved.
- Add accessibility triage for known issues such as icon-only links and label associations.
