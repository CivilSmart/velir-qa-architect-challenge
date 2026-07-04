import { test } from '../../fixtures/test-fixtures';
import { Module, Priority, TestCategory } from '../../utils/test-metadata';

/**
 * ============================================================================
 * Module      : Contact Us
 * Feature     : Contact Form Validation
 * Test Type   : UI | Functional | Negative
 * Priority    : High
 * Purpose     : Verify that the application prevents users from submitting
 *               the Contact Us form when mandatory information is missing
 *               and displays meaningful validation messages.
 * ============================================================================
 */

test.describe('Contact Us | Mandatory Field Validation', () => {

  test(
    'Guest should be prevented from submitting the Contact Us form when mandatory information is missing',
    {
      tag: [
        TestCategory.Smoke,
        TestCategory.Regression,
        TestCategory.Ui,
        TestCategory.Negative,
        Module.Contact,
        Priority.P1
      ]
    },
    async ({ homePage }) => {
      await test.step('Guest navigates to the Contact Us section', () => homePage.openContactForm());
      await test.step('Guest attempts to submit the Contact Us form', () => homePage.submitEmptyContactForm());
      await test.step('Application validates mandatory fields', async () => {
        await test.step('Email is required', () => homePage.expectContactEmailRequiredValidation());
        await test.step('Name is required', () => homePage.expectContactNameRequiredValidation());
      });
      await test.step('Guest is prevented from submitting incomplete information', () => homePage.expectContactFormSubmissionBlocked());
    }
  );

});
