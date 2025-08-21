import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads
    await expect(page).toHaveTitle(/AWFR/);
    
    // Check if main elements are present
    await expect(page.locator('h1')).toContainText('Compare Delivery Prices');
    await expect(page.locator('[data-testid="distance-selector"]')).toBeVisible();
  });

  test('should change distance and update prices', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the distance selector to be visible
    await page.waitForSelector('[data-testid="distance-selector"]');
    
    // Change distance to 10km
    await page.fill('input[type="number"]', '10');
    
    // Wait for prices to update
    await page.waitForTimeout(1000);
    
    // Check if provider cards are displayed
    await expect(page.locator('[data-testid="provider-card"]')).toHaveCount(6);
  });

  test('should switch language', async ({ page }) => {
    await page.goto('/');
    
    // Click language toggle
    await page.click('[aria-label="Language"]');
    
    // Select Arabic
    await page.click('text=العربية');
    
    // Check if text changes to Arabic
    await expect(page.locator('h1')).toContainText('قارن أسعار التوصيل');
  });

  test('should switch theme', async ({ page }) => {
    await page.goto('/');
    
    // Click theme toggle
    await page.click('[aria-label="Theme"]');
    
    // Select dark theme
    await page.click('text=Dark');
    
    // Check if dark theme is applied
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should expand provider card details', async ({ page }) => {
    await page.goto('/');
    
    // Wait for provider cards to load
    await page.waitForSelector('[data-testid="provider-card"]');
    
    // Click on price breakdown button
    await page.click('text=Price Breakdown');
    
    // Check if breakdown is visible
    await expect(page.locator('text=Base Fee')).toBeVisible();
    await expect(page.locator('text=Distance Fee')).toBeVisible();
  });

  test('should navigate to provider website', async ({ page }) => {
    await page.goto('/');
    
    // Wait for provider cards to load
    await page.waitForSelector('[data-testid="provider-card"]');
    
    // Click order now button
    const orderButton = page.locator('text=Order Now').first();
    
    // Expect the button to open a new tab
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      orderButton.click(),
    ]);
    
    await newPage.waitForLoadState();
    expect(newPage.url()).toMatch(/https?:\/\//);
  });
});
