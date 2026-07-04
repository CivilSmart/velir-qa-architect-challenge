export const TestCategory = {
  Smoke: '@smoke',
  Regression: '@regression',
  Api: '@api',
  Ui: '@ui',
  Accessibility: '@accessibility',
  Negative: '@negative'
} as const;

export const Module = {
  Contact: '@contact',
  Booking: '@booking',
  Rooms: '@rooms',
  Accessibility: '@accessibility'
} as const;

export const Priority = {
  P0: '@critical',
  P1: '@high'
} as const;
