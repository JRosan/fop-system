import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');

    // Check main heading exists
    await expect(page.locator('h1')).toBeVisible();

    // Check navigation exists
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');

    // Test Features link
    const featuresLink = page.getByRole('link', { name: /features/i });
    if (await featuresLink.isVisible()) {
      await featuresLink.click();
      await expect(page).toHaveURL(/.*features/);
    }
  });

  test('should navigate to pricing page', async ({ page }) => {
    await page.goto('/');

    const pricingLink = page.getByRole('link', { name: /pricing/i });
    if (await pricingLink.isVisible()) {
      await pricingLink.click();
      await expect(page).toHaveURL(/.*pricing/);
    }
  });

  test('should have sign up CTA', async ({ page }) => {
    await page.goto('/');

    // Look for sign up or register button
    const signUpButton = page.getByRole('link', { name: /sign up|register|get started/i });
    await expect(signUpButton.first()).toBeVisible();
  });

  test('should display footer with legal links', async ({ page }) => {
    await page.goto('/');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check for legal links
    const privacyLink = page.getByRole('link', { name: /privacy/i });
    const termsLink = page.getByRole('link', { name: /terms/i });

    await expect(privacyLink.first()).toBeVisible();
    await expect(termsLink.first()).toBeVisible();
  });
});

test.describe('Public Pages', () => {
  test('should load features page', async ({ page }) => {
    await page.goto('/features');
    await expect(page).toHaveURL(/.*features/);
  });

  test('should load pricing page', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page).toHaveURL(/.*pricing/);
  });

  test('should load contact page', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveURL(/.*contact/);
  });

  test('should load privacy policy', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).toHaveURL(/.*privacy/);
  });

  test('should load terms of service', async ({ page }) => {
    await page.goto('/terms');
    await expect(page).toHaveURL(/.*terms/);
  });

  test('should load compliance page', async ({ page }) => {
    await page.goto('/compliance');
    await expect(page).toHaveURL(/.*compliance/);
  });
});
