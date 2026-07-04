import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { contactFormLocators, homeRoomsLocators } from './locators';

export class HomePage extends BasePage {
  readonly roomsHeading: Locator;
  readonly checkAvailabilityButton: Locator;

  constructor(page: Page) {
    super(page);
    this.roomsHeading = homeRoomsLocators.headings.rooms(page);
    this.checkAvailabilityButton = homeRoomsLocators.actions.checkAvailability(page);
  }

  async open(): Promise<void> {
    await this.goto('/');
    await this.expectLoaded(this.roomsHeading);
  }

  async expectRoomInventoryVisible(): Promise<void> {
    await expect(this.roomsHeading).toBeVisible();
    await expect(this.checkAvailabilityButton).toBeVisible();
  }

  async openFirstRoomReservation(): Promise<void> {
    await homeRoomsLocators.actions.bookRoom(this.page).first().click();
  }

  async expectReservationPageOpened(): Promise<void> {
    await expect.poll(async () => this.url()).toContain('/reservation/');
  }

  async checkAvailability(): Promise<void> {
    const availabilityResponse = this.page.waitForResponse((response) =>
      response.url().includes('/api/room?checkin=') && response.status() === 200
    );

    await this.checkAvailabilityButton.click();
    await availabilityResponse;
    await expect(homeRoomsLocators.actions.bookRoom(this.page).first()).toBeVisible();
  }

  async openContactForm(): Promise<void> {
    await this.goto('/#contact');
    await contactFormLocators.headings.form(this.page).scrollIntoViewIfNeeded();
    await expect(contactFormLocators.headings.form(this.page)).toBeVisible();
  }

  async submitEmptyContactForm(): Promise<void> {
    await contactFormLocators.actions.submit(this.page).click();
  }

  async expectRequiredContactValidationMessages(): Promise<void> {
    await this.expectContactEmailRequiredValidation();
    await this.expectContactNameRequiredValidation();
  }

  async expectContactEmailRequiredValidation(): Promise<void> {
    await expect(contactFormLocators.validationMessages.emailRequired(this.page)).toBeVisible();
  }

  async expectContactNameRequiredValidation(): Promise<void> {
    await expect(contactFormLocators.validationMessages.nameRequired(this.page)).toBeVisible();
  }

  async expectContactFormSubmissionBlocked(): Promise<void> {
    await expect(contactFormLocators.headings.form(this.page)).toBeVisible();
    await expect(contactFormLocators.actions.submit(this.page)).toBeVisible();
  }
}
