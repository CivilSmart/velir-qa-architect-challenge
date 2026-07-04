import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ReservationPage extends BasePage {
  readonly bookThisRoomHeading: Locator;
  readonly reserveNowButton: Locator;

  constructor(page: Page) {
    super(page);
    this.bookThisRoomHeading = page.getByRole('heading', { name: 'Book This Room' });
    this.reserveNowButton = page.getByRole('button', { name: 'Reserve Now' });
  }

  async expectReservationIntentReady(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /Room$/ })).toBeVisible();
    await expect(this.bookThisRoomHeading).toBeVisible();
    await expect(this.reserveNowButton.first()).toBeVisible();
  }

  async attemptReservationWithoutGuestDetails(): Promise<void> {
    await this.reserveNowButton.first().click();
    await expect(this.page.getByText(/Firstname should not be blank|Lastname should not be blank/)).toBeVisible();
  }
}
