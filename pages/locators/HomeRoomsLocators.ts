import { Page } from '@playwright/test';

export const homeRoomsLocators = {
  headings: {
    rooms: (page: Page) => page.getByRole('heading', { name: 'Our Rooms' })
  },
  actions: {
    checkAvailability: (page: Page) => page.getByRole('button', { name: 'Check Availability' }),
    bookRoom: (page: Page) => page.getByRole('link', { name: 'Book now' })
  },
  sections: {
    roomCards: (page: Page) => page.locator('#rooms .card')
  }
} as const;
