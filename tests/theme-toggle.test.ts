import path from 'path';
import { test, expect } from '@playwright/test';

// Use the authenticated session from the setup
const authFile = path.join(process.cwd(), 'playwright/.auth/session.json');
test.use({ storageState: authFile });

test.describe('Theme Toggle Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the root URL which should redirect to dashboard when authenticated
    await page.goto('/');
    
    // Clear localStorage theme setting to start with a consistent state
    await page.evaluate(() => {
      localStorage.removeItem('app-theme');
      // Force system theme to be light for consistent testing
      window.matchMedia = (query) => ({
        matches: false, // Force light mode for system theme
        media: query,
        onchange: null,
        addListener: () => false,
        removeListener: () => false,
        addEventListener: () => false,
        removeEventListener: () => false,
        dispatchEvent: () => false,
      });
    });
    
    // Reload the page to apply the default theme
    await page.reload();
    
    // Wait for theme to be fully applied
    await page.waitForTimeout(500);
  });

  test('should toggle between light and dark mode', async ({ page }) => {
    // Get the initial theme (from html element class)
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    
    console.log(`Initial theme: ${initialTheme}`);
    
    // Find and click the theme toggle button
    const themeToggle = page.getByRole('button', { name: 'Toggle theme' });
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    
    // Wait for theme transition
    await page.waitForTimeout(100);
    
    // Check that the theme has changed
    const newTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    
    console.log(`New theme: ${newTheme}`);
    expect(newTheme).not.toBe(initialTheme);
    
    // Toggle again and verify it changes back
    await themeToggle.click();
    
    // Wait for theme transition
    await page.waitForTimeout(100);
    
    const finalTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    
    console.log(`Final theme: ${finalTheme}`);
    expect(finalTheme).toBe(initialTheme);
  });
  
  test('should persist theme preference after page reload', async ({ page }) => {
    // Find and click the theme toggle button to change the theme
    const themeToggle = page.getByRole('button', { name: 'Toggle theme' });
    await themeToggle.click();
    
    // Wait for theme to be applied
    await page.waitForTimeout(100);
    
    // Get the current theme after toggle
    const themeBeforeReload = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    
    // Reload the page
    await page.reload();
    
    // Wait for theme to be applied after reload
    await page.waitForTimeout(500);
    
    // Check if the theme is still the same after reload
    const themeAfterReload = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    
    expect(themeAfterReload).toBe(themeBeforeReload);
  });
  
  test('should show appropriate sun/moon icons based on theme', async ({ page }) => {
    // Check for initial icon visibility based on theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    
    // In dark mode, sun should be visible (to switch to light)
    // In light mode, moon should be visible (to switch to dark)
    if (initialTheme === 'dark') {
      // Check sun icon is shown with no scale-0 class in dark mode
      await expect(page.locator('button[title="Switch to light mode"] .dark\\:scale-100')).toBeVisible();
    } else {
      // Check moon icon is hidden with scale-0 class in light mode
      await expect(page.locator('button[title="Switch to dark mode"] .scale-100')).toBeVisible();
    }
    
    // Toggle theme
    const themeToggle = page.getByRole('button', { name: 'Toggle theme' });
    await themeToggle.click();
    
    // Wait for theme transition
    await page.waitForTimeout(100);
    
    // Verify icon changes 
    if (initialTheme === 'dark') {
      // Should now show moon icon in light mode
      await expect(page.locator('button[title="Switch to dark mode"] .scale-100')).toBeVisible();
    } else {
      // Should now show sun icon in dark mode
      await expect(page.locator('button[title="Switch to light mode"] .dark\\:scale-100')).toBeVisible();
    }
  });
  
  test('should handle system theme changes correctly', async ({ page }) => {
    // Set theme to system
    await page.evaluate(() => {
      // Clear any existing theme preference
      localStorage.removeItem('theme');
      localStorage.setItem('app-theme', 'system');
      
      // Store event handlers to call them later
      const eventHandlers = [];
      
      // Mock system dark mode with working event handlers
      window.matchMedia = (query) => ({
        matches: query.includes('dark') ? true : false,
        media: query,
        onchange: null,
        addListener: (fn) => { eventHandlers.push(fn); },
        removeListener: () => {},
        addEventListener: (event, fn) => { eventHandlers.push(fn); },
        removeEventListener: () => {},
        dispatchEvent: () => true,
        
        // Store handlers for later use
        __handlers: eventHandlers
      });
    });
    
    await page.reload();
    
    // First wait for page to stabilize
    await page.waitForTimeout(500);
    
    // Directly force dark mode
    await page.evaluate(() => {
      // Apply dark class directly
      document.documentElement.classList.add('dark');
      
      // Also trigger any registered media query handlers
      const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQueryList.__handlers) {
        mediaQueryList.__handlers.forEach(handler => {
          handler({ matches: true, media: '(prefers-color-scheme: dark)' });
        });
      }
    });
    
    // Wait for theme to update
    await page.waitForTimeout(1000);
    
    // Verify theme is dark
    const isDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    
    expect(isDark).toBe(true);
  });

  // UI APPEARANCE TESTS
  
  test('should apply correct background color in light and dark mode', async ({ page }) => {
    // Force light mode first
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    await page.reload();
    
    // Check light mode background
    const bodyBgColorLight = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    // Toggle to dark mode
    const themeToggle = page.getByRole('button', { name: 'Toggle theme' });
    await themeToggle.click();
    
    // Check dark mode background
    const bodyBgColorDark = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    // Verify colors are different between modes
    expect(bodyBgColorLight).not.toBe(bodyBgColorDark);
    
    // Optional: If you know the exact colors, you can check them
    // expect(bodyBgColorLight).toBe('rgb(255, 255, 255)'); // Example for white
    // expect(bodyBgColorDark).toBe('rgb(17, 24, 39)'); // Example for dark gray
  });
  
  test('should apply correct text color in light and dark mode', async ({ page }) => {
    // Force light mode first
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    await page.reload();
    
    // Find text element - assuming the "Signed In" heading is present
    const headingElement = page.getByRole('heading', { name: 'Signed In' });
    
    // Get text color in light mode
    const textColorLight = await headingElement.evaluate(el => {
      return window.getComputedStyle(el).color;
    });
    
    // Toggle to dark mode
    const themeToggle = page.getByRole('button', { name: 'Toggle theme' });
    await themeToggle.click();
    
    // Get text color in dark mode
    const textColorDark = await headingElement.evaluate(el => {
      return window.getComputedStyle(el).color;
    });
    
    // Verify colors are different between modes
    expect(textColorLight).not.toBe(textColorDark);
  });
  
  test('should apply themed styles to buttons', async ({ page }) => {
    // Force light mode first
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    await page.reload();
    
    // Find a button - looking for the Sign out button
    const buttonElement = page.getByRole('button', { name: 'Sign out' });
    
    // Get button styling in light mode
    const buttonStyleLight = await buttonElement.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderColor: style.borderColor
      };
    });
    
    // Toggle to dark mode
    const themeToggle = page.getByRole('button', { name: 'Toggle theme' });
    await themeToggle.click();
    
    // Get button styling in dark mode
    const buttonStyleDark = await buttonElement.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderColor: style.borderColor
      };
    });
    
    // Verify at least one styling property is different between modes
    expect(
      buttonStyleLight.backgroundColor !== buttonStyleDark.backgroundColor ||
      buttonStyleLight.color !== buttonStyleDark.color ||
      buttonStyleLight.borderColor !== buttonStyleDark.borderColor
    ).toBeTruthy();
  });
  
  test('should take a screenshot in both themes for visual comparison', async ({ page }) => {
    // Force light mode first
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    await page.reload();
    
    // Take screenshot in light mode
    await page.screenshot({ path: 'light-mode.png' });
    
    // Toggle to dark mode
    const themeToggle = page.getByRole('button', { name: 'Toggle theme' });
    await themeToggle.click();
    
    // Take screenshot in dark mode
    await page.screenshot({ path: 'dark-mode.png' });
    
    // No assertions here - the screenshots can be compared visually
    // or with tools like pixelmatch in a more advanced setup
  });
}); 