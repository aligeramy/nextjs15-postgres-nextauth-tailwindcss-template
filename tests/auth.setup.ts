import path from 'path';
import { format } from 'date-fns';
import { expect, test as setup } from '@playwright/test';

const authFile = path.join(process.cwd(), 'playwright/.auth/session.json');

setup('authenticate', async ({ page }) => {
  // Generate unique email using timestamp for testing
  const testEmail = `test-${format(new Date(), 'yyyyMMddHHmmss')}@playwright.com`;
  const testPassword = 'Password123!';

  // Create a new account
  await page.goto('/register');
  await page.getByLabel('Email Address').click();
  await page.getByLabel('Email Address').fill(testEmail);
  await page.getByLabel('Password').click();
  await page.getByLabel('Password').fill(testPassword);
  await page.getByRole('button', { name: 'Sign Up' }).click();

  // Verify toast notification
  await expect(page.locator('[data-sonner-toast]')).toContainText(
    'Account created successfully!'
  );

  // Save authentication state to be used in other tests
  await page.context().storageState({ path: authFile });
}); 