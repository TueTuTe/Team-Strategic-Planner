import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ contentType: 'text/html', body: '<p>YouTube player fixture</p>' }));
});

test('gives a character work, reacts playfully and restores a completed demo with an actual draft', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.locator('.agent-label').filter({ hasText: 'Thôi Chí Vũ' }).click();
  await page.getByRole('button', { name: 'Nhắc nghiêm' }).click();
  await expect(page.locator('.character-bubble[data-speaker="strategy"]')).toContainText('Bớt ngắm cá');
  await expect(page.locator('#life-log')).toContainText('Thôi Chí Vũ');
  await page.locator('.team-card[data-agent="strategy"]').click();
  await page.locator('#give-task').click();
  await expect(page.getByLabel('Nhân vật nhận việc')).toHaveValue('strategy');
  const title = 'Rà brief <b>Mộc</b>';
  await page.getByLabel('Nội dung công việc').fill(title);
  await page.getByRole('button', { name: 'Giao việc', exact: true }).click();
  await expect(page.locator('.life-task')).toContainText(title);
  await expect(page.locator('.life-task b')).toHaveCount(0);
  await page.getByRole('button', { name: 'Làm thử · mô phỏng', exact: true }).click();
  await expect(page.locator('.task-status')).toHaveText('Đang làm thử');
  await expect(page.locator('.team-card[data-agent="strategy"]')).toContainText('Đang làm thử');
  await page.reload();
  await expect(page.locator('.task-status')).toHaveText('Đã xong', { timeout: 15000 });
  await page.getByRole('button', { name: 'Xem bản nháp' }).click();
  await expect(page.getByRole('dialog')).toContainText('Chưa có AI nghiên cứu');
  await expect(page.getByRole('dialog')).toContainText('Kết nối mục tiêu');
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(page.locator('.task-status')).toHaveText('Đã xong');
  expect(errors).toEqual([]);
});

test('starts music after interaction, supports volume and persists mute', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#sound-controls')).toHaveAttribute('data-state', 'locked');
  await page.getByLabel('Điều khiển âm thanh').click();
  await page.getByRole('button', { name: 'Dùng nhạc ambient', exact: true }).click();
  await expect(page.locator('#sound-controls')).toHaveAttribute('data-state', 'playing');
  await page.getByLabel('Âm lượng nhạc').focus();
  await page.getByLabel('Âm lượng nhạc').press('Home');
  await page.getByLabel('Âm lượng nhạc').press('ArrowRight');
  await expect(page.getByLabel('Âm lượng nhạc')).toHaveValue('1');
  await page.getByRole('button', { name: 'Tắt nhạc', exact: true }).click();
  await expect(page.locator('#sound-controls')).toHaveAttribute('data-state', 'muted');
  await page.reload();
  await expect(page.locator('#sound-controls')).toHaveAttribute('data-state', 'muted');
  await page.getByLabel('Điều khiển âm thanh').click();
  await expect(page.getByLabel('Âm lượng nhạc')).toHaveValue('1');
  await page.getByRole('button', { name: 'Phát nhạc', exact: true }).click();
  await expect(page.locator('#sound-controls')).toHaveAttribute('data-state', 'playing');
});

test('animates the scene, can freeze motion, and respects reduced motion on mobile', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('#office-canvas canvas');
  await expect(canvas).toBeVisible();
  const first = await canvas.screenshot();
  await page.waitForTimeout(600);
  expect(first.equals(await canvas.screenshot())).toBe(false);
  await page.locator('#motion-toggle').click();
  await expect(page.locator('#motion-toggle')).toHaveAttribute('aria-pressed', 'false');
  await page.waitForTimeout(150);
  const frozen = await canvas.screenshot();
  await page.waitForTimeout(400);
  expect(frozen.equals(await canvas.screenshot())).toBe(true);
  await page.reload();
  await expect(page.locator('#motion-toggle')).toHaveAttribute('aria-pressed', 'false');
  await page.evaluate(() => localStorage.removeItem('atelier-motion'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator('#motion-toggle')).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
