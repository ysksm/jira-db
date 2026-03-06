/**
 * レッスン01: Playwright MCP基本
 *
 * Playwright MCPとは:
 * - Model Context Protocol (MCP) を使ってAIエージェントがブラウザを操作する
 * - @playwright/mcp パッケージが提供するMCPサーバー
 * - AI (Claude等) がPlaywrightのツールを呼び出してブラウザを自動操作
 *
 * MCPの主要ツール:
 * - browser_navigate: ページに移動
 * - browser_snapshot: ページの状態をスナップショット（テキストベース）
 * - browser_click: 要素をクリック
 * - browser_type: テキストを入力
 * - browser_select_option: セレクトボックスの選択
 * - browser_take_screenshot: スクリーンショット取得
 *
 * このファイルはMCPの概念を理解するための参考テストです。
 * 実際のMCP操作はAIエージェント経由で行われます。
 */
import { test, expect } from '@playwright/test';

test.describe('MCP概念の理解 - Playwrightの同等操作', () => {
  test('browser_navigate相当: ページに移動', async ({ page }) => {
    // MCPのbrowser_navigateツールは内部的にpage.goto()を呼ぶ
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('browser_snapshot相当: ページのアクセシビリティツリーを取得', async ({ page }) => {
    await page.goto('/dashboard');

    // MCPのbrowser_snapshotはアクセシビリティツリーをテキストで返す
    // Playwrightでは以下のように取得可能
    const snapshot = await page.accessibility.snapshot();
    expect(snapshot).toBeTruthy();
    console.log('Accessibility Tree:', JSON.stringify(snapshot, null, 2).substring(0, 500));
  });

  test('browser_click相当: 要素をクリック', async ({ page }) => {
    await page.goto('/dashboard');

    // MCPではref番号でクリック対象を指定する
    // browser_click({ ref: "menuitem_users" })
    // 内部的には以下と同等:
    await page.getByRole('menuitem', { name: 'ユーザー管理' }).click();
    await expect(page).toHaveURL(/users/);
  });

  test('browser_type相当: テキスト入力', async ({ page }) => {
    await page.goto('/users/new');

    // MCPでは: browser_type({ ref: "name_input", text: "テスト" })
    // 内部的には:
    await page.getByLabel('名前').fill('テスト名前');
    await expect(page.getByLabel('名前')).toHaveValue('テスト名前');
  });

  test('browser_select_option相当: セレクトボックスの選択', async ({ page }) => {
    await page.goto('/users/new');

    // MCPでは: browser_select_option({ ref: "role_select", values: ["editor"] })
    await page.getByLabel('ロール').selectOption('editor');
    await expect(page.getByLabel('ロール')).toHaveValue('editor');
  });

  test('browser_take_screenshot相当: スクリーンショット', async ({ page }) => {
    await page.goto('/dashboard');

    // MCPでは: browser_take_screenshot()
    const screenshot = await page.screenshot();
    expect(screenshot).toBeTruthy();
    expect(screenshot.length).toBeGreaterThan(0);
  });
});
