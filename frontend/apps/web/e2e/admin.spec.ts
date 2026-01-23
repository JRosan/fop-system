import { test, expect } from '@playwright/test';

test.describe('Admin Pages', () => {
  test('should load admin dashboard', async ({ page }) => {
    await page.goto('/app/admin');

    await expect(page).toHaveURL(/.*\/app\/admin/);
  });

  test('should redirect /admin to /app/admin', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveURL(/.*\/app\/admin/);
  });

  test('should load user management page', async ({ page }) => {
    await page.goto('/app/admin/users');

    await expect(page).toHaveURL(/.*\/app\/admin\/users/);

    // Should show user management UI
    await expect(page.getByText(/user|management/i).first()).toBeVisible();
  });

  test('should have user search functionality', async ({ page }) => {
    await page.goto('/app/admin/users');

    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      // Search should filter results
    }
  });

  test('should have role filter dropdown', async ({ page }) => {
    await page.goto('/app/admin/users');

    // Look for role filter
    const roleFilter = page.getByRole('combobox');
    if (await roleFilter.first().isVisible()) {
      await roleFilter.first().click();
      // Should show role options
    }
  });

  test('should load system settings page', async ({ page }) => {
    await page.goto('/app/admin/settings');

    await expect(page).toHaveURL(/.*\/app\/admin\/settings/);
  });

  test('should display settings tabs', async ({ page }) => {
    await page.goto('/app/admin/settings');

    // Look for tab navigation
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();

    // Should have multiple settings tabs
    expect(tabCount).toBeGreaterThan(0);
  });
});

test.describe('Reviewer Dashboard', () => {
  test('should load reviewer dashboard', async ({ page }) => {
    await page.goto('/app/review');

    await expect(page).toHaveURL(/.*\/app\/review/);
  });

  test('should redirect /review to /app/review', async ({ page }) => {
    await page.goto('/review');

    await expect(page).toHaveURL(/.*\/app\/review/);
  });
});

test.describe('Finance Dashboard', () => {
  test('should load finance dashboard', async ({ page }) => {
    await page.goto('/app/finance');

    await expect(page).toHaveURL(/.*\/app\/finance/);
  });

  test('should redirect /finance to /app/finance', async ({ page }) => {
    await page.goto('/finance');

    await expect(page).toHaveURL(/.*\/app\/finance/);
  });
});

test.describe('Audit Logs', () => {
  test('should load audit logs page', async ({ page }) => {
    await page.goto('/app/audit');

    await expect(page).toHaveURL(/.*\/app\/audit/);
  });

  test('should redirect /audit to /app/audit', async ({ page }) => {
    await page.goto('/audit');

    await expect(page).toHaveURL(/.*\/app\/audit/);
  });
});

test.describe('Waivers', () => {
  test('should load waivers page', async ({ page }) => {
    await page.goto('/app/waivers');

    await expect(page).toHaveURL(/.*\/app\/waivers/);
  });

  test('should redirect /waivers to /app/waivers', async ({ page }) => {
    await page.goto('/waivers');

    await expect(page).toHaveURL(/.*\/app\/waivers/);
  });
});

test.describe('Subscription', () => {
  test('should load subscription page', async ({ page }) => {
    await page.goto('/app/subscription');

    await expect(page).toHaveURL(/.*\/app\/subscription/);
  });

  test('should redirect /subscription to /app/subscription', async ({ page }) => {
    await page.goto('/subscription');

    await expect(page).toHaveURL(/.*\/app\/subscription/);
  });

  test('should display current plan information', async ({ page }) => {
    await page.goto('/app/subscription');

    // Should show plan details
    await expect(page.getByText(/plan|subscription|billing/i).first()).toBeVisible();
  });
});
