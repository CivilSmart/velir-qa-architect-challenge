import { v1 } from '@datadog/datadog-api-client';
import { DatadogClient } from './DatadogClient';
import { baseTags } from './Metrics';

export type DatadogEventAlertType = 'error' | 'warning' | 'info' | 'success';

export async function sendEvent(
  title: string,
  text: string,
  tags: string[] = [],
  alertType: DatadogEventAlertType = 'info'
): Promise<void> {
  const datadog = DatadogClient.getInstance();
  const body: v1.EventCreateRequest = {
    title,
    text,
    alertType,
    sourceTypeName: 'playwright',
    tags: baseTags(tags),
    aggregationKey: `${datadog.service}-${datadog.env}`,
    dateHappened: Math.floor(Date.now() / 1000)
  };

  if (datadog.dryRun) {
    console.log(`[datadog:event] ${alertType} ${title}`);
    return;
  }

  if (!datadog.canSendTelemetry()) {
    return;
  }

  try {
    await datadog.eventsApi.createEvent({ body });
  } catch (error) {
    console.warn(`[datadog:event] failed to send "${title}": ${String(error)}`);
  }
}
