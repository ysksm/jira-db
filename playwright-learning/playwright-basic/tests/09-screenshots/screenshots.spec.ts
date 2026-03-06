/**
 * レッスン09: スクリーンショット
 *
 * 学習ポイント:
 * - page.screenshot: ページ全体のスクリーンショット
 * - locator.screenshot: 要素のスクリーンショット
 * - フルページスクリーンショット
 * - スクリーンショットの保存先指定
 */
import { test, expect } from '@playwright/test';

test.describe('スクリーンショット学習', () => {
  test('ページ全体のスクリーンショット', async ({ page }) => {
    await page.goto('/dashboard');

    // ページ全体のスクリーンショット
    await page.screenshot({ path: 'screenshots/dashboard.png' });
  });

  test('フルページスクリーンショット（スクロール含む）', async ({ page }) => {
    await page.goto('/users');

    // fullPage: スクロール範囲も含めた全体
    await page.screenshot({ path: 'screenshots/users-full.png', fullPage: true });
  });

  test('特定の要素のスクリーンショット', async ({ page }) => {
    await page.goto('/dashboard');

    // 特定の要素だけキャプチャ
    const statsGrid = page.locator('.stats-grid');
    await statsGrid.screenshot({ path: 'screenshots/stats-grid.png' });
  });

  test('各ページのスクリーンショットを一括取得', async ({ page }) => {
    const pages = [
      { name: 'dashboard', url: '/dashboard' },
      { name: 'users', url: '/users' },
      { name: 'products', url: '/products' },
      { name: 'orders', url: '/orders' },
      { name: 'settings', url: '/settings/general' },
    ];

    for (const p of pages) {
      await page.goto(p.url);
      await page.screenshot({ path: `screenshots/${p.name}.png` });
    }
  });

  test('toHaveScreenshot - ビジュアルリグレッションテスト', async ({ page }) => {
    await page.goto('/dashboard');

    // 初回実行時はスナップショットを作成、2回目以降は比較
    // await expect(page).toHaveScreenshot('dashboard.png');

    // 特定の要素のスナップショット
    // await expect(page.locator('.stats-grid')).toHaveScreenshot('stats-grid.png');
  });
});
