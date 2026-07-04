# QA Automation Wiki Index

This wiki documents the QA Architect Playwright challenge framework for `https://automationintesting.online`.

Use this page as the landing page when uploading the documentation to a wiki.

## Pages

| Page | Purpose |
| --- | --- |
| [01 - Local Setup](01-Local-Setup.md) | Install dependencies, configure environment variables, and run the suite locally |
| [02 - Framework Architecture](02-Framework-Architecture.md) | Explain the Playwright framework structure, fixtures, page objects, API client, and tagging model |
| [03 - Test Strategy](03-Test-Strategy.md) | Document scope, prioritization, covered layers, deferred areas, and test design decisions |
| [04 - CircleCI Integration](04-CircleCI-Integration.md) | Explain the CI pipeline, jobs, artifacts, branch behavior, and required project variables |
| [05 - Datadog Integration](05-Datadog-Integration.md) | Explain metrics, events, tags, dry-run mode, setup, and troubleshooting |
| [06 - Slack Integration](06-Slack-Integration.md) | Explain Slack webhook setup, alert content, CI links, and failure behavior |
| [07 - Accessibility Testing](07-Accessibility-Testing.md) | Explain axe-core coverage, current known findings, and how to treat accessibility as a release gate |
| [08 - AI Prompt Artifact](08-AI-Prompt-Artifact.md) | Explain the QA prompt deliverable and how to use it during the live review |
| [09 - Review Readiness](09-Review-Readiness.md) | Summarize challenge completion, evidence, verification results, and live walkthrough order |

## Submission Status

The required challenge deliverables are complete:

- Test strategy notes
- At least one UI Playwright test
- At least one REST API Playwright test
- One AI artifact under `prompts/`

Bonus items are also included:

- Negative-path tests
- Accessibility scan with axe-core
- CircleCI pipeline
- Datadog metrics and events
- Slack suite notifications

