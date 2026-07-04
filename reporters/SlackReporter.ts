import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { sendSlackTestSummary } from '../utils/slack/SlackNotifier';

type SlackTestTelemetry = {
  id: string;
  title: string;
  suite: string;
  file: string;
  project: string;
  status: TestResult['status'];
  duration: number;
  retry: number;
};

export default class SlackReporter implements Reporter {
  private startedAt = Date.now();
  private expectedTests = 0;
  private tests = new Map<string, SlackTestTelemetry>();

  onBegin(_config: FullConfig, suite: Suite): void {
    this.startedAt = Date.now();
    this.expectedTests = suite.allTests().length;
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const titlePath = test.titlePath();

    this.tests.set(test.id, {
      id: test.id,
      title: test.title,
      suite: titlePath.length > 2 ? titlePath[titlePath.length - 2] : 'root',
      file: test.location.file.replace(/\\/g, '/'),
      project: titlePath[0] || 'unknown',
      status: result.status,
      duration: result.duration,
      retry: result.retry
    });
  }

  async onEnd(result: FullResult): Promise<void> {
    const runDuration = Date.now() - this.startedAt;
    const tests = [...this.tests.values()];
    const failedTests = tests.filter((test) => test.status !== 'passed' && test.status !== 'skipped');
    const passedTests = tests.filter((test) => test.status === 'passed');
    const skippedTests = tests.filter((test) => test.status === 'skipped');
    const retriedTests = tests.filter((test) => test.retry > 0);
    const passRate = tests.length === 0 ? 0 : (passedTests.length / tests.length) * 100;
    const failureRate = tests.length === 0 ? 0 : (failedTests.length / tests.length) * 100;
    const retryRate = tests.length === 0 ? 0 : (retriedTests.length / tests.length) * 100;

    await sendSlackTestSummary({
      status: result.status,
      total: tests.length,
      expected: this.expectedTests,
      passed: passedTests.length,
      failed: failedTests.length,
      skipped: skippedTests.length,
      retries: retriedTests.length,
      passRate,
      failureRate,
      retryRate,
      durationMs: runDuration
    });
  }
}
