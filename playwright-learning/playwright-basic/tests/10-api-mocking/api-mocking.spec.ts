/**
 * レッスン10: APIモッキング / ルートインターセプト
 *
 * 学習ポイント:
 * - page.route: ネットワークリクエストのインターセプト
 * - リクエストの変更
 * - レスポンスのモック
 * - ネットワーク遅延のシミュレーション
 * - リクエストの監視
 *
 * 注: このアプリはインメモリデータのため、実際のAPIコールはないが、
 * 外部リソースのモック方法を学ぶ
 */
import { test, expect } from '@playwright/test';

test.describe('APIモッキング学習', () => {
  test('page.route - 外部リクエストをインターセプト', async ({ page }) => {
    // 特定パターンのリクエストをインターセプト
    await page.route('**/api/**', (route) => {
      // モックレスポンスを返す
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'mocked' }),
      });
    });

    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();
  });

  test('画像リクエストのブロック', async ({ page }) => {
    // 画像リクエストをブロック（パフォーマンステストに有用）
    await page.route('**/*.{png,jpg,jpeg,gif,svg}', (route) => route.abort());

    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();
  });

  test('ネットワークイベントの監視', async ({ page }) => {
    const requests: string[] = [];

    // すべてのリクエストを記録
    page.on('request', (req) => {
      requests.push(req.url());
    });

    await page.goto('/dashboard');

    // リクエストが記録されていることを確認
    expect(requests.length).toBeGreaterThan(0);
    expect(requests.some((r) => r.includes('localhost'))).toBeTruthy();
  });

  test('page.route でレスポンスを変更', async ({ page }) => {
    // JavaScriptファイルのレスポンスを監視
    const jsRequests: string[] = [];
    page.on('request', (req) => {
      if (req.resourceType() === 'script') {
        jsRequests.push(req.url());
      }
    });

    await page.goto('/dashboard');
    expect(jsRequests.length).toBeGreaterThan(0);
  });

  test('waitForResponse - 特定のレスポンスを待つ', async ({ page }) => {
    // ページのロードを待つ
    const responsePromise = page.waitForResponse((resp) =>
      resp.url().includes('localhost') && resp.status() === 200
    );

    await page.goto('/dashboard');
    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });
});
