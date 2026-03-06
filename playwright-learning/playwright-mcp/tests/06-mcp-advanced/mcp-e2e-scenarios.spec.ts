/**
 * レッスン06: MCP 高度なシナリオ
 *
 * AIエージェントが実際に行うような複合的な操作シナリオ:
 * 1. ページの確認 → 操作 → 結果確認のサイクル
 * 2. 複数ページにまたがるワークフロー
 * 3. エラーハンドリングとリカバリ
 *
 * MCP設定例（claude_desktop_config.json）:
 * {
 *   "mcpServers": {
 *     "playwright": {
 *       "command": "npx",
 *       "args": ["@playwright/mcp@latest"]
 *     }
 *   }
 * }
 */
import { test, expect } from '@playwright/test';

test.describe('MCP E2Eシナリオ', () => {
  test('シナリオ1: ユーザー作成フロー', async ({ page }) => {
    // AI: "新しいユーザーを作成してください"

    // AI Step 1: ナビゲーション
    await page.goto('/dashboard');
    await page.getByRole('menuitem', { name: 'ユーザー管理' }).click();

    // AI Step 2: 新規作成ボタンを探してクリック
    await page.getByRole('button', { name: '新規ユーザー' }).click();
    await expect(page).toHaveURL(/users\/new/);

    // AI Step 3: フォームを入力
    await page.getByLabel('名前').fill('AI作成ユーザー');
    await page.getByLabel('メール').fill('ai-created@example.com');
    await page.getByLabel('ロール').selectOption('viewer');
    await page.getByLabel('部署').fill('AI部門');

    // AI Step 4: 保存
    await page.getByRole('button', { name: '保存' }).click();
    await expect(page).toHaveURL(/\/users$/);

    // AI Step 5: 結果を確認
    await expect(page.getByText('AI作成ユーザー')).toBeVisible();
  });

  test('シナリオ2: 商品情報の調査（読み取りフロー）', async ({ page }) => {
    // AI: "ノートPC Proの詳細情報を教えてください"

    // Step 1: 商品一覧を開く
    await page.goto('/products');

    // Step 2: snapshotで商品リストを確認
    let snapshot = await page.accessibility.snapshot();
    const snapshotText = JSON.stringify(snapshot);
    expect(snapshotText).toContain('ノートPC Pro');

    // Step 3: 商品詳細に遷移
    await page.getByRole('link', { name: 'ノートPC Pro' }).click();

    // Step 4: 詳細情報を読み取る
    snapshot = await page.accessibility.snapshot();
    const detailText = JSON.stringify(snapshot);

    expect(detailText).toContain('electronics');
    expect(detailText).toContain('198,000');

    // Step 5: バリエーション情報も確認
    await expect(page.getByText('16GB/512GB')).toBeVisible();
    await expect(page.getByText('32GB/1TB')).toBeVisible();
  });

  test('シナリオ3: 注文のステータス更新', async ({ page }) => {
    // AI: "注文ord-004を確認済みにしてください"

    // Step 1: 注文詳細に移動
    await page.goto('/orders/ord-004');

    // Step 2: 現在のステータスを確認
    await expect(page.getByText('保留中')).toBeVisible();

    // Step 3: ステータスを更新
    await page.getByRole('button', { name: '確認' }).click();

    // Step 4: 更新結果を確認
    await expect(page.getByText('確認済')).toBeVisible();
  });

  test('シナリオ4: 複数ページにまたがる情報収集', async ({ page }) => {
    // AI: "ダッシュボードの統計と注文の詳細を教えてください"

    // Step 1: ダッシュボードから統計を取得
    await page.goto('/dashboard');
    const stats = page.locator('.stat-card');
    const statCount = await stats.count();
    const statData: Array<{ label: string; value: string }> = [];
    for (let i = 0; i < statCount; i++) {
      const label = await stats.nth(i).locator('.stat-label').textContent() || '';
      const value = await stats.nth(i).locator('.stat-value').textContent() || '';
      statData.push({ label, value });
    }
    console.log('Dashboard stats:', statData);

    // Step 2: 注文一覧で詳細を取得
    await page.getByRole('menuitem', { name: '注文管理' }).click();
    const orderRows = page.getByRole('table', { name: '注文一覧' }).getByRole('row');
    const orderCount = await orderRows.count();
    console.log('Total order rows (including header):', orderCount);

    // Step 3: 最初の注文の詳細を取得
    await page.getByRole('link', { name: 'ord-001' }).click();
    await expect(page.getByText('鈴木花子')).toBeVisible();
  });

  test('シナリオ5: 設定の変更と確認', async ({ page }) => {
    // AI: "通知設定を変更してください"

    // Step 1: 設定ページに移動
    await page.goto('/settings');

    // Step 2: 通知タブを選択
    await page.getByRole('tab', { name: '通知設定' }).click();
    await expect(page).toHaveURL(/settings\/notifications/);

    // Step 3: 現在の設定をsnapshot確認
    let snapshot = await page.accessibility.snapshot();

    // Step 4: 在庫アラートをONに変更
    const stockToggle = page.getByLabel('在庫アラート');
    const wasBefore = await stockToggle.isChecked();
    await stockToggle.click();

    // Step 5: 変更結果を確認
    const isAfter = await stockToggle.isChecked();
    expect(isAfter).toBe(!wasBefore);

    // Step 6: 保存メッセージの確認
    await expect(page.getByRole('status')).toContainText('保存しました');
  });
});
