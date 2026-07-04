export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://automationintesting.online',
  ci: process.env.CI === 'true'
} as const;
