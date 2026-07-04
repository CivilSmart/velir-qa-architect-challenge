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
  const datadogDashboardUrl = 'https://us5.datadoghq.com/dashboard/sii-vp6-jdc/velir-qa-automation';
  const project = process.env.CIRCLE_PROJECT_REPONAME || 'velir-qa-framework';
  const branch = process.env.CIRCLE_BRANCH || 'local';
  const job = process.env.CIRCLE_JOB || 'local';
  const commit = process.env.CIRCLE_SHA1?.slice(0, 7) || 'local';
  const triggeredBy = process.env.CIRCLE_USERNAME || process.env.USERNAME || 'local';
  const summaryLine = `*${summary.passed}/${summary.total} passed* | *${summary.failed} failed* | *${summary.skipped} skipped*`;

  return {
    text: `Playwright Suite ${status}`,
    attachments: [
      {
        color: passed ? '#2eb67d' : '#e01e5a',
        fallback: `Playwright Suite ${status}`,
        title,
        title_link: buildUrl,
        text: summaryLine,
        fields: [
          field('Status', status),
          field('Duration', formatDuration(summary.durationMs)),
          field('Total Tests', summary.total),
          field('Passed', summary.passed),
          field('Failed', summary.failed),
          field('Skipped', summary.skipped),
          field('Job', job),
          field('Project', project),
          field('Branch', branch),
          field('Commit', commit),
          field('Triggered By', triggeredBy),
          field('Datadog Report', `<${datadogDashboardUrl}|Open Dashboard>`),
          field('CircleCI Artifacts', artifactsUrl ? `<${artifactsUrl}|Open Artifacts>` : 'n/a')
        ],
        mrkdwn_in: ['text', 'fields'],
        footer: `Workflow: ${process.env.CIRCLE_WORKFLOW_ID || 'local'}`
      }
    ]
  };
}

function field(title: string, value: string | number): Record<string, string | boolean> {
  return {
    title,
    value: String(value),
    short: true
  };
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
