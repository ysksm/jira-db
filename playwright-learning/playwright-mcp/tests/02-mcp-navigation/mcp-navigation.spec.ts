/**
 * レッスン02: MCP ナビゲーション
 *
 * MCPでのナビゲーション操作:
 * - browser_navigate: URLに直接移動
 * - browser_click: リンクやボタンのクリックによる遷移
 * - browser_go_back / browser_go_forward: ブラウザの戻る・進む
 *
 * AIエージェントはsnapshotで現在のページ構造を確認し、
 * ref番号を使って操作対象を特定する
 */
import { test, expect } from '@playwright/test';

test.describe('MCPナビゲーションパターン', () => {
  test('Step-by-step: AIが行うナビゲーションフロー', async ({ page }) => {
    // Step 1: AIがbrowser_navigateでアプリにアクセス
    await page.goto('/');
    await expect(page).toHaveURL(/dashboard/);

    // Step 2: AIがbrowser_snapshotでページ構造を確認
    const snapshot1 = await page.accessibility.snapshot();
    expect(snapshot1).toBeTruthy();

    // Step 3: AIがsnapshotからメニュー項目のrefを見つけてクリック
    await page.getByRole('menuitem', { name: '商品管理' }).click();
    await expect(page).toHaveURL(/products/);

    // Step 4: AIが再度snapshotで新しいページ構造を確認
    const snapshot2 = await page.accessibility.snapshot();
    expect(snapshot2).toBeTruthy();

    // Step 5: AIがリンクをクリックして詳細に遷移
    await page.getByRole('link', { name: 'ノートPC Pro' }).click();
    await expect(page).toHaveURL(/products\/p1/);
  });

  test('深い階層への段階的ナビゲーション', async ({ page }) => {
    // AIは各ステップでsnapshotを取り、次のアクションを決める

    // Level 1
    await page.goto('/products');
    let snapshot = await page.accessibility.snapshot();
    console.log('Level 1 - 商品一覧:', snapshot?.children?.length, 'children');

    // Level 2
    await page.getByRole('link', { name: 'ノートPC Pro' }).click();
    snapshot = await page.accessibility.snapshot();
    console.log('Level 2 - 商品詳細:', snapshot?.children?.length, 'children');

    // Level 3
    await page.getByRole('button', { name: 'バリエーション管理' }).click();
    snapshot = await page.accessibility.snapshot();
    console.log('Level 3 - バリエーション一覧:', snapshot?.children?.length, 'children');

    // Level 4
    await page.getByRole('link', { name: '16GB/512GB' }).click();
    snapshot = await page.accessibility.snapshot();
    console.log('Level 4 - バリエーション詳細:', snapshot?.children?.length, 'children');

    await expect(page.getByText('NPC-16-512')).toBeVisible();
  });

  test('戻る・進む操作', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('menuitem', { name: 'ユーザー管理' }).click();
    await page.getByRole('link', { name: '田中太郎' }).click();

    // browser_go_back相当
    await page.goBack();
    await expect(page).toHaveURL(/\/users$/);

    // browser_go_forward相当
    await page.goForward();
    await expect(page).toHaveURL(/users\/u1/);
  });
});
