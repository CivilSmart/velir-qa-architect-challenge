import { test } from '../../fixtures/test-fixtures';
import { Module, Priority, TestCategory } from '../../utils/test-metadata';

/**
 * ============================================================================
 * Module      : Accessibility
 * Feature     : Home Page Accessibility Smoke
 * Test Type   : UI | Accessibility | Smoke
 * Priority    : Critical
 * Purpose     : Verify that the home page does not contain critical automated
 *               accessibility violations after primary content has loaded.
 * ============================================================================
 */

test.describe('Accessibility | Home Page Smoke Validation', () => {

  test(
    'Home page should not contain critical accessibility violations',
    {
      tag: [
        TestCategory.Smoke,
        TestCategory.Regression,
        TestCategory.Accessibility,
        Module.Accessibility,
        Priority.P0
      ]
    },
    async ({ homePage, accessibilityScanner }) => {
      await test.step('Guest navigates to the booking home page', () => homePage.open());
      await test.step('Application loads primary room content', () => homePage.expectRoomInventoryVisible());
      await test.step('Application is scanned for critical accessibility violations', () => accessibilityScanner.expectNoCriticalAccessibilityViolations());
    }
  );

});
