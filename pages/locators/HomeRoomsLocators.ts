import { Page } from '@playwright/test';

export const homeRoomsLocators = {
  headings: {
    rooms: (page: Page) => page.getByRole('heading', { name: 'Our Rooms' })
  },
  actions: {
    checkAvailability: (page: Page) => page.getByRole('button', { name: 'Check Availability' }),
    bookRoom: (page: Page) => page.locator('#rooms').getByRole('link', { name: 'Book now', exact: true })
  },
  sections: {
    roomCards: (page: Page) => page.locator('#rooms .card')
  }
} as const;
