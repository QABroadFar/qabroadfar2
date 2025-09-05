import { test, expect } from '@playwright/test';

test('Public dashboard access', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');
  
  // Click on public access button
  await page.getByRole('button', { name: 'View Public Dashboard' }).click();
  
  // Wait for navigation to public dashboard
  await page.waitForURL('/public/dashboard');
  
  // Check that we're on the public dashboard
  await expect(page).toHaveURL('/public/dashboard');
  
  // Check that the public dashboard title is visible
  await expect(page.getByText('Public NCP Dashboard')).toBeVisible();
  
  // Check that the NCP database section is visible
  await expect(page.getByText('NCP Database')).toBeVisible();
});