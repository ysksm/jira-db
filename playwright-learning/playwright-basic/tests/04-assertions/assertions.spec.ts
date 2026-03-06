/**
 * レッスン04: アサーション（検証方法）
 *
 * 学習ポイント:
 * - toBeVisible / toBeHidden: 表示・非表示の検証
 * - toHaveText / toContainText: テキストの検証
 * - toHaveValue: 入力値の検証
 * - toHaveAttribute: 属性の検証
 * - toHaveClass: CSSクラスの検証
 * - toHaveCount: 要素数の検証
 * - toHaveURL: URLの検証
 * - not: 否定アサーション
 * - soft: ソフトアサーション（失敗してもテスト続行）
 */
import { test, expect } from '@playwright/test';

test.describe('アサーション学習', () => {
  test('表示・非表示の検証', async ({ page }) => {
    await page.goto('/dashboard');

    // toBeVisible: 要素が表示されていることを確認
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();

    // toBeHidden: 存在しない要素が非表示であることを確認
    await expect(page.getByRole('heading', { name: '存在しないページ' })).toBeHidden();
  });

  test('テキストの検証', async ({ page }) => {
    await page.goto('/dashboard');

    // toHaveText: 正確なテキスト一致
    await expect(page.locator('.stat-label').first()).toHaveText('ユーザー数');

    // toContainText: 部分テキスト一致
    await expect(page.locator('.card').first()).toContainText('ユーザー');

    // 正規表現
    await expect(page.locator('.stat-value').first()).toHaveText(/\d+/);
  });

  test('入力値の検証', async ({ page }) => {
    await page.goto('/users/new');

    await page.getByLabel('名前').fill('テスト');

    // toHaveValue: 入力値の確認
    await expect(page.getByLabel('名前')).toHaveValue('テスト');

    // 空の入力
    await expect(page.getByLabel('メール')).toHaveValue('');
  });

  test('属性の検証', async ({ page }) => {
    await page.goto('/users/new');

    // toHaveAttribute: HTML属性の確認
    await expect(page.getByLabel('名前')).toHaveAttribute('aria-required', 'true');
    await expect(page.getByLabel('メール')).toHaveAttribute('type', 'email');
  });

  test('CSSクラスの検証', async ({ page }) => {
    await page.goto('/users');

    // toHaveClass: CSSクラスの確認
    const badge = page.locator('.badge').first();
    await expect(badge).toHaveClass(/badge-/);
  });

  test('要素数の検証', async ({ page }) => {
    await page.goto('/users');

    // toHaveCount: 要素の数
    const rows = page.getByTestId(/user-row/);
    await expect(rows).toHaveCount(5);
  });

  test('URLの検証', async ({ page }) => {
    await page.goto('/dashboard');

    // toHaveURL: 文字列
    await expect(page).toHaveURL(/dashboard/);

    // ナビゲーション後
    await page.getByRole('menuitem', { name: 'ユーザー管理' }).click();
    await expect(page).toHaveURL(/users/);
  });

  test('否定アサーション (not)', async ({ page }) => {
    await page.goto('/dashboard');

    // not: 否定
    await expect(page.getByText('エラーが発生しました')).not.toBeVisible();
    await expect(page).not.toHaveURL(/error/);
  });

  test('ソフトアサーション', async ({ page }) => {
    await page.goto('/dashboard');

    // expect.soft: 失敗してもテストを続行する
    await expect.soft(page.getByText('ユーザー数')).toBeVisible();
    await expect.soft(page.getByText('商品数')).toBeVisible();
    await expect.soft(page.getByText('注文数')).toBeVisible();
    await expect.soft(page.getByText('売上合計')).toBeVisible();
  });
});
