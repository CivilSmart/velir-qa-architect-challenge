import { expect, Locator, Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async expectLoaded(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  url(): string {
    return this.page.url();
  }
}
