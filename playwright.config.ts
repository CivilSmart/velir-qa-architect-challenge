import { defineConfig, devices } from '@playwright/test';
import { env } from './utils/env';

const isListingTests = process.argv.includes('--list');

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ...(process.env.CI ? [['junit', { outputFile: 'test-results/junit.xml' }] as const] : []),
    ...(!isListingTests ? [
      ['./reporters/DatadogReporter.ts'],
      ['./reporters/SlackReporter.ts']
    ] as const : [])
  ],
  use: {
    baseURL: env.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 30_000,
    actionTimeout: 15_000
  },
  projects: [
    {
      name: 'chromium',
      testMatch: '**/ui/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'api',
      testMatch: '**/api/**/*.spec.ts'
    },
    {
      name: 'accessibility',
      testMatch: '**/accessibility/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
