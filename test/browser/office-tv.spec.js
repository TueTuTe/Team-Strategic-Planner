import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { if (top === self) localStorage.setItem('atelier-audio-v1', JSON.stringify({ enabled: false })); });
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ contentType: 'text/html', body: '<body style="background:#244b3e;color:white"><h1>YouTube player test fixture</h1></body>' }));
});

test('places the requested video on the actual office TV and stops it when leaving', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#official-player-strip')).toHaveCount(0);
  await expect(page.locator('#office-canvas #office-tv-screen')).toBeVisible();
  await page.locator('#tv-play').click();
  await expect(page.locator('#office-tv-screen')).toHaveAttribute('data-mode', 'youtube');
  await expect(page.locator('#office-tv-screen iframe')).toHaveAttribute('src', /embed\/ufwB9Uja_wM\?/);
  await expect(page.locator('[data-zone="tv"]')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => (await page.locator('#office-tv-screen').boundingBox())?.width || 0).toBeGreaterThan(600);
  await page.locator('.office-panel').screenshot({ path: '/tmp/atelier-office-tv.png' });
  await page.locator('[data-view="projects"]').click();
  await expect(page.locator('#youtube-player iframe')).toHaveCount(0);
  await page.locator('[data-view="office"]').click();
  await expect(page.locator('#office-tv-screen')).toHaveAttribute('data-mode', 'standby');
  expect(errors).toEqual([]);
});

test('projects actual plan slides and supports their controls on the TV', async ({ page }) => {
  await page.goto('/'); await page.locator('#tv-plan').click();
  await expect(page.locator('#office-tv-screen')).toHaveAttribute('data-mode', 'presentation');
  await expect(page.locator('.tv-slide h2')).toContainText('Mộc');
  await page.getByRole('button', { name: 'Slide tiếp', exact: true }).click();
  await expect(page.locator('.tv-slide-label')).toHaveText('02 · AUDIENCE');
  await page.getByRole('button', { name: 'Slide trước', exact: true }).click();
  await expect(page.locator('.tv-slide-label')).toHaveText('01 · CLIENT BRIEF');
  await page.locator('.office-panel').screenshot({ path: '/tmp/atelier-office-tv-plan.png' });
  await page.locator('#tv-stop').click();
  await expect(page.locator('#office-tv-screen')).toHaveAttribute('data-mode', 'standby');
});

test('keeps the TV aligned while orbiting and within the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/'); await page.locator('#tv-focus').click();
  const before = await page.locator('#office-tv-screen').evaluate(element => element.style.transform);
  const box = await page.locator('#office-canvas').boundingBox();
  await page.mouse.move(box.x + 12, box.y + 60); await page.mouse.down();
  await page.mouse.move(box.x + 100, box.y + 80, { steps: 6 }); await page.mouse.up();
  await expect.poll(() => page.locator('#office-tv-screen').evaluate(element => element.style.transform)).not.toBe(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('does not pull users away from another page for automatic TV playback', async ({ page }) => {
  await page.goto('/#library');
  await page.getByRole('button', { name: 'Hướng dẫn', exact: true }).click();
  await expect(page.locator('#crumb')).toHaveText('Thư viện chiến lược');
  await expect(page.locator('#youtube-player iframe')).toHaveCount(0);
});
