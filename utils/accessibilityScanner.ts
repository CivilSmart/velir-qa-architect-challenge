import AxeBuilder from '@axe-core/playwright';
import { Page } from '@playwright/test';
import type { AxeResults, Result } from 'axe-core';

export class AccessibilityScanner {
  constructor(private readonly page: Page) {}

  async expectNoCriticalAccessibilityViolations(): Promise<void> {
    const results = await new AxeBuilder({ page: this.page })
      .disableRules(['color-contrast'])
      .analyze();

    const criticalViolations = results.violations.filter((violation) => violation.impact === 'critical');

    if (criticalViolations.length > 0) {
      throw new Error(this.formatAccessibilityViolations(criticalViolations, results));
    }
  }

  private formatAccessibilityViolations(violations: Result[], results: AxeResults): string {
    if (violations.length === 0) {
      return 'No critical accessibility violations were detected.';
    }

    const summary = violations
      .map((violation, violationIndex) => {
        const affectedElements = violation.nodes
          .slice(0, 5)
          .map((node, nodeIndex) => [
            `    ${nodeIndex + 1}. Target: ${node.target.join(', ')}`,
            `       HTML: ${this.truncate(node.html)}`,
            `       Fix: ${this.firstMeaningfulFailure(node.failureSummary)}`
          ].join('\n'))
          .join('\n');

        const remainingCount = violation.nodes.length > 5
          ? `\n    ...and ${violation.nodes.length - 5} more affected element(s).`
          : '';

        return [
          `${violationIndex + 1}. [${violation.impact?.toUpperCase()}] ${violation.help}`,
          `   Rule: ${violation.id}`,
          `   Docs: ${violation.helpUrl}`,
          `   Affected elements: ${violation.nodes.length}`,
          affectedElements,
          remainingCount
        ].filter(Boolean).join('\n');
      })
      .join('\n\n');

    return [
      `Critical accessibility violations found on ${results.url}`,
      '',
      summary
    ].join('\n');
  }

  private firstMeaningfulFailure(failureSummary?: string): string {
    return failureSummary
      ?.split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith('Fix any of the following:')) ?? 'Review axe failure details.';
  }

  private truncate(value: string, maxLength = 180): string {
    return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
  }
}
