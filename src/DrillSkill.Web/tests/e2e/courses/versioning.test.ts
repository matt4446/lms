import { test, expect } from '@playwright/test';

test.describe('Course Versioning', () => {
  test.beforeEach(async ({ page }) => {
    // Register a new user
    const email = `instructor-ver-${Date.now()}@example.com`;
    const name = 'Instructor Versioning';
    const password = 'password123';

    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="name"]', name);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Create a course
    await page.goto('/courses/create');
    await page.fill('input[name="title"]', 'Versioning Course');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courses\/[\w-]+\/content$/);
  });

  test('should allow publishing and creating new drafts', async ({ page }) => {
    // Get course ID from URL
    const url = page.url();
    const courseId = url.match(/\/courses\/([\w-]+)\/content/)?.[1];
    expect(courseId).toBeTruthy();

    // Go to versions page
    await page.goto(`/courses/${courseId}/versions`);

    // 1. Verify initial state (v1 Draft)
    await expect(page.locator('text=Version 1')).toBeVisible();
    await expect(page.locator('text=DRAFT').first()).toBeVisible();
    await expect(page.locator('button:has-text("Publish")')).toBeVisible();

    // 2. Publish v1
    await page.click('button:has-text("Publish")');
    
    // Verify v1 is now PUBLISHED and Live
    await expect(page.locator('text=PUBLISHED').first()).toBeVisible();
    await expect(page.locator('text=Live')).toBeVisible();
    await expect(page.locator('button:has-text("Publish")')).not.toBeVisible();

    // 3. Create New Draft (v2)
    await expect(page.locator('button:has-text("Create New Draft")')).toBeVisible();
    await page.click('button:has-text("Create New Draft")');

    // Verify v2 appears
    await expect(page.locator('text=Version 2')).toBeVisible();
    await expect(page.locator('text=DRAFT').first()).toBeVisible();
    
    // Verify v1 is still there but not draft
    await expect(page.locator('text=Version 1')).toBeVisible();

    // 4. Publish v2
    // Find the publish button for v2 (should be the only one or the top one)
    await page.click('button:has-text("Publish")');

    // Verify v2 is Live
    // We need to be careful with selectors if multiple "Live" badges exist (shouldn't happen logic-wise but UI might lag)
    // Ideally, v1 loses "Live" badge.
    
    // Let's check that Version 2 row has "Live"
    const v2Row = page.locator('li', { hasText: 'Version 2' });
    await expect(v2Row).toContainText('Live');
    await expect(v2Row).toContainText('PUBLISHED');

    const v1Row = page.locator('li', { hasText: 'Version 1' });
    await expect(v1Row).not.toContainText('Live');
    await expect(v1Row).toContainText('Previous Release');
  });
});
