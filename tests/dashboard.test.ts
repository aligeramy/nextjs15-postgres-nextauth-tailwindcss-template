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
    // Check that we're on the dashboard page by looking for the h1 in the header
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
    // Also verify the welcome heading is visible
    await expect(page.getByRole('heading', { name: 'Welcome to your Dashboard' })).toBeVisible();
  });

  test('should display user email in the dashboard', async ({ page }) => {
    // Dashboard should show the logged-in user's email in the profile section
    // Target the span inside the profile section to be more specific
    await expect(page.locator('.bg-blue-50 span.font-medium')).toBeVisible();
    // Also check that it contains the playwright.com domain
    await expect(page.locator('.bg-blue-50 span.font-medium')).toContainText('@playwright.com');
  });

  test('should navigate to profile section', async ({ page }) => {
    // Check that profile section is visible
    await expect(page.getByText('Your Profile')).toBeVisible();
  });

  test('should have sign out button', async ({ page }) => {
    // Check that sign out button is available
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  });
}); 