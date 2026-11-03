import { test, expect } from '@playwright/test';

test('garden view animates and idle staff start a break; mobile stays within the viewport', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ contentType: 'text/html', body: '<p>YouTube fixture</p>' }));
  await page.goto('/');
  await expect(page.locator('#office-canvas canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Vườn Nhật', exact: true }).click();
  await expect(page.locator('#zone-detail')).toContainText('Hồ koi');
  await page.waitForTimeout(600);
  await page.locator('.office-panel').screenshot({ path: '/tmp/atelier-garden.png' });
  const first = await page.locator('#office-canvas canvas').screenshot();
  await page.waitForTimeout(700);
  expect((await page.locator('#office-canvas canvas').screenshot()).equals(first)).toBe(false);
  await page.getByRole('button', { name: 'Ra vườn nghỉ', exact: true }).click();
  await expect(page.locator('[data-zone="garden"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.agent-label[data-activity="walking"]').first()).toBeAttached();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Ra vườn nghỉ', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
