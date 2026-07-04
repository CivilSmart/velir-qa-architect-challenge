# Local Setup

## Purpose

This page explains how to install, configure, and run the QA automation framework locally.

## Prerequisites

- Node.js
- npm
- Git
- Browser dependencies installed by Playwright

## Install Dependencies

```bash
npm install
npx playwright install
```

On Windows PowerShell, if `npm` is blocked by execution policy, use `npm.cmd`:

```powershell
npm.cmd install
npx.cmd playwright install
```

## Environment Configuration

Create a local `.env` file from `.env.example`.

```text
BASE_URL=https://automationintesting.online
DD_SITE=datadoghq.com
DD_API_KEY=
DD_ENV=local
DD_SERVICE=velir-qa-framework
DD_VERSION=1.0.0
DD_METRIC_PREFIX=qa
DD_DRY_RUN=1
SLACK_WEBHOOK_URL=
```

Do not commit `.env`.

## Common Commands

| Command | Purpose |
| --- | --- |
| `npm test` | Run the full Playwright suite |
| `npm run test:ui` | Run UI tests |
| `npm run test:api` | Run API tests |
| `npm run test:a11y` | Run accessibility tests |
| `npm run test:smoke` | Run tests tagged `@smoke` |
| `npm run typecheck` | Run TypeScript validation |
| `npm run datadog:smoke` | Send a sample Datadog metric/event |

PowerShell alternatives:

```powershell
npm.cmd run typecheck
npm.cmd run test:smoke
```

## Running Against Another Environment

Bash:

```bash
BASE_URL=https://automationintesting.online npm test
```

PowerShell:

```powershell
$env:BASE_URL = "https://automationintesting.online"
npm.cmd test
```

## Local Telemetry Behavior

Use `DD_DRY_RUN=1` when running locally if Datadog telemetry should be printed but not sent.

If `SLACK_WEBHOOK_URL` is blank, Slack notification is skipped and the test run continues.

