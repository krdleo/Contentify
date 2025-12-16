import { test, expect } from '@playwright/test';

test('Homepage Loads', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle(/Contentify/);
});
