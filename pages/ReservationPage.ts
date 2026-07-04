import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ReservationPage extends BasePage {
  readonly roomTitleHeading: Locator;
  readonly bookThisRoomHeading: Locator;
  readonly reserveNowButton: Locator;

  constructor(page: Page) {
    super(page);
    this.roomTitleHeading = page.getByRole('heading', { name: /^(Single|Double|Twin|Family|Suite) Room$/ });
    this.bookThisRoomHeading = page.getByRole('heading', { name: 'Book This Room' });
    this.reserveNowButton = page.getByRole('button', { name: 'Reserve Now' });
  }

  async expectReservationIntentReady(): Promise<void> {
    await expect(this.roomTitleHeading).toBeVisible();
    await expect(this.bookThisRoomHeading).toBeVisible();
    await expect(this.reserveNowButton.first()).toBeVisible();
  }
}
