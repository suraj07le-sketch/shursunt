
import { test, expect } from '@playwright/test';

test.describe('Authentication & Security Regression', () => {

    test('C3: Weak Password Blocking', async ({ page }) => {
        // Go to signup page
        await page.goto('/signup');

        // Wait for hydration and animation
        await expect(page.locator('input[id="email"]')).toBeVisible();

        // Fill form with valid email but weak password
        await page.fill('input[id="username"]', 'QA_Test_User');
        await page.fill('input[id="email"]', 'qa_weak@test.com');
        await page.fill('input[id="password"]', 'weak'); // Too short, no special chars

        // Click signup
        await page.click('button[type="submit"]');

        // Verify Toast Error appears (Regression Check)
        const toast = page.locator('text=Please ensure your password meets all requirements');
        await expect(toast).toBeVisible();
    });

    test('C1: Focus Indicators', async ({ page }) => {
        await page.goto('/login');

        // Press Tab to focus email field
        await page.keyboard.press('Tab');

        // Verify the focused element has the ring class (or computed style)
        // Since we use Tailwind 'ring-2', we check if the active element has that class or style
        // For standard HTML check:
        const emailInput = page.locator('input[id="email"]');
        await emailInput.focus();

        // Check if ring is applied via box-shadow (Tailwind implementation)
        // We expect some shadow value, not "none"
        await expect(emailInput).toHaveCSS('box-shadow', /rgb/);
    });

    test('Protected Routes', async ({ page }) => {
        // Try to access dashboard without login
        await page.goto('/dashboard');

        // Should be redirected to login
        await expect(page).toHaveURL(/.*login/);
    });
});
