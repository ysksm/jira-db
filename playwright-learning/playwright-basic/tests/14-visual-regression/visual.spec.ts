/**
 * レッスン14: ビジュアルリグレッションテスト
 *
 * 学習ポイント:
 * - toHaveScreenshot: スナップショット比較
 * - maxDiffPixels: 許容ピクセル差
 * - threshold: 色の差の閾値
 * - mask: 動的コンテンツのマスク
 *
 * 注: 初回実行時にスナップショットが作成され、
 * 2回目以降で比較が行われます。
 * --update-snapshots フラグで更新できます。
 */
import { test, expect } from '@playwright/test';

test.describe('ビジュアルリグレッションテスト', () => {
  // コメントアウトされた例（初回実行後にコメントを外して使う）

  test.skip('ダッシュボード全体のスナップショット', async ({ page }) => {
    await page.goto('/dashboard');

    // 初回: スナップショットを作成
    // 2回目以降: 前回と比較
    await expect(page).toHaveScreenshot('dashboard-full.png', {
      fullPage: true,
    });
  });

  test.skip('統計カードのスナップショット', async ({ page }) => {
    await page.goto('/dashboard');

    const statsGrid = page.locator('.stats-grid');
    await expect(statsGrid).toHaveScreenshot('stats-grid.png');
  });

  test.skip('ユーザー一覧テーブルのスナップショット', async ({ page }) => {
    await page.goto('/users');

    // 動的な日付やIDをマスクして比較
    await expect(page.getByRole('table', { name: 'ユーザー一覧' })).toHaveScreenshot('user-table.png', {
      // maxDiffPixels: 100, // 100ピクセルまでの差を許容
      // threshold: 0.2, // 色の差の閾値（0-1）
    });
  });

  test.skip('フォームのスナップショット', async ({ page }) => {
    await page.goto('/users/new');

    await expect(page.getByRole('form', { name: 'ユーザーフォーム' })).toHaveScreenshot('user-form.png');
  });

  test.skip('エラー状態のスナップショット', async ({ page }) => {
    await page.goto('/users/new');
    await page.getByRole('button', { name: '保存' }).click();

    // エラー状態のスナップショット
    await expect(page.getByRole('form', { name: 'ユーザーフォーム' })).toHaveScreenshot('user-form-error.png');
  });

  // 実行可能なテスト例
  test('スクリーンショットの基本的な使い方（保存のみ）', async ({ page }) => {
    await page.goto('/dashboard');

    // バッファとして取得（ファイルに保存しない）
    const buffer = await page.screenshot();
    expect(buffer.length).toBeGreaterThan(0);

    // PNGとして保存
    await page.screenshot({
      path: 'screenshots/visual-test-dashboard.png',
      fullPage: true,
    });
  });
});
