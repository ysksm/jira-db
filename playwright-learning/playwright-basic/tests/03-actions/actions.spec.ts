/**
 * レッスン03: アクション（ユーザー操作のシミュレーション）
 *
 * 学習ポイント:
 * - click: クリック操作
 * - fill: テキスト入力
 * - selectOption: セレクトボックスの選択
 * - check/uncheck: チェックボックス操作
 * - hover: ホバー操作
 * - keyboard: キーボード操作
 * - type: 一文字ずつ入力
 */
import { test, expect } from '@playwright/test';

test.describe('アクション学習', () => {
  test('click - クリック操作', async ({ page }) => {
    await page.goto('/dashboard');

    // ナビゲーションリンクをクリック
    await page.getByRole('menuitem', { name: 'ユーザー管理' }).click();
    await expect(page).toHaveURL(/users/);

    // ボタンのクリック
    await page.getByRole('button', { name: '新規ユーザー' }).click();
    await expect(page).toHaveURL(/users\/new/);
  });

  test('fill - テキスト入力', async ({ page }) => {
    await page.goto('/users/new');

    // fill: 既存の値をクリアして入力
    await page.getByLabel('名前').fill('テストユーザー');
    await expect(page.getByLabel('名前')).toHaveValue('テストユーザー');

    await page.getByLabel('メール').fill('test@example.com');
    await expect(page.getByLabel('メール')).toHaveValue('test@example.com');
  });

  test('selectOption - セレクトボックス', async ({ page }) => {
    await page.goto('/users/new');

    // 値で選択
    await page.getByLabel('ロール').selectOption('editor');
    await expect(page.getByLabel('ロール')).toHaveValue('editor');

    // ラベルで選択
    await page.getByLabel('ロール').selectOption({ label: '管理者' });
    await expect(page.getByLabel('ロール')).toHaveValue('admin');
  });

  test('check/uncheck - チェックボックス操作', async ({ page }) => {
    await page.goto('/settings/notifications');

    // toggle switchはチェックボックスとして操作
    const emailToggle = page.getByLabel('メール通知');

    // 現在の状態を確認してからトグル
    if (await emailToggle.isChecked()) {
      await emailToggle.uncheck();
      await expect(emailToggle).not.toBeChecked();
    } else {
      await emailToggle.check();
      await expect(emailToggle).toBeChecked();
    }
  });

  test('keyboard - キーボード操作', async ({ page }) => {
    await page.goto('/products');

    // 検索ボックスにフォーカスして入力
    const searchInput = page.getByLabel('商品検索');
    await searchInput.click();

    // press: キーを押す
    await searchInput.fill('ノート');
    await page.keyboard.press('Enter');

    // 検索結果を確認
    await expect(page.getByText('ノートPC')).toBeVisible();
  });

  test('selectOption - フィルタの選択操作', async ({ page }) => {
    await page.goto('/users');

    // フィルターを選択
    await page.getByLabel('ロールでフィルター').selectOption('admin');

    // 結果を確認
    await expect(page.getByText('田中太郎')).toBeVisible();
  });

  test('連続操作 - フォーム入力から送信まで', async ({ page }) => {
    await page.goto('/users/new');

    // フォーム入力
    await page.getByLabel('名前').fill('新しいユーザー');
    await page.getByLabel('メール').fill('newuser@example.com');
    await page.getByLabel('ロール').selectOption('editor');
    await page.getByLabel('部署').fill('テスト部');

    // 送信ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();

    // ユーザー一覧に戻ることを確認
    await expect(page).toHaveURL(/\/users$/);
  });
});
