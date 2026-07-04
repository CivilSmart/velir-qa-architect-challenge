import { v2 } from '@datadog/datadog-api-client';
import { DatadogClient } from './DatadogClient';

export type MetricType = 'count' | 'gauge' | 'rate';

const metricPrefix = process.env.DD_METRIC_PREFIX || 'qa';

function metricName(name: string): string {
  return name.startsWith(`${metricPrefix}.`) ? name : `${metricPrefix}.${name}`;
}

function metricType(type: MetricType): v2.MetricIntakeType {
  if (type === 'count') {
    return 1;
  }

  if (type === 'rate') {
    return 2;
  }

  return 3;
}

export function baseTags(extraTags: string[] = []): string[] {
  const datadog = DatadogClient.getInstance();

  return [
    `env:${normalizeTagValue(datadog.env)}`,
    `service:${normalizeTagValue(datadog.service)}`,
    `version:${normalizeTagValue(datadog.version)}`,
    'framework:playwright',
    'repo:velir',
    ...extraTags.map(normalizeTag)
  ];
}

export async function sendMetric(metric: string, value: number, tags: string[] = [], type: MetricType = 'gauge'): Promise<void> {
  const datadog = DatadogClient.getInstance();
  const body: v2.MetricPayload = {
    series: [
      {
        metric: metricName(metric),
        type: metricType(type),
        points: [
          {
            timestamp: Math.floor(Date.now() / 1000),
            value
          }
        ],
        tags: baseTags(tags),
        sourceTypeName: 'playwright'
      }
    ]
  };

  if (datadog.dryRun) {
    console.log(`[datadog:metric] ${metricName(metric)}=${value} ${baseTags(tags).join(',')}`);
    return;
  }

  if (!datadog.canSendTelemetry()) {
    return;
  }

  try {
    await datadog.metricsApi.submitMetrics({ body });
  } catch (error) {
    console.warn(`[datadog:metric] failed to send ${metricName(metric)}: ${String(error)}`);
  }
}

export async function sendMetrics(series: Array<{ name: string; value: number; tags?: string[]; type?: MetricType }>): Promise<void> {
  const datadog = DatadogClient.getInstance();
  const timestamp = Math.floor(Date.now() / 1000);
  const body: v2.MetricPayload = {
    series: series.map((metric) => ({
      metric: metricName(metric.name),
      type: metricType(metric.type || 'gauge'),
      points: [{ timestamp, value: metric.value }],
      tags: baseTags(metric.tags || []),
      sourceTypeName: 'playwright'
    }))
  };

  if (datadog.dryRun) {
    console.log(`[datadog:metrics] prepared ${body.series.length} metric series`);
    return;
  }

  if (!datadog.canSendTelemetry() || body.series.length === 0) {
    return;
  }

  try {
    await datadog.metricsApi.submitMetrics({ body });
  } catch (error) {
    console.warn(`[datadog:metrics] failed to send ${body.series.length} metrics: ${String(error)}`);
  }
}

export function incrementCounter(metric: string, tags: string[] = []): Promise<void> {
  return sendMetric(metric, 1, tags, 'count');
}

export function recordDuration(metric: string, durationMs: number, tags: string[] = []): Promise<void> {
  return sendMetric(metric, durationMs, [...tags, 'unit:millisecond'], 'gauge');
}

export function recordGauge(metric: string, value: number, tags: string[] = []): Promise<void> {
  return sendMetric(metric, value, tags, 'gauge');
}

export function normalizeTag(tag: string): string {
  const [key, ...valueParts] = tag.split(':');
  const value = valueParts.join(':');

  if (!value) {
    return normalizeTagValue(key);
  }

  return `${normalizeTagValue(key)}:${normalizeTagValue(value)}`;
}

export function normalizeTagValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/\\/g, '/')
    .replace(/[^a-z0-9_.:/-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 200);
}
