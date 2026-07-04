import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { sendEvent } from '../utils/datadog/Events';
import { normalizeTagValue, sendMetrics } from '../utils/datadog/Metrics';

type TestTelemetry = {
  id: string;
  title: string;
  suite: string;
  file: string;
  project: string;
  status: TestResult['status'];
  duration: number;
  retry: number;
  browser: string;
  tags: string[];
};

export default class DatadogReporter implements Reporter {
  private startedAt = Date.now();
  private expectedTests = 0;
  private tests = new Map<string, TestTelemetry>();

  onBegin(_config: FullConfig, suite: Suite): void {
    this.startedAt = Date.now();
    this.expectedTests = suite.allTests().length;
    void sendEvent('Playwright Suite Started', `Started ${this.expectedTests} tests.`, ['event:suite_started']);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const titlePath = test.titlePath();
    const project = titlePath[0] || 'unknown';
    const suite = titlePath.length > 2 ? titlePath[titlePath.length - 2] : 'root';
    const tags = this.extractTags(test);

    this.tests.set(test.id, {
      id: test.id,
      title: test.title,
      suite,
      file: test.location.file.replace(/\\/g, '/'),
      project,
      status: result.status,
      duration: result.duration,
      retry: result.retry,
      browser: project,
      tags
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

    const metrics = [
      { name: 'test.total', value: tests.length, tags: ['status:all'], type: 'gauge' as const },
      { name: 'test.expected', value: this.expectedTests, type: 'gauge' as const },
      { name: 'test.pass', value: passedTests.length, tags: ['status:passed'], type: 'count' as const },
      { name: 'test.fail', value: failedTests.length, tags: ['status:failed'], type: 'count' as const },
      { name: 'test.skip', value: skippedTests.length, tags: ['status:skipped'], type: 'count' as const },
      { name: 'test.pass_rate', value: passRate, type: 'gauge' as const },
      { name: 'test.failure_rate', value: failureRate, type: 'gauge' as const },
      { name: 'test.retry_rate', value: retryRate, type: 'gauge' as const },
      { name: 'test.duration', value: runDuration, tags: ['scope:run'], type: 'gauge' as const },
      { name: 'ci.duration', value: runDuration, type: 'gauge' as const },
      { name: 'build.status', value: result.status === 'passed' ? 1 : 0, tags: [`status:${result.status}`], type: 'gauge' as const },
      { name: 'retry', value: retriedTests.length, type: 'count' as const },
      { name: 'flaky', value: retriedTests.filter((test) => test.status === 'passed').length, type: 'count' as const }
    ];

    for (const test of tests) {
      const tags = this.testTags(test);
      const suiteTags = this.suiteTags(test);

      metrics.push({ name: 'test.total', value: 1, tags: ['status:all', ...tags], type: 'count' });
      metrics.push({ name: 'test.duration', value: test.duration, tags, type: 'gauge' });
      metrics.push({ name: `test.${test.status === 'passed' ? 'pass' : test.status === 'skipped' ? 'skip' : 'fail'}`, value: 1, tags, type: 'count' });
      metrics.push({ name: `${this.featureMetricPrefix(test)}.${test.status === 'passed' ? 'pass' : 'fail'}`, value: 1, tags, type: 'count' });

      for (const suiteTag of suiteTags) {
        metrics.push({ name: 'suite.total', value: 1, tags: [`suite:${suiteTag}`, ...tags], type: 'count' });
        metrics.push({
          name: `suite.${test.status === 'passed' ? 'pass' : test.status === 'skipped' ? 'skip' : 'fail'}`,
          value: 1,
          tags: [`suite:${suiteTag}`, ...tags],
          type: 'count'
        });
      }

      if (test.retry > 0) {
        metrics.push({ name: 'retry', value: test.retry, tags, type: 'count' });
      }
    }

    await sendMetrics(metrics);

    for (const failedTest of failedTests) {
      await sendEvent(
        `Test ${failedTest.status}: ${failedTest.title}`,
        [
          `Suite: ${failedTest.suite}`,
          `File: ${failedTest.file}`,
          `Browser/project: ${failedTest.browser}`,
          `Retry: ${failedTest.retry}`,
          `Duration: ${failedTest.duration}ms`
        ].join('\n'),
        this.testTags(failedTest),
        'error'
      );
    }

    await sendEvent(
      `Playwright Suite ${result.status}`,
      [
        `Status: ${result.status}`,
        `Total: ${tests.length}`,
        `Passed: ${passedTests.length}`,
        `Failed: ${failedTests.length}`,
        `Skipped: ${skippedTests.length}`,
        `Retries: ${retriedTests.length}`,
        `Pass rate: ${passRate.toFixed(2)}%`,
        `Failure rate: ${failureRate.toFixed(2)}%`,
        `Retry rate: ${retryRate.toFixed(2)}%`,
        `Duration: ${runDuration}ms`
      ].join('\n'),
      [`event:suite_completed`, `status:${result.status}`],
      result.status === 'passed' ? 'success' : 'error'
    );
  }

  private testTags(test: TestTelemetry): string[] {
    return [
      `suite:${test.suite}`,
      `module:${this.moduleFromFile(test.file)}`,
      `feature:${this.featureFromProject(test.project)}`,
      `browser:${test.browser}`,
      `project:${test.project}`,
      `status:${test.status}`,
      `retry:${test.retry}`,
      `test_name:${test.title}`,
      ...this.classifyTags(test.tags)
    ];
  }

  private classifyTags(tags: string[]): string[] {
    return tags.map((tag) => {
      if (['smoke', 'regression', 'negative'].includes(tag)) {
        return `suite:${tag}`;
      }

      if (['api', 'ui', 'accessibility'].includes(tag)) {
        return `feature:${tag === 'accessibility' ? 'a11y' : tag}`;
      }

      if (['critical', 'high', 'medium'].includes(tag)) {
        return `priority:${tag}`;
      }

      return `module:${tag}`;
    });
  }

  private suiteTags(test: TestTelemetry): string[] {
    const suites = test.tags.filter((tag) => ['smoke', 'regression', 'negative'].includes(tag));
    return suites.length > 0 ? suites : [normalizeTagValue(test.suite)];
  }

  private extractTags(test: TestCase): string[] {
    const titleTags = test.title.match(/@\w[\w-]*/g) || [];
    const nativeTags = ((test as unknown as { tags?: string[] }).tags || []).map((tag) => tag.replace(/^@/, ''));
    return [...new Set([...titleTags.map((tag) => tag.slice(1)), ...nativeTags])];
  }

  private moduleFromFile(file: string): string {
    if (file.includes('/api/')) {
      return 'api';
    }

    if (file.includes('/accessibility/')) {
      return 'accessibility';
    }

    if (file.includes('/ui/')) {
      return 'ui';
    }

    return 'unknown';
  }

  private featureFromProject(project: string): string {
    if (project.includes('api')) {
      return 'api';
    }

    if (project.includes('accessibility')) {
      return 'a11y';
    }

    return 'ui';
  }

  private featureMetricPrefix(test: TestTelemetry): string {
    const feature = this.featureFromProject(test.project);
    return feature === 'accessibility' ? 'a11y' : normalizeTagValue(feature);
  }
}
