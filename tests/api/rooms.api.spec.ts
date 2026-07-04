import { test } from '../../fixtures/test-fixtures';
import { Module, Priority, TestCategory } from '../../utils/test-metadata';

/**
 * ============================================================================
 * Module      : Rooms
 * Feature     : Room API Contract
 * Test Type   : API | Contract | Negative
 * Priority    : High
 * Purpose     : Verify that room inventory and availability APIs return usable
 *               data, and that invalid booking requests are rejected safely.
 * ============================================================================
 */

test.describe('Rooms | API Contract Validation', () => {

  test(
    'API should return valid room inventory data',
    {
      tag: [
        TestCategory.Smoke,
        TestCategory.Regression,
        TestCategory.Api,
        Module.Rooms,
        Priority.P1
      ]
    },
    async ({ apiClient }) => {
      await test.step('Client requests room inventory', () => apiClient.requestRoomInventory());
      await test.step('Application returns valid room contract fields', () => apiClient.expectLatestRoomResponseContractIsValid());
    }
  );

  test(
    'API should return available rooms for a future stay',
    {
      tag: [
        TestCategory.Regression,
        TestCategory.Api,
        Module.Rooms,
        Priority.P1
      ]
    },
    async ({ apiClient }) => {
      await test.step('Client requests availability for a future date range', () => apiClient.requestFutureRoomAvailability());
      await test.step('Application returns valid available room data', () => apiClient.expectLatestRoomResponseContractIsValid());
    }
  );

  test(
    'API should reject invalid booking requests with validation errors',
    {
      tag: [
        TestCategory.Regression,
        TestCategory.Api,
        TestCategory.Negative,
        Module.Booking,
        Priority.P1
      ]
    },
    async ({ apiClient }) => {
      await test.step('Client submits an invalid booking request', () => apiClient.submitInvalidBookingRequest());
      await test.step('Application returns booking validation errors', () => apiClient.expectLatestBookingRequestRejectedWithValidationErrors());
    }
  );

});
