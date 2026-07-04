import { client, v1, v2 } from '@datadog/datadog-api-client';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const site = process.env.DD_SITE || 'datadoghq.com';
const apiKey = process.env.DD_API_KEY || process.env.DATADOG_API_KEY;
const env = process.env.DD_ENV || 'local';
const service = process.env.DD_SERVICE || 'velir-qa-framework';
const version = process.env.DD_VERSION || '1.0.0';
const prefix = process.env.DD_METRIC_PREFIX || 'qa';
const timestamp = Math.floor(Date.now() / 1000);
const tags = [
  `env:${env}`,
  `service:${service}`,
  `version:${version}`,
  'framework:playwright',
  'repo:velir',
  'suite:smoke',
  'suite:regression',
  'feature:datadog',
  'module:observability',
  'browser:synthetic',
  'test_name:datadog_smoke'
];

if (!apiKey) {
  throw new Error('Missing DD_API_KEY or DATADOG_API_KEY.');
}

const configuration = client.createConfiguration({
  authMethods: {
    apiKeyAuth: apiKey
  },
  enableRetry: true
});

configuration.setServerVariables({ site });

const metricsApi = new v2.MetricsApi(configuration);
const eventsApi = new v1.EventsApi(configuration);

await metricsApi.submitMetrics({
  body: {
    series: [
      {
        metric: `${prefix}.test.pass`,
        type: 1,
        points: [{ timestamp, value: 1 }],
        tags,
        sourceTypeName: 'playwright'
      },
      {
        metric: `${prefix}.test.fail`,
        type: 1,
        points: [{ timestamp, value: 0 }],
        tags,
        sourceTypeName: 'playwright'
      },
      {
        metric: `${prefix}.test.total`,
        type: 1,
        points: [{ timestamp, value: 1 }],
        tags: ['status:all', ...tags],
        sourceTypeName: 'playwright'
      },
      {
        metric: `${prefix}.test.pass_rate`,
        type: 3,
        points: [{ timestamp, value: 100 }],
        tags,
        sourceTypeName: 'playwright'
      },
      {
        metric: `${prefix}.test.failure_rate`,
        type: 3,
        points: [{ timestamp, value: 0 }],
        tags,
        sourceTypeName: 'playwright'
      },
      {
        metric: `${prefix}.test.retry_rate`,
        type: 3,
        points: [{ timestamp, value: 0 }],
        tags,
        sourceTypeName: 'playwright'
      },
      {
        metric: `${prefix}.build.status`,
        type: 3,
        points: [{ timestamp, value: 1 }],
        tags: ['status:passed', ...tags],
        sourceTypeName: 'playwright'
      },
      {
        metric: `${prefix}.ci.duration`,
        type: 3,
        points: [{ timestamp, value: 250 }],
        tags,
        sourceTypeName: 'playwright'
      },
      {
        metric: `${prefix}.suite.total`,
        type: 1,
        points: [{ timestamp, value: 1 }],
        tags: ['status:all', ...tags],
        sourceTypeName: 'playwright'
      },
      {
        metric: `${prefix}.suite.pass`,
        type: 1,
        points: [{ timestamp, value: 1 }],
        tags,
        sourceTypeName: 'playwright'
      },
      {
        metric: `${prefix}.test.duration`,
        type: 3,
        points: [{ timestamp, value: 250 }],
        tags: ['test_name:datadog_smoke', 'unit:millisecond', ...tags],
        sourceTypeName: 'playwright'
      },
      {
        metric: `${prefix}.api.duration`,
        type: 3,
        points: [{ timestamp, value: 125 }],
        tags: ['endpoint:datadog_smoke', 'method:get', 'unit:millisecond', ...tags],
        sourceTypeName: 'playwright'
      },
      {
        metric: `${prefix}.accessibility.score`,
        type: 3,
        points: [{ timestamp, value: 100 }],
        tags,
        sourceTypeName: 'playwright'
      },
      {
        metric: `${prefix}.accessibility.critical_violations`,
        type: 3,
        points: [{ timestamp, value: 0 }],
        tags,
        sourceTypeName: 'playwright'
      },
      {
        metric: `${prefix}.accessibility.wcag_failures`,
        type: 3,
        points: [{ timestamp, value: 0 }],
        tags,
        sourceTypeName: 'playwright'
      }
    ]
  }
});

await eventsApi.createEvent({
  body: {
    title: 'Playwright Datadog Smoke Event',
    text: `Smoke telemetry sent for ${service} in ${env}.`,
    alertType: 'success',
    sourceTypeName: 'playwright',
    tags,
    aggregationKey: `${service}-${env}`,
    dateHappened: timestamp
  }
});

console.log(`Sent Datadog smoke metrics and event to ${site}.`);
console.log(`Dashboard filters should be env:${env} and service:${service}.`);
