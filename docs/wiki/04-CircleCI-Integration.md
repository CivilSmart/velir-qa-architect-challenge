# CircleCI Integration

## Purpose

This page explains the CircleCI pipeline used to run type checks, smoke tests, regression tests, and collect Playwright artifacts.

## Pipeline File

The CircleCI configuration is located at:

```text
.circleci/config.yml
```

## Executor

The pipeline uses the official Playwright Docker image:

```text
mcr.microsoft.com/playwright:v1.61.1-noble
```

This avoids manual browser installation in CI.

## Jobs

| Job | Runs On | Steps |
| --- | --- | --- |
| `smoke` | All branches | Checkout, restore cache, `npm ci`, typecheck, smoke tests, artifacts |
| `regression` | `main` only | Checkout, restore cache, `npm ci`, typecheck, full suite, artifacts |

## Workflow

```text
smoke
  -> regression on main only
```

The regression job requires the smoke job to pass.

## Commands Run In CI

Smoke job:

```bash
npm run typecheck
npm run test:smoke
```

Regression job:

```bash
npm run typecheck
npm test
```

## Artifacts Collected

| Artifact | Purpose |
| --- | --- |
| `playwright-report` | HTML report |
| `test-results` | Screenshots, traces, videos, JUnit XML |
| `.tmp-playwright-results` | Additional temporary Playwright output |

## Recommended CircleCI Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `BASE_URL` | Yes | Target application URL |
| `DD_API_KEY` | Optional | Enables Datadog telemetry |
| `DD_SITE` | Optional | Datadog site, for example `datadoghq.com` |
| `DD_ENV` | Optional | Usually `ci` |
| `DD_SERVICE` | Optional | Service name for Datadog tags |
| `DD_METRIC_PREFIX` | Optional | Metric namespace, default `qa` |
| `SLACK_WEBHOOK_URL` | Optional | Enables Slack suite notifications |

## Why This Design

- Smoke tests provide fast pull request signal.
- Full regression is limited to `main` to reduce CI cost and noise.
- TypeScript checks run before Playwright tests.
- Artifacts are always collected for debugging failures.
- Datadog and Slack are environment-driven so the suite still runs without credentials.

