import { test, expect } from '@playwright/test';

test.describe('Course Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Register a new user for each test to ensure clean state
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
  });

  test('should allow an instructor to create a new course', async ({ page }) => {
    await page.goto('/courses');
    
    // Click Create Course button
    await page.click('text=Create New Course');
    await expect(page).toHaveURL('/courses/create');

    // Fill form
    const title = 'My First Course';
    const description = 'This is a test course description.';
    
    await page.fill('input[name="title"]', title);
    await page.fill('textarea[name="description"]', description);
    
    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to content page
    // URL pattern: /courses/[id]/content
    await expect(page).toHaveURL(/\/courses\/[\w-]+\/content$/);
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/courses/create');
    
    // Submit without title
    await page.click('button[type="submit"]');
    
    // Should stay on page and show error (HTML5 validation might block it, but if we bypass or check for validation message)
    // Playwright handles HTML5 validation checks differently.
    // Let's assume server-side validation returns an error message if client-side is bypassed or fails.
    // But our form has `required` attribute.
    
    // Check for HTML5 validation message
    const titleInput = page.locator('input[name="title"]');
    const validationMessage = await titleInput.evaluate((element) => {
      const input = element as HTMLInputElement;
      return input.validationMessage;
    });
    
    expect(validationMessage).not.toBe('');
  });
});
