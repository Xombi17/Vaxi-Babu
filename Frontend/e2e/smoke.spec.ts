import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

test.describe('Vaxi Babu E2E Smoke Tests', () => {
  test('should login with demo family and view dashboard', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);

    // Wait for demo families to load
    await page.waitForSelector('button:has-text("Sharma Family")');

    // Click on Sharma Family demo login
    await page.click('button:has-text("Sharma Family")');

    // Wait for redirect to dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Verify dashboard is loaded
    await expect(page.locator('h1')).toContainText('Good morning');

    // Verify token is stored
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();

    const householdId = await page.evaluate(() => localStorage.getItem('household_id'));
    expect(householdId).toBeTruthy();
  });

  test('should navigate to dependents and view family members', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Sharma Family")');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Navigate to dependents
    await page.click('a:has-text("Dependents")');
    await page.waitForURL(`${BASE_URL}/dependents`);

    // Verify dependents page loaded
    await expect(page.locator('h1')).toContainText('Family Members');

    // Verify dependent cards are visible
    const dependentCards = page.locator('[href*="/dashboard?dependent="]');
    const count = await dependentCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should add a new dependent', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Sharma Family")');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Navigate to add dependent
    await page.click('a:has-text("Add Member")');
    await page.waitForURL(`${BASE_URL}/dependents/new`);

    // Fill form
    await page.fill('input[placeholder*="Aarav"]', 'Test Child');
    await page.selectOption('select', 'child');
    await page.fill('input[type="date"]', '2020-01-15');

    // Submit form
    await page.click('button:has-text("Save Member")');

    // Wait for redirect to dependents page
    await page.waitForURL(`${BASE_URL}/dependents`);

    // Verify success
    await expect(page.locator('text=Test Child')).toBeVisible();
  });

  test('should view timeline for a dependent', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Sharma Family")');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Navigate to dependents
    await page.click('a:has-text("Dependents")');
    await page.waitForURL(`${BASE_URL}/dependents`);

    // Click on first dependent
    const firstDependent = page.locator('[href*="/dashboard?dependent="]').first();
    await firstDependent.click();

    // Wait for timeline to load
    await page.waitForURL(`${BASE_URL}/dashboard**`);

    // Verify timeline content is visible
    const timelineContent = page.locator('text=Timeline');
    await expect(timelineContent).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Sharma Family")');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Click sign out button
    await page.click('button:has-text("Sign Out")');

    // Wait for redirect to home
    await page.waitForURL(`${BASE_URL}/`);

    // Verify token is cleared
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
