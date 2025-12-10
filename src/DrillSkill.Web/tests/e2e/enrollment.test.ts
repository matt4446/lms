import { test, expect } from '@playwright/test';

test.describe('Course Enrollment', () => {
  test('should allow a user to create a course and another user to enroll', async ({ browser }) => {
    // Create two isolated contexts
    const instructorContext = await browser.newContext();
    const studentContext = await browser.newContext();
    
    const instructorPage = await instructorContext.newPage();
    const studentPage = await studentContext.newPage();

    // 1. Instructor creates a course
    const instructorEmail = `instructor-${Date.now()}@example.com`;
    const courseTitle = `Test Course ${Date.now()}`;
    
    await instructorPage.goto('/auth/register');
    await instructorPage.fill('input[name="name"]', 'Instructor');
    await instructorPage.fill('input[name="email"]', instructorEmail);
    await instructorPage.fill('input[name="password"]', 'password123');
    await instructorPage.click('button[type="submit"]');
    await expect(instructorPage).toHaveURL(/\/dashboard/);

    await instructorPage.goto('/courses/create');
    // Fill manual course creation form (assuming AI is disabled or we use manual fallback)
    // The UI shows "Create New Course" if AI is disabled.
    // We need to make sure we can fill the form.
    
    // Note: The current UI requires `generatedCourse` to be populated.
    // If AI is disabled, `generatedCourse` is initialized with empty values.
    // So the form should be visible.
    
    await instructorPage.fill('input[name="title"]', courseTitle);
    await instructorPage.fill('textarea[name="description"]', 'This is a test course description.');
    
    // Add a section
    await instructorPage.fill('input[name="sections[0][title]"]', 'Introduction');
    await instructorPage.fill('textarea[name="sections[0][content]"]', '# Welcome\nThis is the first section.');
    
    await instructorPage.click('button[type="submit"]');
    
    // Should redirect to courses list
    await expect(instructorPage).toHaveURL(/\/courses/);
    await expect(instructorPage.locator('body')).toContainText(courseTitle);

    // 2. Student enrolls in the course
    const studentEmail = `student-${Date.now()}@example.com`;
    
    await studentPage.goto('/auth/register');
    await studentPage.fill('input[name="name"]', 'Student');
    await studentPage.fill('input[name="email"]', studentEmail);
    await studentPage.fill('input[name="password"]', 'password123');
    await studentPage.click('button[type="submit"]');
    await expect(studentPage).toHaveURL(/\/dashboard/);

    await studentPage.goto('/courses');
    await expect(studentPage.locator('body')).toContainText(courseTitle);
    
    // Click on the course (assuming it's a link)
    await studentPage.click(`text=${courseTitle}`);
    
    // Click Enroll
    await studentPage.click('button:has-text("Enroll in Course")');
    
    // Should redirect to dashboard and show the course
    await expect(studentPage).toHaveURL(/\/dashboard/);
    await expect(studentPage.locator('body')).toContainText(courseTitle);
    
    // Cleanup
    await instructorContext.close();
    await studentContext.close();
  });
});
