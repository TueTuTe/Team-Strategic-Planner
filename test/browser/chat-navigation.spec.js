import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ contentType: 'text/html', body: '<p>Official player test fixture</p>' }));
});
async function send(page, text) {
  await page.getByLabel('Tin nhắn cho nhân viên').fill(text);
  await page.getByRole('button', { name: 'Gửi tin nhắn', exact: true }).click();
}
test('idle employees walk into aisles and exchange text with each other', async ({ page }) => {
  test.setTimeout(60000);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.agent-label[data-activity="walking"]')).toHaveCount(2, { timeout: 20000 });
  await expect(page.locator('.character-bubble[data-tone="ambient"]')).toHaveCount(2, { timeout: 25000 });
  await expect(page.locator('#life-log')).toContainText('chưa có task');
  await page.locator('.office-panel').screenshot({ path: '/tmp/atelier-walking-dialogue.png' });
  expect(errors).toEqual([]);
});
test('chat calls a person, assigns work, reports actual task state and persists replies', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#chat-launcher').click();
  await page.getByLabel('Gửi tới', { exact: true }).selectOption('creative');
  await send(page, 'Tiến độ đến đâu rồi?');
  await expect(page.locator('.chat-message.member').last()).toContainText('chưa có task');
  await expect(page.locator('.character-bubble[data-speaker="creative"]')).toContainText('chưa có task');
  await send(page, 'Giao việc: Phác ý tưởng <b>Mộc</b>');
  await expect(page.locator('.life-task')).toContainText('Phác ý tưởng <b>Mộc</b>');
  await expect(page.locator('.chat-message b')).toHaveCount(0);
  await send(page, 'Tiến độ?');
  await expect(page.locator('.chat-message.member').last()).toContainText('chưa bắt đầu');
  await send(page, 'Bắt đầu làm thử');
  await expect(page.locator('.task-status')).toHaveText('Đang làm thử');
  await expect(page.locator('.task-status')).toHaveText('Đã xong', { timeout: 12000 });
  await send(page, 'Xong chưa?');
  await expect(page.locator('.chat-message.member').last()).toContainText('bản nháp mô phỏng');
  await send(page, 'Lại đây nhé');
  await expect(page.locator('.character-bubble[data-speaker="creative"]')).toContainText('đã tới lối đi');
  await page.locator('#office-chat-panel').screenshot({ path: '/tmp/atelier-office-chat.png' });
  await page.reload(); await page.locator('#chat-launcher').click();
  await expect(page.locator('#office-chat-messages')).toContainText('Phác ý tưởng <b>Mộc</b>');
});
test('receiving work recalls a roaming employee before the demo starts', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/');
  await page.locator('#chat-launcher').click();
  await page.getByLabel('Gửi tới', { exact: true }).selectOption('creative');
  await send(page, 'Lại đây');
  await expect(page.locator('.character-bubble[data-speaker="creative"]')).toContainText('đã tới', { timeout: 20000 });
  await send(page, 'Giao việc: Rà creative brief');
  await send(page, 'Làm thử đi');
  await expect(page.locator('.task-status')).toHaveText('Đang về bàn');
  await expect(page.locator('.task-status')).toHaveText('Đang làm thử', { timeout: 20000 });
  await expect(page.locator('.agent-label').filter({ hasText: 'Kim Chủ Ân' })).toHaveAttribute('data-activity', 'working');
  await expect(page.locator('.task-status')).toHaveText('Đã xong', { timeout: 12000 });
});
test('embeds the requested YouTube video and stops it when switching to ambient', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#youtube-player iframe')).toHaveCount(0);
  await page.getByLabel('Điều khiển âm thanh').click();
  const player = page.locator('#youtube-player iframe');
  await expect(player).toHaveAttribute('src', /youtube-nocookie\.com\/embed\/ufwB9Uja_wM\?/);
  await expect(player).toBeVisible();
  await expect(page.locator('#sound-controls')).toHaveAttribute('data-state', 'external');
  await page.getByRole('button', { name: 'Dùng nhạc ambient' }).click();
  await expect(player).toHaveCount(0);
  await expect(page.locator('#sound-controls')).toHaveAttribute('data-state', 'playing');
  await page.getByRole('button', { name: 'Phát Pretty Please', exact: true }).click();
  await expect(player).toBeVisible();
  await page.locator('#tv-stop').click();
  await expect(player).toHaveCount(0);
  await expect(page.locator('#sound-controls')).toHaveAttribute('data-state', 'muted');
});
test('mobile chat remains usable and sends replies from the selected character', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/'); await page.locator('#chat-launcher').click();
  await page.getByLabel('Gửi tới', { exact: true }).selectOption('insight');
  await page.getByLabel('Tin nhắn cho nhân viên').fill('Tiến độ?');
  await page.getByLabel('Tin nhắn cho nhân viên').press('Enter');
  await expect(page.locator('.chat-message.member').last()).toContainText('chưa có task');
  await expect(page.locator('.character-bubble[data-speaker="insight"]')).toContainText('chưa có task');
  const box = await page.locator('#office-chat-panel').boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
