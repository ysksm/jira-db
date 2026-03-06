/**
 * レッスン15: 高度なテクニック
 *
 * 学習ポイント:
 * - test.describe.serial: 順序付きテスト
 * - test.step: テスト内のステップ
 * - テストのタグ付け
 * - 条件付きテスト
 * - 複数ページの操作
 * - テストのパラメータ化
 */
import { test, expect } from '@playwright/test';

// test.step: テスト内のステップを明確にする
test('注文のステータス更新フロー', async ({ page }) => {
  await test.step('注文一覧ページに移動', async () => {
    await page.goto('/orders');
    await expect(page.getByRole('heading', { name: '注文管理' })).toBeVisible();
  });

  await test.step('保留中の注文を選択', async () => {
    await page.getByRole('link', { name: 'ord-004' }).click();
    await expect(page).toHaveURL(/orders\/ord-004/);
  });

  await test.step('注文を確認', async () => {
    await page.getByRole('button', { name: '確認' }).click();
    await expect(page.getByText('確認済')).toBeVisible();
  });
});

// パラメータ化テスト
const menuTests = [
  { name: 'ダッシュボード', url: /dashboard/, heading: 'ダッシュボード' },
  { name: 'ユーザー管理', url: /users/, heading: 'ユーザー管理' },
  { name: '商品管理', url: /products/, heading: '商品管理' },
  { name: '注文管理', url: /orders/, heading: '注文管理' },
];

for (const menuTest of menuTests) {
  test(`メニュー遷移: ${menuTest.name}`, async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('menuitem', { name: menuTest.name }).click();
    await expect(page).toHaveURL(menuTest.url);
    await expect(page.getByRole('heading', { name: menuTest.heading })).toBeVisible();
  });
}

// 複数のdescribeによるグループ化
test.describe('注文管理の高度なテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/orders');
  });

  test('全タブの注文数の整合性確認', async ({ page }) => {
    // すべてのタブを回って合計が一致するか
    await page.getByRole('tab', { name: 'すべて' }).click();
    const allCountText = await page.getByRole('status').textContent();
    const allCount = parseInt(allCountText?.match(/\d+/)?.[0] || '0');

    await page.getByRole('tab', { name: '進行中' }).click();
    const activeCountText = await page.getByRole('status').textContent();
    const activeCount = parseInt(activeCountText?.match(/\d+/)?.[0] || '0');

    await page.getByRole('tab', { name: '完了' }).click();
    const completedCountText = await page.getByRole('status').textContent();
    const completedCount = parseInt(completedCountText?.match(/\d+/)?.[0] || '0');

    expect(activeCount + completedCount).toBe(allCount);
  });
});

// E2Eシナリオテスト
test('ダッシュボードからのE2Eフロー', async ({ page }) => {
  await test.step('ダッシュボードを確認', async () => {
    await page.goto('/dashboard');
    await expect(page.locator('.stat-card')).toHaveCount(4);
  });

  await test.step('レポートページに移動', async () => {
    await page.getByRole('button', { name: 'レポート表示' }).click();
    await expect(page).toHaveURL(/dashboard\/reports/);
  });

  await test.step('注文ステータス別集計を確認', async () => {
    await expect(page.getByText('注文ステータス別')).toBeVisible();
  });

  await test.step('ダッシュボードに戻る', async () => {
    await page.getByLabel('パンくずリスト').getByRole('link', { name: 'ダッシュボード' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });
});
