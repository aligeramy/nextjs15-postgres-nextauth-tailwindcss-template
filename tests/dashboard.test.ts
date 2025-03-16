import path from 'path';
import { test, expect } from '@playwright/test';

// Use the authenticated session from the setup
const authFile = path.join(process.cwd(), 'playwright/.auth/session.json');
test.use({ storageState: authFile });

test.describe('Dashboard (Authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the root URL which should redirect to dashboard when authenticated
    await page.goto('/');
  });

  test('should display dashboard when user is authenticated', async ({ page }) => {
    // Check that we're on the dashboard page by looking for the heading
    await expect(page.getByRole('heading', { name: 'Signed In', level: 3 })).toBeVisible({ timeout: 10000 });
  });

  test('should display user email in the dashboard', async ({ page }) => {
    // Dashboard should show the logged-in user's email
    const emailElement = page.getByText(/@playwright.com/);
    await expect(emailElement).toBeVisible();
  });

  test('should have theme toggle button', async ({ page }) => {
    // Check that the theme toggle button is available
    await expect(page.getByRole('button', { name: 'Toggle theme' })).toBeVisible();
  });

  test('should have sign out button', async ({ page }) => {
    // Check that sign out button is available
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  });
}); 