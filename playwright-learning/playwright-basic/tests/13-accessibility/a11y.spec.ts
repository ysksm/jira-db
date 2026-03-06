/**
 * レッスン13: アクセシビリティ（a11y）テスト
 *
 * 学習ポイント:
 * - ARIAロールの検証
 * - aria-label / aria-labelledby の検証
 * - キーボードナビゲーション
 * - フォーカス管理
 * - スクリーンリーダー対応の確認
 * - スキップリンク
 * - ライブリージョン
 */
import { test, expect } from '@playwright/test';

test.describe('アクセシビリティテスト', () => {
  test('ナビゲーションのARIAラベル', async ({ page }) => {
    await page.goto('/dashboard');

    // nav要素にaria-labelがある
    const nav = page.getByLabel('メインナビゲーション');
    await expect(nav).toBeVisible();

    // menubar ロール
    const menubar = page.getByRole('menubar', { name: 'メインメニュー' });
    await expect(menubar).toBeVisible();
  });

  test('メインコンテンツのランドマーク', async ({ page }) => {
    await page.goto('/dashboard');

    // main ロール
    const main = page.getByRole('main', { name: 'メインコンテンツ' });
    await expect(main).toBeVisible();
  });

  test('スキップリンク', async ({ page }) => {
    await page.goto('/dashboard');

    // スキップリンクにフォーカスすると表示される
    const skipLink = page.locator('.skip-link');
    await skipLink.focus();

    // メインコンテンツにスキップ
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('テーブルのアクセシビリティ', async ({ page }) => {
    await page.goto('/users');

    // テーブルにaria-labelがある
    const table = page.getByRole('table', { name: 'ユーザー一覧' });
    await expect(table).toBeVisible();

    // th にscope属性がある
    const headers = table.getByRole('columnheader');
    expect(await headers.count()).toBeGreaterThan(0);
  });

  test('フォームのアクセシビリティ', async ({ page }) => {
    await page.goto('/users/new');

    // フォームにaria-labelがある
    const form = page.getByRole('form', { name: 'ユーザーフォーム' });
    await expect(form).toBeVisible();

    // 必須フィールドにaria-requiredがある
    await expect(page.getByLabel('名前')).toHaveAttribute('aria-required', 'true');
    await expect(page.getByLabel('メール')).toHaveAttribute('aria-required', 'true');
  });

  test('エラー状態のアクセシビリティ', async ({ page }) => {
    await page.goto('/users/new');

    // 空で送信
    await page.getByRole('button', { name: '保存' }).click();

    // aria-invalid が true になる
    await expect(page.getByLabel('名前')).toHaveAttribute('aria-invalid', 'true');

    // エラーメッセージが role="alert" で表示される
    const alerts = page.getByRole('alert');
    expect(await alerts.count()).toBeGreaterThan(0);

    // aria-describedby でエラーメッセージと関連付けられている
    await expect(page.getByLabel('名前')).toHaveAttribute('aria-describedby', 'name-error');
  });

  test('キーボードナビゲーション - Tab移動', async ({ page }) => {
    await page.goto('/users/new');

    // Tabキーでフォームフィールド間を移動
    await page.getByLabel('名前').focus();
    await expect(page.getByLabel('名前')).toBeFocused();

    await page.keyboard.press('Tab');
    // 次のフォーム要素にフォーカスが移る
    // (ブラウザのTab順序に依存)
  });

  test('ライブリージョン (aria-live)', async ({ page }) => {
    await page.goto('/users');

    // フィルター変更後、結果カウントが自動的に読み上げられる
    await page.getByLabel('ロールでフィルター').selectOption('admin');

    const liveRegion = page.getByRole('status');
    await expect(liveRegion).toContainText('1件');
  });

  test('パンくずリストのアクセシビリティ', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('link', { name: 'ノートPC Pro' }).click();

    // パンくずリストにaria-labelがある
    const breadcrumb = page.getByLabel('パンくずリスト');
    await expect(breadcrumb).toBeVisible();

    // aria-current="page" が最後のアイテムにある
    const currentItem = breadcrumb.locator('[aria-current="page"]');
    await expect(currentItem).toBeVisible();
  });

  test('設定ページのタブのARIA', async ({ page }) => {
    await page.goto('/settings/general');

    // tablist ロール
    const tablist = page.getByRole('tablist', { name: '設定カテゴリ' });
    await expect(tablist).toBeVisible();

    // aria-selected
    const activeTab = page.getByRole('tab', { name: '一般設定' });
    await expect(activeTab).toHaveAttribute('aria-selected', 'true');
  });

  test('削除ボタンのaria-label', async ({ page }) => {
    await page.goto('/users');

    // 削除ボタンが誰を削除するか明確
    const deleteBtn = page.getByRole('button', { name: '田中太郎を削除' });
    await expect(deleteBtn).toBeVisible();
  });
});
