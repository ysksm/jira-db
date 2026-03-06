/**
 * レッスン05: ナビゲーション
 *
 * 学習ポイント:
 * - goto: URL移動
 * - goBack / goForward: ブラウザの戻る・進む
 * - waitForURL: URLの待機
 * - ルーティングの遷移テスト
 * - パンくずリストのテスト
 * - 深い階層のナビゲーション
 */
import { test, expect } from '@playwright/test';

test.describe('ナビゲーション学習', () => {
  test('サイドバーメニューでページ遷移', async ({ page }) => {
    await page.goto('/dashboard');

    // 各メニューをクリックして遷移確認
    const menuItems = [
      { name: 'ユーザー管理', url: /users/ },
      { name: '商品管理', url: /products/ },
      { name: '注文管理', url: /orders/ },
      { name: '設定', url: /settings/ },
      { name: 'ダッシュボード', url: /dashboard/ },
    ];

    for (const item of menuItems) {
      await page.getByRole('menuitem', { name: item.name }).click();
      await expect(page).toHaveURL(item.url);
    }
  });

  test('ブラウザの戻る・進む', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('menuitem', { name: 'ユーザー管理' }).click();
    await expect(page).toHaveURL(/users/);

    // 戻る
    await page.goBack();
    await expect(page).toHaveURL(/dashboard/);

    // 進む
    await page.goForward();
    await expect(page).toHaveURL(/users/);
  });

  test('深い階層のナビゲーション（商品 → バリエーション）', async ({ page }) => {
    // Level 1: 商品一覧
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: '商品管理' })).toBeVisible();

    // Level 2: 商品詳細
    await page.getByRole('link', { name: 'ノートPC Pro' }).click();
    await expect(page.getByRole('heading', { name: 'ノートPC Pro' })).toBeVisible();

    // Level 3: バリエーション管理
    await page.getByRole('button', { name: 'バリエーション管理' }).click();
    await expect(page).toHaveURL(/variants/);

    // Level 4: バリエーション詳細
    await page.getByRole('link', { name: '16GB/512GB' }).click();
    await expect(page.getByText('NPC-16-512')).toBeVisible();
  });

  test('パンくずリストによるナビゲーション', async ({ page }) => {
    // 深い階層に直接アクセス
    await page.goto('/products');
    await page.getByRole('link', { name: 'ノートPC Pro' }).click();

    // パンくずリストから戻る
    const breadcrumb = page.getByLabel('パンくずリスト');
    await expect(breadcrumb).toBeVisible();

    await breadcrumb.getByRole('link', { name: '商品管理' }).click();
    await expect(page).toHaveURL(/\/products$/);
  });

  test('ルートURLからのリダイレクト', async ({ page }) => {
    await page.goto('/');

    // / にアクセスすると /dashboard にリダイレクトされる
    await expect(page).toHaveURL(/dashboard/);
  });

  test('設定ページのタブナビゲーション', async ({ page }) => {
    await page.goto('/settings');

    // タブをクリックして遷移
    await page.getByRole('tab', { name: '一般設定' }).click();
    await expect(page).toHaveURL(/settings\/general/);

    await page.getByRole('tab', { name: '通知設定' }).click();
    await expect(page).toHaveURL(/settings\/notifications/);

    await page.getByRole('tab', { name: 'セキュリティ' }).click();
    await expect(page).toHaveURL(/settings\/security/);
  });
});
