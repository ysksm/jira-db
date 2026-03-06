/**
 * レッスン06: フォーム操作
 *
 * 学習ポイント:
 * - フォーム入力とバリデーション
 * - フォーム送信
 * - エラーメッセージの確認
 * - フォームのリセット
 * - 複数フィールドの連携
 */
import { test, expect } from '@playwright/test';

test.describe('フォーム操作学習', () => {
  test('ユーザー作成フォームの全フィールド入力', async ({ page }) => {
    await page.goto('/users/new');

    // テキスト入力
    await page.getByLabel('名前').fill('山本一郎');
    await page.getByLabel('メール').fill('yamamoto@example.com');
    await page.getByLabel('部署').fill('技術部');

    // セレクト
    await page.getByLabel('ロール').selectOption('editor');

    // すべての入力値を確認
    await expect(page.getByLabel('名前')).toHaveValue('山本一郎');
    await expect(page.getByLabel('メール')).toHaveValue('yamamoto@example.com');
    await expect(page.getByLabel('部署')).toHaveValue('技術部');
    await expect(page.getByLabel('ロール')).toHaveValue('editor');
  });

  test('バリデーションエラーの表示', async ({ page }) => {
    await page.goto('/users/new');

    // 空のフォームを送信
    await page.getByRole('button', { name: '保存' }).click();

    // エラーメッセージが表示されることを確認
    await expect(page.getByText('名前は必須です')).toBeVisible();
    await expect(page.getByText('有効なメールアドレスを入力してください')).toBeVisible();
    await expect(page.getByText('部署は必須です')).toBeVisible();
  });

  test('aria-invalid属性の確認', async ({ page }) => {
    await page.goto('/users/new');
    await page.getByRole('button', { name: '保存' }).click();

    // エラー時にaria-invalidがtrueになる
    await expect(page.getByLabel('名前')).toHaveAttribute('aria-invalid', 'true');
  });

  test('フォーム入力後にエラーが解消される', async ({ page }) => {
    await page.goto('/users/new');

    // まず空で送信してエラーを出す
    await page.getByRole('button', { name: '保存' }).click();
    await expect(page.getByText('名前は必須です')).toBeVisible();

    // 値を入力して再送信
    await page.getByLabel('名前').fill('テストユーザー');
    await page.getByLabel('メール').fill('test@example.com');
    await page.getByLabel('部署').fill('テスト部');
    await page.getByRole('button', { name: '保存' }).click();

    // エラーが消えてリダイレクトされる
    await expect(page).toHaveURL(/\/users$/);
  });

  test('商品フォームの入力（テキストエリア含む）', async ({ page }) => {
    await page.goto('/products/new');

    await page.getByLabel('商品名').fill('テスト商品');
    await page.getByLabel('説明').fill('これはテスト用の商品です。\n複数行の説明も可能です。');
    await page.getByLabel('カテゴリ').selectOption('electronics');
    await page.getByLabel('基本価格').fill('9800');
    await page.getByLabel('タグ').fill('テスト, サンプル');

    await expect(page.getByLabel('商品名')).toHaveValue('テスト商品');
    await expect(page.getByLabel('基本価格')).toHaveValue('9800');
  });

  test('キャンセルボタンで前のページに戻る', async ({ page }) => {
    await page.goto('/users');
    await page.getByRole('button', { name: '新規ユーザー' }).click();
    await expect(page).toHaveURL(/users\/new/);

    // キャンセル
    await page.getByRole('button', { name: 'キャンセル' }).click();

    // 元のページに戻る
    await expect(page).toHaveURL(/\/users$/);
  });

  test('設定フォームの保存と確認', async ({ page }) => {
    await page.goto('/settings/general');

    // サイト名を変更
    await page.getByLabel('サイト名').fill('テストサイト');
    await page.getByRole('button', { name: '保存' }).click();

    // 保存メッセージが表示される
    await expect(page.getByText('保存しました')).toBeVisible();
  });
});
