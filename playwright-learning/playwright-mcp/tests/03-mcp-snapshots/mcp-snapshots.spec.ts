/**
 * レッスン03: MCP スナップショット
 *
 * browser_snapshotの重要性:
 * - AIがページの構造を理解するための主要手段
 * - アクセシビリティツリーをテキストとして返す
 * - 各要素にref番号が割り当てられ、操作対象として使える
 * - ARIAロール、名前、状態が含まれる
 *
 * スナップショットの品質はアプリのアクセシビリティに依存する
 * → ARIA対応が重要な理由
 */
import { test, expect } from '@playwright/test';

test.describe('MCPスナップショット学習', () => {
  test('ダッシュボードのアクセシビリティツリーを確認', async ({ page }) => {
    await page.goto('/dashboard');

    const snapshot = await page.accessibility.snapshot();
    expect(snapshot).toBeTruthy();

    // snapshotにはrole, name, children等が含まれる
    if (snapshot) {
      console.log('Root role:', snapshot.role);
      console.log('Root name:', snapshot.name);
      console.log('Children count:', snapshot.children?.length);

      // ツリーの各ノードを確認
      snapshot.children?.forEach((child, i) => {
        console.log(`  [${i}] role=${child.role}, name="${child.name}"`);
      });
    }
  });

  test('フォームのスナップショットでAIが入力対象を特定', async ({ page }) => {
    await page.goto('/users/new');

    const snapshot = await page.accessibility.snapshot();

    // AIはこのスナップショットから:
    // 1. フォームフィールドを見つける（role: textbox, combobox等）
    // 2. ラベルを読んで何を入力すべきか理解する
    // 3. ref番号を使って操作する

    if (snapshot) {
      const findInputs = (node: any, depth = 0): void => {
        const indent = '  '.repeat(depth);
        if (['textbox', 'combobox', 'checkbox', 'button'].includes(node.role)) {
          console.log(`${indent}[INPUT] role=${node.role}, name="${node.name}", value="${node.value || ''}"`);
        }
        node.children?.forEach((child: any) => findInputs(child, depth + 1));
      };
      findInputs(snapshot);
    }
  });

  test('テーブルのスナップショットでAIがデータを読み取る', async ({ page }) => {
    await page.goto('/users');

    const snapshot = await page.accessibility.snapshot();

    // AIはテーブルのスナップショットから:
    // 1. ヘッダーを読んで列の意味を理解
    // 2. 各行のデータを読み取る
    // 3. リンクやボタンのref番号で操作する

    if (snapshot) {
      const findTable = (node: any): any => {
        if (node.role === 'table') return node;
        for (const child of (node.children || [])) {
          const result = findTable(child);
          if (result) return result;
        }
        return null;
      };

      const table = findTable(snapshot);
      if (table) {
        console.log(`Table: ${table.name}`);
        console.log(`Rows: ${table.children?.length || 0}`);
      }
    }
  });

  test('ARIA属性がスナップショットの品質に与える影響', async ({ page }) => {
    await page.goto('/users');

    const snapshot = await page.accessibility.snapshot();

    // ARIA対応が良いアプリでは:
    // - role="table" + aria-label → テーブルの目的が明確
    // - role="menuitem" + aria-label → メニュー項目が特定しやすい
    // - aria-live="polite" → 動的更新がAIに伝わる
    // - aria-invalid + aria-describedby → エラー状態が明確

    // ARIA対応が悪いアプリでは:
    // - 汎用的なdiv/spanしかない
    // - AIが要素の目的を推測しなければならない

    if (snapshot) {
      const countRoles = (node: any, roles: Record<string, number> = {}): Record<string, number> => {
        roles[node.role] = (roles[node.role] || 0) + 1;
        node.children?.forEach((child: any) => countRoles(child, roles));
        return roles;
      };

      const roles = countRoles(snapshot);
      console.log('ARIAロール統計:', JSON.stringify(roles, null, 2));
    }
  });

  test('ナビゲーション後のスナップショット変化', async ({ page }) => {
    await page.goto('/dashboard');
    const snap1 = await page.accessibility.snapshot();
    const snap1Str = JSON.stringify(snap1);

    await page.getByRole('menuitem', { name: 'ユーザー管理' }).click();
    const snap2 = await page.accessibility.snapshot();
    const snap2Str = JSON.stringify(snap2);

    // ページ遷移後、スナップショットが変化する
    expect(snap1Str).not.toBe(snap2Str);
    console.log('Snapshot 1 length:', snap1Str.length);
    console.log('Snapshot 2 length:', snap2Str.length);
  });
});
