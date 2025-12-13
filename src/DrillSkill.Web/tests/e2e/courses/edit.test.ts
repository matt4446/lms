import { test, expect } from '@playwright/test';

test.describe('Course Editing', () => {
  test.beforeEach(async ({ page }) => {
    // Register a new user
    const email = `instructor-${Date.now()}@example.com`;
    const name = 'Instructor User';
    const password = 'password123';

    await page.goto('/auth/register');
    // Wait for hydration/network idle to ensure JS handlers are attached
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="name"]', name);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/(courses|dashboard)/);

    // Create a course to edit
    await page.goto('/courses');
    await page.click('text=Create New Course');
    await expect(page).toHaveURL('/courses/create');
    
    await page.fill('input[name="title"]', 'Original Title');
    await page.fill('textarea[name="description"]', 'Original Description');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courses\/[\w-]+\/content$/);
  });

  test('should allow updating course details', async ({ page }) => {
    // We are on the content page, navigate to General (Edit) tab
    await page.click('text=General');
    await expect(page).toHaveURL(/\/courses\/[\w-]+\/edit$/);
    
    const newTitle = 'Updated Course Title';
    const newDescription = 'Updated Description';
    
    await page.fill('input[name="title"]', newTitle);
    await page.fill('textarea[name="description"]', newDescription);
    
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=Successfully saved!')).toBeVisible();
    
    // Reload page to verify persistence
    await page.reload();
    
    await expect(page.locator('input[name="title"]')).toHaveValue(newTitle);
    await expect(page.locator('textarea[name="description"]')).toHaveValue(newDescription);
  });
});
