import { test, expect } from '@playwright/test';
import archiver from 'archiver';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

test.describe('Course Import', () => {
  test.beforeEach(async ({ page }) => {
    // Register a new user
    const email = `instructor-import-${Date.now()}@example.com`;
    const name = 'Instructor Import';
    const password = 'password123';

    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="name"]', name);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/(courses|dashboard)/);
  });

  test('should allow importing a course from zip', async ({ page }) => {
    // 1. Create a valid ZIP file
    const zipPath = join(tmpdir(), `test-import-${Date.now()}.zip`);
    const output = createWriteStream(zipPath);
    const archive = archiver('zip');

    await new Promise<void>((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);

      const manifest = {
        version: '1.0',
        course: {
          id: 'test-course',
          title: 'Imported Course',
          description: 'Imported Description',
          version: 1,
          exportedAt: new Date().toISOString()
        }
      };
      archive.append(JSON.stringify(manifest), { name: 'manifest.json' });
      
      const content = {
        modules: []
      };
      archive.append(JSON.stringify(content), { name: 'content.json' });

      archive.finalize();
    });

    // 2. Go to import page
    await page.goto('/courses/import');

    // 3. Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(zipPath);

    // 4. Click Start Import
    await page.click('button:has-text("Start Import")');

    // 5. Wait for completion and redirect
    await expect(page.locator('text=Import complete!')).toBeVisible();
    await expect(page).toHaveURL(/\/courses\/[\w-]+$/, { timeout: 10000 });

    // 6. Verify course details
    await expect(page.locator('h1')).toContainText('Imported Course');
    await expect(page.locator('text=Imported Description')).toBeVisible();
  });
});
