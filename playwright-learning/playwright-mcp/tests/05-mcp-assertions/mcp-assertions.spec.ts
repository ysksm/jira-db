/**
 * レッスン05: MCP アサーション（AIの検証方法）
 *
 * AIエージェントはsnapshotを通じて状態を確認する:
 * - ページのURLで遷移を確認
 * - アクセシビリティツリーで要素の存在を確認
 * - テキストコンテンツで値を確認
 * - ARIAステートで状態を確認
 *
 * browser_snapshot と browser_take_screenshot を使い分ける:
 * - snapshot: テキストベースの構造的な確認（高速）
 * - screenshot: 視覚的な確認（レイアウト等）
 */
import { test, expect } from '@playwright/test';

test.describe('MCP アサーションパターン', () => {
  test('snapshotベースの存在確認', async ({ page }) => {
    await page.goto('/dashboard');
    const snapshot = await page.accessibility.snapshot();

    // AIはsnapshotのテキストから要素の存在を確認
    const snapshotText = JSON.stringify(snapshot);
    expect(snapshotText).toContain('ダッシュボード');
    expect(snapshotText).toContain('ユーザー数');
    expect(snapshotText).toContain('商品数');
  });

  test('URL確認による遷移検証', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('menuitem', { name: 'ユーザー管理' }).click();

    // AIはURL変化で遷移成功を確認
    const url = page.url();
    expect(url).toContain('/users');
  });

  test('ARIA状態での検証', async ({ page }) => {
    await page.goto('/settings/general');

    // AIはアクセシビリティツリーのaria-selectedで選択状態を確認
    const generalTab = page.getByRole('tab', { name: '一般設定' });
    const isSelected = await generalTab.getAttribute('aria-selected');
    expect(isSelected).toBe('true');
  });

  test('エラー状態の検証', async ({ page }) => {
    await page.goto('/users/new');
    await page.getByRole('button', { name: '保存' }).click();

    // AIはaria-invalid属性でエラーフィールドを特定
    const nameInvalid = await page.getByLabel('名前').getAttribute('aria-invalid');
    expect(nameInvalid).toBe('true');

    // role="alert"でエラーメッセージを取得
    const alerts = await page.getByRole('alert').allTextContents();
    expect(alerts.length).toBeGreaterThan(0);
    console.log('Error messages:', alerts);
  });

  test('数値の検証（テーブルの行数等）', async ({ page }) => {
    await page.goto('/users');

    // AIはsnapshotからテーブル行数を数える
    const rows = page.getByRole('table', { name: 'ユーザー一覧' }).getByRole('row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(1); // ヘッダー + データ行

    // ステータスカウントのテキストから数値を読み取る
    const statusText = await page.getByRole('status').textContent();
    const match = statusText?.match(/(\d+)件/);
    if (match) {
      console.log(`Found ${match[1]} users`);
      expect(parseInt(match[1])).toBeGreaterThan(0);
    }
  });

  test('スクリーンショットベースの視覚的検証', async ({ page }) => {
    await page.goto('/dashboard');

    // AIはscreenshotで視覚的なレイアウトを確認
    const screenshot = await page.screenshot();
    expect(screenshot).toBeInstanceOf(Buffer);
    expect(screenshot.length).toBeGreaterThan(1000); // 意味のある画像

    // 要素のスクリーンショット
    const statsScreenshot = await page.locator('.stats-grid').screenshot();
    expect(statsScreenshot.length).toBeGreaterThan(0);
  });
});
