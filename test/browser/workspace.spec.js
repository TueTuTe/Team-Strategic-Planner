import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

test('renders interactive 3D office and opens role profiles', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem('atelier-workspace-v1', JSON.stringify({ teamNames: { strategy: 'Minh Anh', insight: 'Linh', creative: 'Bảo', media: 'Hà', account: 'Tuấn' } }));
  });
  await page.goto('/');
  for (const name of ['Thôi Chí Vũ', 'Liễu Hà Lãm', 'Kim Chủ Ân', 'Lư Duy Na', 'Trịnh Dĩ An']) {
    await expect(page.locator('.team-card').filter({ hasText: name })).toBeVisible();
  }
  await expect(page.locator('#office-canvas canvas')).toBeVisible();
  await expect(page.locator('.agent-label')).toHaveCount(5);
  await expect(page.locator('.team-card')).toHaveCount(5);
  await page.getByRole('button', { name: 'Phóng to', exact: true }).click();
  await page.getByRole('button', { name: 'Đặt lại góc nhìn' }).click();
  await page.screenshot({ path: '/tmp/atelier-desktop.png', fullPage: true });
  for (const [id, label] of [['strategy', 'Góc riêng'], ['studio', 'Khu làm việc'], ['meeting', 'Phòng họp'], ['tea', 'Khu thưởng trà']]) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.locator(`[data-zone="${id}"]`)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#zone-detail')).not.toBeEmpty();
    await page.locator('.office-panel').screenshot({ path: `/tmp/atelier-zone-${id}.png` });
  }
  await page.getByRole('button', { name: 'Đặt lại góc nhìn' }).click();
  await expect(page.locator('[data-zone="overview"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.agent-label').filter({ hasText: 'Liễu Hà Lãm' }).click();
  await expect(page.getByRole('dialog')).toContainText('Insight Analyst');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});
test('creates, persists, tracks, exports and deletes a client plan', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Tạo brief mới', exact: true }).click();
  await page.getByLabel('Khách hàng / Thương hiệu').fill('Khách hàng <script>test</script>');
  await page.getByLabel('Mục tiêu truyền thông').fill('Ra mắt dòng sản phẩm mới');
  await page.getByLabel('Đối tượng mục tiêu').fill('Người trẻ 25–34 tuổi');
  await page.getByLabel('Ngân sách dự kiến').fill('500000000');
  await page.getByLabel('Thời gian triển khai').fill('8 tuần');
  await page.getByRole('button', { name: 'Tạo khung kế hoạch IMC' }).click();
  await expect(page.getByRole('dialog')).toContainText('Khách hàng <script>test</script>');
  await expect(page.locator('.plan-phase')).toHaveCount(5);
  await page.getByRole('checkbox', { name: 'Hoàn thành Discover' }).check();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Xuất Markdown' }).click();
  const download = await downloadEvent;
  const text = await fs.readFile(await download.path(), 'utf8');
  expect(text).toContain('500.000.000');
  expect(text).toContain('Trạng thái: Hoàn thành');
  await page.keyboard.press('Escape');
  await page.locator('[data-view="projects"]').click();
  await page.reload();
  await page.getByRole('button', { name: 'Xem kế hoạch' }).first().click();
  await expect(page.getByRole('checkbox', { name: 'Hoàn thành Discover' })).toBeChecked();
  await page.keyboard.press('Escape');
  await page.locator('[data-delete]').click();
  await page.getByRole('button', { name: 'Xóa bản nháp', exact: true }).click();
  await expect(page.locator('[data-delete]')).toHaveCount(0);
  await expect(page.locator('.project-count')).toHaveText('0');
});
test('supports mobile navigation and keyboard-accessible dialogs', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#office-canvas canvas')).toBeVisible();
  await page.screenshot({ path: '/tmp/atelier-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('[data-view="library"]').click();
  await page.locator('[data-framework="2"]').click();
  await expect(page.getByRole('dialog')).toContainText('IMC planning canvas');
  await page.getByRole('button', { name: 'Áp dụng vào brief mới' }).click();
  await expect(page.locator('#brief-form')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Đóng', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Tạo khung kế hoạch IMC' })).toBeFocused();
  await page.keyboard.press('Escape');
  await page.locator('[data-view="team"]').click();
  await expect(page.locator('.person-card')).toHaveCount(5);
});
test('renames a character across 3D, team, legacy assignments and export, and persists changes', async ({ page }) => {
  await page.goto('/#team');
  await page.getByRole('button', { name: 'Tạo brief mới', exact: true }).click();
  await page.getByLabel('Khách hàng / Thương hiệu').fill('Dự án đang làm');
  await page.getByLabel('Mục tiêu truyền thông').fill('Tăng nhận biết');
  await page.getByLabel('Đối tượng mục tiêu').fill('Người trẻ');
  await page.getByRole('button', { name: 'Tạo khung kế hoạch IMC' }).click();
  await page.getByRole('checkbox', { name: 'Hoàn thành Define' }).check();
  await page.keyboard.press('Escape');
  // Emulate plans saved by the first version, before stable owner IDs existed.
  await page.evaluate(() => {
    const key = 'atelier-workspace-v1', saved = JSON.parse(localStorage.getItem(key));
    saved.projects.forEach(p => p.phases.forEach(phase => delete phase.ownerId));
    localStorage.setItem(key, JSON.stringify(saved));
  });
  await page.reload();
  await page.locator('[data-agent="strategy"]').click();
  await page.getByLabel('Tên nhân vật', { exact: true }).fill('   ');
  await page.getByRole('button', { name: 'Lưu tên', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Vui lòng nhập tên nhân vật');
  const name = 'Ngọc <b>Anh</b>';
  await page.getByLabel('Tên nhân vật', { exact: true }).fill(name);
  await page.getByRole('button', { name: 'Lưu tên', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(name);
  await expect(page.locator('.person-role').last()).toHaveText('Strategy Lead');
  await expect(page.locator('.modal b')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-agent="strategy"]')).toContainText(name);
  await page.reload();
  await expect(page.locator('[data-agent="strategy"]')).toContainText(name);
  await expect(page.locator('[data-agent="insight"]')).toContainText('Liễu Hà Lãm');
  await page.getByRole('button', { name: 'Văn phòng 3D', exact: true }).click();
  await expect(page.locator('.agent-label').filter({ hasText: name })).toBeVisible();
  await expect(page.locator('.agent-label b')).toHaveCount(0);
  await page.locator('#open-current').click();
  await expect(page.locator('.plan-phase').filter({ hasText: 'Define' })).toContainText(name);
  await expect(page.getByRole('checkbox', { name: 'Hoàn thành Define' })).toBeChecked();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Xuất Markdown' }).click();
  const download = await downloadEvent;
  expect(await fs.readFile(await download.path(), 'utf8')).toContain(`Phụ trách: ${name}`);
});
