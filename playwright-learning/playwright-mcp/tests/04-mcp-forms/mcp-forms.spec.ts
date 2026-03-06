/**
 * レッスン04: MCP フォーム操作
 *
 * AIエージェントのフォーム操作フロー:
 * 1. browser_snapshot でフォーム構造を確認
 * 2. 各フィールドのref番号を特定
 * 3. browser_type / browser_select_option / browser_click で入力
 * 4. browser_click で送信
 * 5. browser_snapshot で結果を確認
 */
import { test, expect } from '@playwright/test';

test.describe('MCPフォーム操作パターン', () => {
  test('AIエージェントのフォーム入力フロー全体', async ({ page }) => {
    // Step 1: フォームページに移動
    await page.goto('/users/new');

    // Step 2: snapshotでフォーム構造を把握
    let snapshot = await page.accessibility.snapshot();
    console.log('Form fields found in snapshot');

    // Step 3: 各フィールドに入力 (browser_type相当)
    await page.getByLabel('名前').fill('MCP テストユーザー');
    await page.getByLabel('メール').fill('mcp-test@example.com');
    await page.getByLabel('部署').fill('MCP開発部');

    // Step 4: セレクト (browser_select_option相当)
    await page.getByLabel('ロール').selectOption('editor');

    // Step 5: 入力後のsnapshotで値を確認
    snapshot = await page.accessibility.snapshot();

    // Step 6: 送信 (browser_click相当)
    await page.getByRole('button', { name: '保存' }).click();

    // Step 7: 結果確認のsnapshot
    await expect(page).toHaveURL(/\/users$/);
    snapshot = await page.accessibility.snapshot();
    console.log('After submit - navigated to user list');
  });

  test('バリデーションエラーの検知と修正', async ({ page }) => {
    await page.goto('/users/new');

    // Step 1: 空のフォームを送信
    await page.getByRole('button', { name: '保存' }).click();

    // Step 2: snapshotでエラー状態を検知
    const snapshot = await page.accessibility.snapshot();
    // AIはaria-invalid="true"やrole="alert"でエラーを検知

    // Step 3: エラーメッセージを読み取る
    const errors = page.getByRole('alert');
    const errorCount = await errors.count();
    console.log(`Detected ${errorCount} validation errors`);

    for (let i = 0; i < errorCount; i++) {
      const text = await errors.nth(i).textContent();
      console.log(`  Error ${i + 1}: ${text}`);
    }

    // Step 4: エラーを修正
    await page.getByLabel('名前').fill('修正ユーザー');
    await page.getByLabel('メール').fill('fix@example.com');
    await page.getByLabel('部署').fill('修正部');

    // Step 5: 再送信
    await page.getByRole('button', { name: '保存' }).click();
    await expect(page).toHaveURL(/\/users$/);
  });

  test('設定の切り替え操作', async ({ page }) => {
    await page.goto('/settings/notifications');

    // MCPでのtoggle操作: browser_clickで切り替え
    const toggle = page.getByLabel('メール通知');
    const before = await toggle.isChecked();
    console.log('Before toggle:', before);

    await toggle.click();

    const after = await toggle.isChecked();
    console.log('After toggle:', after);
    expect(after).toBe(!before);
  });

  test('検索操作フロー', async ({ page }) => {
    await page.goto('/products');

    // Step 1: 検索ボックスに入力
    await page.getByLabel('商品検索').fill('コーヒー');

    // Step 2: 検索ボタンをクリック
    await page.getByRole('button', { name: '検索' }).click();

    // Step 3: 結果をsnapshotで確認
    const snapshot = await page.accessibility.snapshot();
    await expect(page.getByText('コーヒー豆セット')).toBeVisible();
    console.log('Search results displayed');
  });
});
