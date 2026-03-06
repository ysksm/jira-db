/**
 * レッスン08: 待機とタイミング
 *
 * 学習ポイント:
 * - 自動待機（Auto-waiting）の仕組み
 * - waitForSelector: 要素の出現を待つ
 * - waitForURL: URLの遷移を待つ
 * - waitForLoadState: ページ読み込み完了を待つ
 * - aria-live のライブリージョンの検知
 */
import { test, expect } from '@playwright/test';

test.describe('待機とタイミング学習', () => {
  test('自動待機 - Playwrightは自動的に要素の表示を待つ', async ({ page }) => {
    await page.goto('/users');

    // Playwrightは要素が表示されるまで自動で待機する
    // 明示的なwaitは通常不要
    const heading = page.getByRole('heading', { name: 'ユーザー管理' });
    await expect(heading).toBeVisible();
  });

  test('waitForURL - URL遷移の待機', async ({ page }) => {
    await page.goto('/users/new');

    await page.getByLabel('名前').fill('テスト');
    await page.getByLabel('メール').fill('test@example.com');
    await page.getByLabel('部署').fill('テスト部');
    await page.getByRole('button', { name: '保存' }).click();

    // URLの遷移を明示的に待つ
    await page.waitForURL(/\/users$/);
    await expect(page).toHaveURL(/\/users$/);
  });

  test('waitForLoadState - ページ読み込み完了の待機', async ({ page }) => {
    await page.goto('/dashboard');

    // ネットワークがアイドルになるまで待機
    await page.waitForLoadState('networkidle');

    // ページが完全に読み込まれた状態で検証
    await expect(page.getByText('ユーザー数')).toBeVisible();
  });

  test('aria-live リージョンの変更を検知', async ({ page }) => {
    await page.goto('/users');

    // フィルターを変更してlive regionの更新を確認
    await page.getByLabel('ロールでフィルター').selectOption('admin');

    // role="status" のaria-liveリージョンが更新される
    await expect(page.getByRole('status')).toContainText('1件のユーザー');
  });

  test('保存後のステータスメッセージ', async ({ page }) => {
    await page.goto('/settings/general');

    await page.getByLabel('サイト名').fill('テスト');
    await page.getByRole('button', { name: '保存' }).click();

    // ステータスメッセージが表示される
    const statusMsg = page.getByRole('status');
    await expect(statusMsg).toContainText('保存しました');
  });
});
