import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { sendSlackTestSummary } from '../utils/slack/SlackNotifier';

type SlackTestTelemetry = {
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
  private tests: SlackTestTelemetry[] = [];

  onBegin(_config: FullConfig, suite: Suite): void {
    this.startedAt = Date.now();
    this.expectedTests = suite.allTests().length;
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const titlePath = test.titlePath();

    this.tests.push({
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
    const failedTests = this.tests.filter((test) => test.status !== 'passed' && test.status !== 'skipped');
    const passedTests = this.tests.filter((test) => test.status === 'passed');
    const skippedTests = this.tests.filter((test) => test.status === 'skipped');
    const retriedTests = this.tests.filter((test) => test.retry > 0);
    const passRate = this.tests.length === 0 ? 0 : (passedTests.length / this.tests.length) * 100;
    const failureRate = this.tests.length === 0 ? 0 : (failedTests.length / this.tests.length) * 100;
    const retryRate = this.tests.length === 0 ? 0 : (retriedTests.length / this.tests.length) * 100;

    await sendSlackTestSummary({
      status: result.status,
      total: this.tests.length,
      expected: this.expectedTests,
      passed: passedTests.length,
      failed: failedTests.length,
      skipped: skippedTests.length,
      retries: retriedTests.length,
      passRate,
      failureRate,
      retryRate,
      durationMs: runDuration,
      failedTests
    });
  }
}
