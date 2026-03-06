/**
 * レッスン01: Playwright基本 - 最初のテスト
 *
 * 学習ポイント:
 * - test() 関数の使い方
 * - page.goto() でページに移動
 * - expect() でアサーション
 * - テストのタイトルの付け方
 */
import { test, expect } from '@playwright/test';

test.describe('基本的なテスト', () => {
  test('アプリが起動してダッシュボードが表示される', async ({ page }) => {
    // goto: URLに移動
    await page.goto('/');

    // ダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL(/dashboard/);
  });

  test('ページのタイトルを確認する', async ({ page }) => {
    await page.goto('/');

    // toHaveTitle: ページタイトルの検証
    await expect(page).toHaveTitle(/Playwright学習用アプリ/);
  });

  test('ダッシュボードの見出しが表示される', async ({ page }) => {
    await page.goto('/dashboard');

    // getByRole: ロールで要素を取得（ARIA対応）
    const heading = page.getByRole('heading', { name: 'ダッシュボード' });
    await expect(heading).toBeVisible();
  });

  test('統計情報が4つ表示される', async ({ page }) => {
    await page.goto('/dashboard');

    // locator: CSSセレクターで要素を取得
    const statCards = page.locator('.stat-card');

    // toHaveCount: 要素の数を検証
    await expect(statCards).toHaveCount(4);
  });
});
