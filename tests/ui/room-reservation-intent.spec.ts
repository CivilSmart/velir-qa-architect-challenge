import { test } from '../../fixtures/test-fixtures';
import { Module, Priority, TestCategory } from '../../utils/test-metadata';

/**
 * ============================================================================
 * Module      : Booking
 * Feature     : Room Availability and Reservation Intent
 * Test Type   : UI | Functional | Smoke
 * Priority    : High
 * Purpose     : Verify that a guest can discover available rooms and continue
 *               into the reservation journey without creating shared test data.
 * ============================================================================
 */

test.describe('Booking | Room Availability and Reservation Intent', () => {

  test(
    'Guest should be able to check room availability and continue to reservation intent',
    {
      tag: [
        TestCategory.Smoke,
        TestCategory.Regression,
        TestCategory.Ui,
        Module.Booking,
        Module.Rooms,
        Priority.P1
      ]
    },
    async ({ homePage, reservationPage }) => {
      await test.step('Guest navigates to the booking home page', () => homePage.open());
      await test.step('Application displays available room inventory', () => homePage.expectRoomInventoryVisible());
      await test.step('Guest checks room availability', () => homePage.checkAvailability());
      await test.step('Guest selects the first available room', () => homePage.openFirstRoomReservation());
      await test.step('Application opens the reservation page', () => homePage.expectReservationPageOpened());
      await test.step('Guest can review reservation intent details', () => reservationPage.expectReservationIntentReady());
    }
  );

});
