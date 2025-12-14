import { test, expect } from '@playwright/test';

test.describe('Course Export', () => {
  test.beforeEach(async ({ page }) => {
    // Register a new user
    const email = `instructor-export-${Date.now()}@example.com`;
    const name = 'Instructor Export';
    const password = 'password123';

    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="name"]', name);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/(courses|dashboard)/);
    
    // Verify we are logged in
    await expect(page.locator('body')).toContainText(name);

    // Go to courses page to ensure we can find the button
    await page.goto('/courses');

    // Click Create Course (from dashboard home)
    await page.click('text=Create New Course');
    
    // Wait for navigation
    await page.waitForURL(/\/courses\/create/);

    // Create a course
    await page.fill('input[name="title"]', 'Exportable Course');
    await page.fill('textarea[name="description"]', 'Description for export');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to content page
    await expect(page).toHaveURL(/\/courses\/[\w-]+\/content$/, { timeout: 10000 });
  });

  test('should allow exporting a course version', async ({ page }) => {
    // Get course ID from URL
    const url = page.url();
    const courseId = url.match(/\/courses\/([\w-]+)\/content/)?.[1];
    expect(courseId).toBeTruthy();

    // Go to export page
    await page.goto(`/courses/${courseId}/export`);
    
    // Should see the draft version
    await expect(page.locator('text=Version 1')).toBeVisible();
    await expect(page.locator('text=Draft').first()).toBeVisible();

    // Click Generate Export
    await page.click('button:has-text("Generate Export")');

    // Should see success message
    await expect(page.locator('text=Export started!')).toBeVisible();

    // Wait for "Download ZIP" link to appear (polling by reloading)
    await expect(async () => {
        await page.reload();
        await expect(page.locator('text=Download ZIP')).toBeVisible();
    }).toPass({ timeout: 10000 });
    
    // Verify download link
    const downloadLink = page.locator('text=Download ZIP');
    const href = await downloadLink.getAttribute('href');
    expect(href).toMatch(/\/api\/downloads\/[\w-]+/);
  });
});
