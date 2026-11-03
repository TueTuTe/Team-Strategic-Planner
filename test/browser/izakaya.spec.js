import { test, expect } from '@playwright/test';

test('Izakaya and stream bridge render, start an after-hours trip and return to office on mobile', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ contentType: 'text/html', body: '<p>YouTube fixture</p>' }));
  await page.goto('/');
  await expect(page.locator('#office-canvas canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Izakaya', exact: true }).click();
  await expect(page.locator('#zone-detail')).toContainText('quầy sake');
  await page.waitForTimeout(500);
  await page.locator('.office-panel').screenshot({ path: '/tmp/atelier-izakaya.png' });
  await page.getByRole('button', { name: 'Cầu qua suối', exact: true }).click();
  await page.waitForTimeout(500);
  await page.locator('.office-panel').screenshot({ path: '/tmp/atelier-bridge.png' });
  await page.getByRole('button', { name: 'Tan ca · Sang Izakaya', exact: true }).click();
  await expect(page.locator('#bar-break')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#bar-status')).toContainText('Đã tan ca');
  await expect(page.locator('.agent-label[data-activity="walking"]').first()).toBeAttached();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Về văn phòng', exact: true }).click();
  await expect(page.locator('#bar-break')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-zone="overview"]')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Chuyển động: bật', exact: true }).click();
  await page.getByRole('button', { name: 'Tan ca · Sang Izakaya', exact: true }).click();
  await expect(page.locator('#bar-break')).toHaveAttribute('aria-pressed', 'false');
  expect(errors).toEqual([]);
});
