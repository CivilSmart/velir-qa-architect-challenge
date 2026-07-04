import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ReservationPage } from '../pages/ReservationPage';
import { AccessibilityScanner } from '../utils/accessibilityScanner';
import { ApiClient } from '../utils/apiClient';

type Fixtures = {
  homePage: HomePage;
  reservationPage: ReservationPage;
  apiClient: ApiClient;
  accessibilityScanner: AccessibilityScanner;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  reservationPage: async ({ page }, use) => {
    await use(new ReservationPage(page));
  },
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
  accessibilityScanner: async ({ page }, use) => {
    await use(new AccessibilityScanner(page));
  }
});

export { expect } from '@playwright/test';
