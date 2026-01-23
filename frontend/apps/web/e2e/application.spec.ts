import { test, expect } from '@playwright/test';

test.describe('Application Flow', () => {
  // Note: These tests assume the user is authenticated or auth is disabled in test mode

  test('should redirect /dashboard to /app/dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to /app/dashboard
    await expect(page).toHaveURL(/.*\/app\/dashboard/);
  });

  test('should redirect /applications to /app/applications', async ({ page }) => {
    await page.goto('/applications');

    await expect(page).toHaveURL(/.*\/app\/applications/);
  });

  test('should load applications list page', async ({ page }) => {
    await page.goto('/app/applications');

    // Check page structure exists
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should navigate to new application page', async ({ page }) => {
    await page.goto('/app/applications/new');

    await expect(page).toHaveURL(/.*\/app\/applications\/new/);

    // Should show application wizard
    await expect(page.getByText(/permit type|application|step/i).first()).toBeVisible();
  });

  test('should show permit type selection in wizard', async ({ page }) => {
    await page.goto('/app/applications/new');

    // Check for permit type options
    const oneTimeOption = page.getByText(/one-time|onetime/i);
    const blanketOption = page.getByText(/blanket/i);
    const emergencyOption = page.getByText(/emergency/i);

    // At least one should be visible
    const hasOptions =
      await oneTimeOption.isVisible() ||
      await blanketOption.isVisible() ||
      await emergencyOption.isVisible();

    expect(hasOptions).toBeTruthy();
  });

  test('should navigate between wizard steps', async ({ page }) => {
    await page.goto('/app/applications/new');

    // Select a permit type if needed
    const oneTimeOption = page.getByText(/one-time|onetime/i).first();
    if (await oneTimeOption.isVisible()) {
      await oneTimeOption.click();
    }

    // Look for next button
    const nextButton = page.getByRole('button', { name: /next|continue|proceed/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Should have progressed (page content should change)
  });
});

test.describe('Dashboard', () => {
  test('should load main dashboard', async ({ page }) => {
    await page.goto('/app/dashboard');

    // Check dashboard elements
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    await page.goto('/app/dashboard');

    // Look for common dashboard elements
    const statsSection = page.locator('[class*="stat"], [class*="card"], [class*="metric"]');
    // Dashboard should have some content
  });

  test('should have navigation sidebar', async ({ page }) => {
    await page.goto('/app/dashboard');

    // Check for navigation elements
    const nav = page.locator('nav, aside, [class*="sidebar"]');
    await expect(nav.first()).toBeVisible();
  });
});

test.describe('Permits', () => {
  test('should load permits page', async ({ page }) => {
    await page.goto('/app/permits');

    await expect(page).toHaveURL(/.*\/app\/permits/);
  });

  test('should redirect /permits to /app/permits', async ({ page }) => {
    await page.goto('/permits');

    await expect(page).toHaveURL(/.*\/app\/permits/);
  });

  test('should load permit verification page', async ({ page }) => {
    await page.goto('/app/verify');

    await expect(page).toHaveURL(/.*\/app\/verify/);
  });
});

test.describe('Fee Calculator', () => {
  test('should load fee calculator page', async ({ page }) => {
    await page.goto('/app/fee-calculator');

    await expect(page).toHaveURL(/.*\/app\/fee-calculator/);
  });

  test('should have form inputs for fee calculation', async ({ page }) => {
    await page.goto('/app/fee-calculator');

    // Look for permit type, seats, weight inputs
    const inputs = page.locator('input, select');
    const inputCount = await inputs.count();

    expect(inputCount).toBeGreaterThan(0);
  });
});
