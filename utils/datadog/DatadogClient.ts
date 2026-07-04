import { client, v1, v2 } from '@datadog/datadog-api-client';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export class DatadogClient {
  private static instance: DatadogClient | undefined;

  readonly metricsApi: v2.MetricsApi;
  readonly eventsApi: v1.EventsApi;
  readonly service: string;
  readonly env: string;
  readonly version: string;
  readonly site: string;
  readonly dryRun: boolean;

  private constructor() {
    this.service = process.env.DD_SERVICE || 'velir-qa-framework';
    this.env = process.env.DD_ENV || process.env.NODE_ENV || 'local';
    this.version = process.env.DD_VERSION || '1.0.0';
    this.site = process.env.DD_SITE || 'datadoghq.com';
    this.dryRun = process.env.DD_DRY_RUN === '1';

    const configuration = client.createConfiguration({
      authMethods: {
        apiKeyAuth: process.env.DD_API_KEY || process.env.DATADOG_API_KEY
      },
      enableRetry: true
    });

    configuration.setServerVariables({
      site: this.site
    });

    this.metricsApi = new v2.MetricsApi(configuration);
    this.eventsApi = new v1.EventsApi(configuration);
  }

  static getInstance(): DatadogClient {
    DatadogClient.instance ??= new DatadogClient();
    return DatadogClient.instance;
  }

  canSendTelemetry(): boolean {
    return Boolean(process.env.DD_API_KEY || process.env.DATADOG_API_KEY);
  }
}
