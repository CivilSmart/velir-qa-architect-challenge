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

## Datadog Setup

This framework sends custom Playwright metrics and events to Datadog through the official Datadog API client. Test files do not need Datadog code; the custom reporter and framework utilities handle telemetry centrally.

Create a Datadog account in the correct region:

```text
US: https://app.datadoghq.com/
EU: https://app.datadoghq.eu/
```

Create an API key in Datadog:

- `DD_API_KEY`: Organization Settings -> API Keys -> New API Key

Create a local `.env` from `.env.example`:

```bash
DD_SITE=datadoghq.com
DD_API_KEY=xxxxxxxxxxxxxxxxxxxxx
DD_ENV=local
DD_SERVICE=velir-qa-framework
DD_VERSION=1.0.0
DD_METRIC_PREFIX=qa
```

Never commit `.env`.

### Architecture

```text
Playwright
  -> reporters/DatadogReporter.ts
  -> utils/datadog/DatadogClient.ts
  -> utils/datadog/Metrics.ts
  -> utils/datadog/Events.ts
  -> Datadog Metrics API + Events API
  -> Datadog
```

### Metrics

The reporter automatically emits metrics:

```text
qa.test.pass
qa.test.fail
qa.test.skip
qa.test.total
qa.test.expected
qa.test.pass_rate
qa.test.duration
qa.retry
qa.flaky
qa.ui.pass
qa.ui.fail
qa.api.pass
qa.api.fail
qa.api.duration
qa.a11y.pass
qa.a11y.fail
qa.accessibility.score
qa.accessibility.critical_violations
```

Useful tags:

```text
env:local
service:velir-qa-framework
version:1.0.0
framework:playwright
repo:velir
browser:chromium
suite:smoke
suite:regression
module:booking
module:contact
module:rooms
priority:critical
priority:high
feature:api
feature:ui
feature:a11y
```

The reporter also sends Datadog events with `source:playwright`, including suite started, suite completed, and failed test events.

Run tests and send telemetry:

```bash
npm test
```

Run locally without sending telemetry:

```bash
DD_DRY_RUN=1 npm test
```

PowerShell:

```powershell
$env:DD_DRY_RUN = "1"
npm test
```

Send a known metric/event sample to verify Datadog ingestion before running the full test suite:

```bash
npm run datadog:smoke
```

Dashboards and widgets should be managed in Datadog. This repository only sends metrics and events.

## Folder Structure

```text
fixtures/          Playwright fixtures for page objects and API clients
pages/             Page objects for user-facing workflows
reporters/         Custom Playwright reporters, including Datadog telemetry
tests/ui/          Browser-level user workflow tests
tests/api/         REST API contract and negative tests
tests/accessibility/ axe-core accessibility smoke tests
utils/             Environment, constants, API helper, schemas, Datadog clients, test data
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

This repository includes a CircleCI pipeline in `.circleci/config.yml`.

All branches:

```bash
npm run typecheck
npm run test:smoke
```

`main` branch after smoke passes:

```bash
npm run typecheck
npm test
```

Recommended artifacts:

- Playwright HTML report
- Trace on failure
- Screenshot on failure
- Video on failure

Set these CircleCI project environment variables when Datadog telemetry should be sent from CI:

```text
DD_API_KEY
DD_SITE=datadoghq.com
DD_ENV=ci
DD_SERVICE=velir-qa-framework
DD_METRIC_PREFIX=qa
```

If `DD_API_KEY` is not configured, the custom Datadog reporter skips telemetry and the tests still run normally.

Set this CircleCI project environment variable when Slack build alerts should be sent:

```text
SLACK_WEBHOOK_URL
```

The pipeline posts a customized Slack alert for smoke and regression job success or failure. Alerts include a high-level result table with job status, project, branch, commit, trigger user, test totals, passed/failed/skipped counts, pass rate, duration, build number, and links to the CircleCI job and Playwright artifacts. If `SLACK_WEBHOOK_URL` is not configured, the Slack step is skipped without failing the build.

## Future Improvements

- Add full booking creation in an isolated test environment with teardown.
- Add admin coverage when credentials and reset strategy are available.
- Add formal OpenAPI/schema contract validation if an API specification exists.
- Add visual regression once stable design baselines are approved.
- Add accessibility triage for known issues such as icon-only links and label associations.
