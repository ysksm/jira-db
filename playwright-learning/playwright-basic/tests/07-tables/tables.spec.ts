/**
 * レッスン07: テーブル操作
 *
 * 学習ポイント:
 * - テーブルの行・列の取得
 * - テーブルの検索・フィルタリング
 * - テーブルの行数の確認
 * - 特定のセルの値の確認
 */
import { test, expect } from '@playwright/test';

test.describe('テーブル操作学習', () => {
  test('テーブルの行数を確認', async ({ page }) => {
    await page.goto('/users');

    const table = page.getByRole('table', { name: 'ユーザー一覧' });
    const rows = table.getByRole('row');

    // ヘッダー行 + データ行5件 = 6
    await expect(rows).toHaveCount(6);
  });

  test('テーブルのヘッダーを確認', async ({ page }) => {
    await page.goto('/users');

    const headers = page.getByRole('columnheader');
    await expect(headers).toHaveCount(6);
    await expect(headers.nth(0)).toHaveText('名前');
    await expect(headers.nth(1)).toHaveText('メール');
    await expect(headers.nth(2)).toHaveText('ロール');
  });

  test('テーブルの特定の行のデータを確認', async ({ page }) => {
    await page.goto('/users');

    // data-testidで特定の行を取得
    const row = page.getByTestId('user-row-u1');
    await expect(row).toContainText('田中太郎');
    await expect(row).toContainText('tanaka@example.com');
    await expect(row).toContainText('admin');
  });

  test('テーブルの検索フィルタリング', async ({ page }) => {
    await page.goto('/users');

    // 検索
    await page.getByLabel('ユーザー検索').fill('田中');

    // フィルタ結果を確認
    await expect(page.getByTestId('user-row-u1')).toBeVisible();
    // 他のユーザーが表示されないことを確認（ステータスカウントで確認）
    await expect(page.getByText('1件のユーザー')).toBeVisible();
  });

  test('テーブルのセレクトフィルタリング', async ({ page }) => {
    await page.goto('/users');

    // ロールフィルターを選択
    await page.getByLabel('ロールでフィルター').selectOption('editor');

    // 編集者のみ表示される
    await expect(page.getByText('2件のユーザー')).toBeVisible();
  });

  test('注文テーブルのタブ切り替え', async ({ page }) => {
    await page.goto('/orders');

    // 「進行中」タブをクリック
    await page.getByRole('tab', { name: '進行中' }).click();

    // 進行中の注文のみ表示される
    const orderCount = page.getByText(/\d+件の注文/);
    await expect(orderCount).toBeVisible();

    // 「完了」タブ
    await page.getByRole('tab', { name: '完了' }).click();
    await expect(orderCount).toBeVisible();
  });

  test('商品テーブルの検索', async ({ page }) => {
    await page.goto('/products');

    await page.getByLabel('商品検索').fill('コーヒー');
    await page.getByRole('button', { name: '検索' }).click();

    await expect(page.getByText('コーヒー豆セット')).toBeVisible();
  });
});
