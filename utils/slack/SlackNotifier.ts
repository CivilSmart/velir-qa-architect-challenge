import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export type SlackTestSummary = {
  status: string;
  total: number;
  expected: number;
  passed: number;
  failed: number;
  skipped: number;
  retries: number;
  passRate: number;
  failureRate: number;
  retryRate: number;
  durationMs: number;
  failedTests: Array<{
    title: string;
    suite: string;
    file: string;
    project: string;
    retry: number;
    duration: number;
  }>;
};

export async function sendSlackTestSummary(summary: SlackTestSummary): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('[slack] SLACK_WEBHOOK_URL is not configured; skipping Slack notification.');
    return;
  }

  const payload = buildPayload(summary);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn(`[slack] failed to send notification: HTTP ${response.status} ${await response.text()}`);
      return;
    }

    console.log('[slack] notification sent.');
  } catch (error) {
    console.warn(`[slack] failed to send notification: ${String(error)}`);
  }
}

function buildPayload(summary: SlackTestSummary): Record<string, unknown> {
  const status = summary.status.toUpperCase();
  const passed = status === 'PASSED';
  const title = `${passed ? ':white_check_mark:' : ':x:'} Playwright Suite ${status}`;
  const buildUrl = process.env.CIRCLE_BUILD_URL;
  const artifactsUrl = buildUrl ? `${buildUrl}#artifacts/containers/0` : undefined;
  const table = [
    row('Status', status),
    row('Project', process.env.CIRCLE_PROJECT_REPONAME || 'velir-qa-framework'),
    row('Branch', process.env.CIRCLE_BRANCH || 'local'),
    row('Job', process.env.CIRCLE_JOB || 'local'),
    row('Commit', process.env.CIRCLE_SHA1?.slice(0, 7) || 'local'),
    row('Triggered By', process.env.CIRCLE_USERNAME || process.env.USERNAME || 'local'),
    row('Expected', summary.expected),
    row('Total', summary.total),
    row('Passed', summary.passed),
    row('Failed', summary.failed),
    row('Skipped', summary.skipped),
    row('Retries', summary.retries),
    row('Pass Rate', `${summary.passRate.toFixed(2)}%`),
    row('Failure Rate', `${summary.failureRate.toFixed(2)}%`),
    row('Retry Rate', `${summary.retryRate.toFixed(2)}%`),
    row('Duration', formatDuration(summary.durationMs))
  ].join('\n');
  const failedTests = summary.failedTests.slice(0, 5);
  const failedTestsText =
    failedTests.length > 0
      ? `\n*Failed tests:*\n${failedTests
          .map((test) => `- ${escapeSlack(test.title)} (${escapeSlack(test.project)}, retry ${test.retry}, ${formatDuration(test.duration)})`)
          .join('\n')}`
      : '';
  const linksText = [
    buildUrl ? `*Build:* <${buildUrl}|Open CircleCI job>` : undefined,
    artifactsUrl ? `*Artifacts:* <${artifactsUrl}|Playwright report, traces, screenshots, videos>` : undefined
  ]
    .filter(Boolean)
    .join('\n');

  return {
    text: `Playwright Suite ${status}`,
    attachments: [
      {
        color: passed ? '#2eb67d' : '#e01e5a',
        fallback: `Playwright Suite ${status}`,
        title,
        title_link: buildUrl,
        text: [`*High-level result summary*`, `\`\`\`${escapeSlack(table)}\`\`\``, linksText, failedTestsText].filter(Boolean).join('\n'),
        mrkdwn_in: ['text'],
        footer: `Workflow: ${process.env.CIRCLE_WORKFLOW_ID || 'local'}`
      }
    ]
  };
}

function row(label: string, detail: string | number): string {
  return `${label.padEnd(14)} ${detail}`;
}

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) {
    return '0s';
  }

  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function escapeSlack(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
