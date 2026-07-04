# AI Prompt Artifact

## Purpose

This page documents the AI artifact required by the challenge.

## File

```text
prompts/prompt.md
```

## What The Prompt Does

The prompt asks a Senior QA Architect assistant to produce a risk-based coverage gap analysis.

It can analyze:

- Product brief
- User workflows
- API contracts
- Defect history
- Existing test list

It returns:

- Business-critical workflows
- Coverage by layer
- Highest-risk gaps
- Recommended tests to add next
- Tests that should not be automated yet
- Flakiness risks
- CI/CD recommendations
- Executive summary

## Why This Prompt Is Useful

The challenge asks for an AI artifact that is useful in a QA context. This prompt supports a realistic QA architecture workflow: deciding what to automate next based on risk, signal, and maintainability.

It is also practical for the live review because it can be run against the current suite and used to discuss tradeoffs.

## How To Use In Review

1. Open `prompts/prompt.md`.
2. Provide the current test list and application context.
3. Run the prompt in an AI assistant.
4. Discuss which recommendations are worth implementing and which should stay manual.

## Human Judgment Boundary

The prompt should recommend and prioritize. A human QA architect should still decide:

- Whether a risk is worth automating now
- Which layer is the right layer
- Whether a UI test is worth the maintenance cost
- Whether product defects should block release

