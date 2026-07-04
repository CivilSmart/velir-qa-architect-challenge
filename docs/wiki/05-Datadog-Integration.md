# Datadog Integration

## Purpose

This page explains how Playwright test telemetry is sent to Datadog.

## Implementation Files

| File | Purpose |
| --- | --- |
| `reporters/DatadogReporter.ts` | Collects Playwright suite and test outcomes |
| `utils/datadog/DatadogClient.ts` | Creates the Datadog API client |
| `utils/datadog/Metrics.ts` | Sends custom metrics |
| `utils/datadog/Events.ts` | Sends Datadog events |
| `scripts/datadog-smoke.mjs` | Sends a sample metric/event for validation |

## Architecture

```text
Playwright Reporter
  -> DatadogReporter.ts
  -> Metrics.ts / Events.ts
  -> Datadog API client
  -> Datadog Metrics API + Events API
```

## Required Configuration

Create or update `.env` locally:

```text
DD_SITE=datadoghq.com
DD_API_KEY=your_api_key
DD_ENV=local
DD_SERVICE=velir-qa-framework
DD_VERSION=1.0.0
DD_METRIC_PREFIX=qa
```

For CI, set the same values in CircleCI project environment variables.

## Dry-Run Mode

Use dry-run mode when validating locally without sending telemetry:

```text
DD_DRY_RUN=1
```

In dry-run mode, metrics and events are printed to the console instead of sent to Datadog.

## Metrics Sent

| Metric | Meaning |
| --- | --- |
| `qa.test.total` | Total tests observed by the reporter |
| `qa.test.expected` | Tests expected at suite start |
| `qa.test.pass` | Passed test count |
| `qa.test.fail` | Failed test count |
| `qa.test.skip` | Skipped test count |
| `qa.test.pass_rate` | Suite pass rate |
| `qa.test.failure_rate` | Suite failure rate |
| `qa.test.retry_rate` | Retry rate |
| `qa.test.duration` | Suite and per-test duration |
| `qa.ci.duration` | CI run duration |
| `qa.build.status` | `1` for pass, `0` for non-pass |
| `qa.retry` | Retry count |
| `qa.flaky` | Retried tests that eventually passed |
| `qa.ui.pass` / `qa.ui.fail` | UI outcome metrics |
| `qa.api.pass` / `qa.api.fail` | API outcome metrics |
| `qa.a11y.pass` / `qa.a11y.fail` | Accessibility outcome metrics |
| `qa.accessibility.score` | `100` when no critical violations are found, otherwise `0` |
| `qa.accessibility.critical_violations` | Critical axe violation count |
| `qa.accessibility.wcag_failures` | Total axe violation count |

## Tags

Common tags include:

```text
env:local
service:velir-qa-framework
version:1.0.0
framework:playwright
repo:velir
suite:smoke
suite:regression
suite:negative
feature:ui
feature:api
feature:a11y
module:booking
module:rooms
module:contact
priority:critical
priority:high
browser:chromium
status:passed
status:failed
```

## Events Sent

| Event | When |
| --- | --- |
| `Playwright Suite Started` | At suite start |
| `Test failed: <test name>` | For each failed test |
| `Playwright Suite passed/failed` | At suite completion |

## Validation Command

```bash
npm run datadog:smoke
```

## Failure Behavior

Datadog failures do not fail the Playwright suite. If the API key is missing or Datadog is unavailable, the reporter logs a warning and allows tests to complete.

