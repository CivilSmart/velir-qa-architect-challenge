# Accessibility Testing

## Purpose

This page explains the automated accessibility layer.

## Implementation Files

| File | Purpose |
| --- | --- |
| `tests/accessibility/home.accessibility.spec.ts` | Runs the home page accessibility smoke test |
| `utils/accessibilityScanner.ts` | Wraps axe-core and formats critical violation output |
| `utils/datadog/Metrics.ts` | Records accessibility metrics |

## Tooling

The framework uses:

```text
@axe-core/playwright
```

## Test Flow

1. Navigate to the home page.
2. Wait for primary room content to load.
3. Run an axe-core scan.
4. Record accessibility metrics.
5. Fail the test if critical violations exist.

## Current Gate

The test currently gates only critical violations.

This is deliberate because automated accessibility tools can produce lower-severity noise in demo or third-party-controlled applications. Critical findings are more suitable as a smoke gate.

## Current Known Finding

The public target application currently has a critical axe `label` violation.

Affected areas observed during verification:

- Date input fields
- Contact description textarea

This means the accessibility test is working and detecting a real product issue.

## Recommended Handling

For a production pipeline:

1. Fix the application labels if the team owns the code.
2. If the team does not own the app, baseline the known violation with a defect link.
3. Keep critical accessibility violations visible in Datadog.
4. Review serious/moderate issues outside the smoke gate.

## Metrics

Accessibility emits:

| Metric | Meaning |
| --- | --- |
| `qa.accessibility.score` | `100` if no critical violations, otherwise `0` |
| `qa.accessibility.critical_violations` | Number of critical violations |
| `qa.accessibility.wcag_failures` | Total axe violations |
| `qa.accessibility.violation` | Count by rule and impact |

