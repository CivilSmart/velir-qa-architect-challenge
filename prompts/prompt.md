# QA Architect Prompt: Risk-Based Coverage Gap Analysis

You are a Senior QA Architect reviewing a web application's current automated test suite.

Analyze the provided product brief, user workflows, API contracts, defect history, and existing test list. Produce a risk-based coverage gap assessment that helps a delivery team decide what to automate next.

Return:

1. Top business-critical workflows, ranked by customer and revenue risk.
2. Current coverage mapped to UI, API, accessibility, data validation, negative paths, and observability.
3. Gaps that create the highest release risk.
4. Tests that should be added first, with rationale and suggested layer: unit, API, UI, accessibility, contract, or monitoring.
5. Tests that should not be automated yet, with rationale.
6. Flakiness risks and how to design around them.
7. CI/CD recommendations, including smoke, pull request, nightly, and release-gate suites.
8. A concise executive summary for engineering leadership.

Use this format:

- Risk Area
- Evidence
- Recommended Test
- Automation Layer
- Priority
- Why Now

Optimize for maintainability and signal. Do not recommend broad UI coverage where API or contract tests would provide the same confidence faster.
