import { format } from 'date-fns';
import { test, expect, Page } from '@playwright/test';

// Start with clean state (no cookies or storage)
test.use({ storageState: { cookies: [], origins: [] } });

// Generate unique credentials for testing
const testEmail = `test-${format(new Date(), 'yyyyMMddHHmmss')}@playwright.com`;
const testPassword = 'Password123!';

class AuthPage {
  constructor(private page: Page) {}

  async gotoLogin() {
    await this.page.goto('/login');
    await expect(this.page.getByRole('heading')).toContainText('Sign In');
  }

  async gotoRegister() {
    await this.page.goto('/register');
    await expect(this.page.getByRole('heading')).toContainText('Sign Up');
  }

  async register(email: string, password: string) {
    await this.gotoRegister();
    await this.page.getByLabel('Email Address').click();
    await this.page.getByLabel('Email Address').fill(email);
    await this.page.getByLabel('Password').click();
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign Up' }).click();
  }

  async login(email: string, password: string) {
    await this.gotoLogin();
    await this.page.getByLabel('Email Address').click();
    await this.page.getByLabel('Email Address').fill(email);
    await this.page.getByLabel('Password').click();
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }

  async expectToastToContain(text: string) {
    await expect(this.page.locator('[data-sonner-toast]')).toContainText(text, { timeout: 10000 });
  }
}

test.describe.serial('Authentication Flow', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
  });

  test('should redirect unauthenticated users to login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('should allow user to view register page', async ({ page }) => {
    await authPage.gotoRegister();
    await expect(page.getByRole('heading')).toContainText('Sign Up');
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });

  test('should allow user to view login page', async ({ page }) => {
    await authPage.gotoLogin();
    await expect(page.getByRole('heading')).toContainText('Sign In');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should register a new account', async ({ page }) => {
    await authPage.register(testEmail, testPassword);
    await authPage.expectToastToContain('Account created successfully!');
    // Should redirect to dashboard
    await expect(page.getByRole('heading', { name: 'Signed In', level: 3 })).toBeVisible({ timeout: 10000 });
  });

  test('should not register with an existing email', async () => {
    await authPage.register(testEmail, testPassword);
    await authPage.expectToastToContain('Account already exists!');
  });

  test('should not login with incorrect credentials', async () => {
    await authPage.login('wrong@example.com', 'wrongpassword');
    await authPage.expectToastToContain('Invalid credentials!');
  });

  test('should login with correct credentials', async ({ page }) => {
    await authPage.login(testEmail, testPassword);
    // Should redirect to dashboard
    await expect(page.getByRole('heading', { name: 'Signed In', level: 3 })).toBeVisible({ timeout: 10000 });
  });

  test('should allow user to sign out', async ({ page }) => {
    // Login first
    await authPage.login(testEmail, testPassword);
    await expect(page.getByRole('heading', { name: 'Signed In', level: 3 })).toBeVisible({ timeout: 10000 });
    
    // Click sign out button
    await page.getByRole('button', { name: 'Sign out' }).click();
    
    // Should show login page (verify by checking for the login heading)
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    
    // Now that we've fixed the redirect URL, also check the URL
    await expect(page).toHaveURL(/.*login.*/);
  });
}); 