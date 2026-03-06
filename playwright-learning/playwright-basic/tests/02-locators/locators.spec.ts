/**
 * レッスン02: ロケーター（要素の特定方法）
 *
 * 学習ポイント:
 * - getByRole: ARIAロールで要素を特定（推奨）
 * - getByText: テキストで要素を特定
 * - getByLabel: ラベルで要素を特定（フォーム向け）
 * - getByPlaceholder: プレースホルダーで要素を特定
 * - getByTestId: data-testidで要素を特定
 * - locator: CSSセレクターで要素を特定
 * - フィルタリング: .filter()
 */
import { test, expect } from '@playwright/test';

test.describe('ロケーター学習', () => {
  test('getByRole - ARIAロールで要素を特定', async ({ page }) => {
    await page.goto('/users');

    // heading ロールで見出しを取得
    const heading = page.getByRole('heading', { name: 'ユーザー管理' });
    await expect(heading).toBeVisible();

    // button ロールでボタンを取得
    const newUserBtn = page.getByRole('button', { name: '新規ユーザー' });
    await expect(newUserBtn).toBeVisible();

    // link ロールでリンクを取得
    const userLinks = page.getByRole('link');
    expect(await userLinks.count()).toBeGreaterThan(0);

    // table ロールでテーブルを取得
    const table = page.getByRole('table', { name: 'ユーザー一覧' });
    await expect(table).toBeVisible();

    // menuitem ロールでナビゲーションアイテムを取得
    const menuItem = page.getByRole('menuitem', { name: 'ユーザー管理' });
    await expect(menuItem).toBeVisible();
  });

  test('getByText - テキストで要素を特定', async ({ page }) => {
    await page.goto('/dashboard');

    // 完全一致
    await expect(page.getByText('ユーザー数')).toBeVisible();

    // 部分一致（デフォルト）
    await expect(page.getByText('ユーザー')).toBeVisible();

    // 正規表現
    await expect(page.getByText(/商品数/)).toBeVisible();
  });

  test('getByLabel - ラベルで入力要素を特定', async ({ page }) => {
    await page.goto('/users/new');

    // label要素に紐づく入力を取得
    const nameInput = page.getByLabel('名前');
    await expect(nameInput).toBeVisible();

    const emailInput = page.getByLabel('メール');
    await expect(emailInput).toBeVisible();

    const roleSelect = page.getByLabel('ロール');
    await expect(roleSelect).toBeVisible();
  });

  test('getByPlaceholder - プレースホルダーで特定', async ({ page }) => {
    await page.goto('/users');

    const searchInput = page.getByPlaceholder('名前・メールで検索');
    await expect(searchInput).toBeVisible();
  });

  test('getByTestId - data-testidで特定', async ({ page }) => {
    await page.goto('/users');

    // data-testid 属性で要素を特定
    const userRow = page.getByTestId('user-row-u1');
    await expect(userRow).toBeVisible();
  });

  test('locator - CSSセレクターで特定', async ({ page }) => {
    await page.goto('/dashboard');

    // CSSセレクター
    const cards = page.locator('.card');
    expect(await cards.count()).toBeGreaterThan(0);

    // 複合セレクター
    const statValues = page.locator('.stat-card .stat-value');
    expect(await statValues.count()).toBe(4);
  });

  test('filter - ロケーターのフィルタリング', async ({ page }) => {
    await page.goto('/users');

    // テーブルの行をフィルター
    const rows = page.getByRole('row');
    const adminRow = rows.filter({ hasText: '田中太郎' });
    await expect(adminRow).toBeVisible();

    // 子要素でフィルター
    const rowWithBadge = rows.filter({
      has: page.locator('.badge-active'),
    });
    expect(await rowWithBadge.count()).toBeGreaterThan(0);
  });

  test('chaining - ロケーターの連鎖', async ({ page }) => {
    await page.goto('/users');

    // 親要素から子要素を特定
    const table = page.getByRole('table', { name: 'ユーザー一覧' });
    const firstRow = table.getByRole('row').nth(1); // 0はヘッダー
    const editBtn = firstRow.getByRole('button', { name: '編集' });
    await expect(editBtn).toBeVisible();
  });
});
