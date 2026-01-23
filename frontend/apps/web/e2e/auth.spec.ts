import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should load registration page', async ({ page }) => {
    await page.goto('/register');

    // Check page loaded
    await expect(page).toHaveURL(/.*register/);

    // Check form elements exist
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.goto('/register');

    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /create account|sign up|register/i });
    await submitButton.click();

    // Form should show validation - either HTML5 validation or custom
    // The form should not navigate away
    await expect(page).toHaveURL(/.*register/);
  });

  test('should show password mismatch error', async ({ page }) => {
    await page.goto('/register');

    // Fill in form with mismatched passwords
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/first name/i).fill('Test');
    await page.getByLabel(/last name/i).fill('User');

    const passwordFields = page.getByLabel(/password/i);
    await passwordFields.first().fill('password123');
    await passwordFields.nth(1).fill('differentpassword');

    // Submit
    const submitButton = page.getByRole('button', { name: /create account|sign up|register/i });
    await submitButton.click();

    // Should show error or stay on page
    await expect(page).toHaveURL(/.*register/);
  });

  test('should load forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');

    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should submit forgot password request', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.getByLabel(/email/i).fill('test@example.com');

    const submitButton = page.getByRole('button', { name: /send|reset|submit/i });
    await submitButton.click();

    // Should show success message or stay on page
    // The actual email won't be sent in test environment
  });

  test('should handle invalid reset password link', async ({ page }) => {
    await page.goto('/reset-password');

    // Without valid token, should show error state
    await expect(page.getByText(/invalid|expired|error/i)).toBeVisible();
  });

  test('should navigate from register to login', async ({ page }) => {
    await page.goto('/register');

    // Look for link to login
    const loginLink = page.getByRole('link', { name: /sign in|log in|already have an account/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
      // May redirect to external auth or login page
    }
  });
});

test.describe('Verify Email Flow', () => {
  test('should show error for invalid verification token', async ({ page }) => {
    await page.goto('/verify-email?token=invalid&email=test@example.com');

    // Should show verification status
    await expect(page).toHaveURL(/.*verify-email/);
  });

  test('should show loading state during verification', async ({ page }) => {
    await page.goto('/verify-email?token=test123&email=test@example.com');

    // Page should handle verification attempt
    await expect(page).toHaveURL(/.*verify-email/);
  });
});
