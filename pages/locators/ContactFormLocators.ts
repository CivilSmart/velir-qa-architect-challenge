import { Page } from '@playwright/test';

export const contactFormLocators = {
  headings: {
    form: (page: Page) => page.getByRole('heading', { name: 'Send Us a Message' })
  },
  actions: {
    submit: (page: Page) => page.getByRole('button', { name: 'Submit' })
  },
  validationMessages: {
    emailRequired: (page: Page) => page.getByText('Email may not be blank'),
    nameRequired: (page: Page) => page.getByText('Name may not be blank')
  }
} as const;
