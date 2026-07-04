# Slack Integration

## Purpose

This page explains how Playwright suite results are posted to Slack.

## Implementation Files

| File | Purpose |
| --- | --- |
| `reporters/SlackReporter.ts` | Collects Playwright result totals and calls the notifier |
| `utils/slack/SlackNotifier.ts` | Builds and sends the Slack webhook payload |
| `playwright.config.ts` | Registers the Slack reporter |

## Architecture

```text
Playwright suite
  -> SlackReporter.ts
  -> SlackNotifier.ts
  -> Slack Incoming Webhook
  -> Slack channel
```

## Required Configuration

Create a Slack incoming webhook and set:

```text
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

For CI, store this value as a CircleCI project environment variable.

Do not commit webhook URLs.

## Alert Content

The Slack alert includes:

- Suite status
- Duration
- Total tests
- Passed count
- Failed count
- Skipped count
- CircleCI job
- Project name
- Branch
- Commit
- Triggered by
- Datadog dashboard link
- CircleCI artifacts link when running in CI

## Local Behavior

If `SLACK_WEBHOOK_URL` is not configured, the reporter logs:

```text
[slack] SLACK_WEBHOOK_URL is not configured; skipping Slack notification.
```

The test run continues.

## CI Behavior

In CircleCI, the Slack payload uses these built-in variables when present:

| Variable | Used For |
| --- | --- |
| `CIRCLE_BUILD_URL` | Job and artifact links |
| `CIRCLE_PROJECT_REPONAME` | Project name |
| `CIRCLE_BRANCH` | Branch |
| `CIRCLE_JOB` | Job name |
| `CIRCLE_SHA1` | Commit SHA |
| `CIRCLE_USERNAME` | Triggering user |
| `CIRCLE_WORKFLOW_ID` | Workflow footer |

## Failure Behavior

Slack failures do not fail the Playwright suite. If the webhook request fails, the notifier logs a warning and allows the run to complete.

## Why Slack Is Separate From Datadog

Slack is for fast team notification. Datadog is for metrics, trends, dashboards, and longer-term observability. Keeping the reporters separate makes each integration easier to disable, debug, or replace.

