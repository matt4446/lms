import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should allow a user to register', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const name = 'Test User';
    const password = 'password123';

    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle'); // Wait for hydration/scripts
    
    await page.fill('input[name="name"]', name);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or home after successful registration
    // Adjust expectation based on actual flow (currently redirects to dashboard)
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Check if user name is displayed in navbar (profile menu)
    await expect(page.locator('nav')).toContainText(name);
  });

  test('should allow a user to login', async ({ page }) => {
    // First register a user to ensure one exists
    const email = `login-test-${Date.now()}@example.com`;
    const name = 'Login User';
    const password = 'password123';

    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="name"]', name);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Logout
    await page.click('#user-menu-button');
    await page.click('text=Sign out');
    await expect(page).toHaveURL('/');

    // Login
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('nav')).toContainText(name);
  });
});
