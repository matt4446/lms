import { test, expect } from '@playwright/test';

test.describe('First Setup', () => {
  // Note: These tests assume a fresh database where setup has NOT been completed.
  // If running locally and setup is done, these tests will fail or need DB reset.

  test('should redirect to /setup on first visit if not configured', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/setup/);
  });

  test('should complete setup successfully', async ({ page }) => {
    await page.goto('/setup');
    
    // Fill setup form
    await page.fill('input[name="siteName"]', 'Test LMS');
    await page.fill('input[name="name"]', 'Admin User');
    await page.fill('input[name="email"]', `admin-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'securePassword123!');
    
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Should show site name in title/header (assuming layout update)
    // await expect(page).toHaveTitle(/Test LMS/); 
  });

  test('should not allow access to /setup after completion', async ({ page }) => {
    // This test depends on the previous one completing successfully
    await page.goto('/setup');
    await expect(page).not.toHaveURL(/\/setup/);
    await expect(page).toHaveURL(/\//); // Should redirect to home or dashboard
  });
});
