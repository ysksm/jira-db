/**
 * レッスン11: フィクスチャ（テストのセットアップ・共有）
 *
 * 学習ポイント:
 * - test.beforeEach / test.afterEach: 各テスト前後の処理
 * - test.beforeAll / test.afterAll: 全テスト前後の処理
 * - test.use: テスト設定のカスタマイズ
 * - カスタムフィクスチャの定義
 */
import { test, expect } from '@playwright/test';

// beforeEach: 各テスト前に実行
test.describe('フィクスチャ学習 - beforeEach', () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前にダッシュボードに移動
    await page.goto('/dashboard');
  });

  test('ダッシュボードにいる', async ({ page }) => {
    await expect(page).toHaveURL(/dashboard/);
  });

  test('統計が表示される', async ({ page }) => {
    await expect(page.locator('.stat-card')).toHaveCount(4);
  });
});

// test.use: テスト固有の設定
test.describe('フィクスチャ学習 - ビューポート設定', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('大画面でのレイアウト確認', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();
  });
});

test.describe('フィクスチャ学習 - モバイルビューポート', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('モバイル画面でのレイアウト確認', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();
  });
});

// 異なるロケール設定
test.describe('フィクスチャ学習 - ロケール設定', () => {
  test.use({ locale: 'en-US' });

  test('英語ロケールでの表示', async ({ page }) => {
    await page.goto('/dashboard');
    // ロケールが変わってもコンテンツ自体は日本語（アプリ内定義のため）
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();
  });
});

// タイムゾーン設定
test.describe('フィクスチャ学習 - タイムゾーン', () => {
  test.use({ timezoneId: 'America/New_York' });

  test('NYタイムゾーンでの表示', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();
  });
});
