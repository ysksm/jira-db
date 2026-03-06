/**
 * レッスン12: Page Object Model（POM）パターン
 *
 * 学習ポイント:
 * - Page Objectクラスの作成
 * - ロケーターのカプセル化
 * - アクションメソッドの定義
 * - テストからPOMの利用
 */
import { test, expect, Page } from '@playwright/test';

// --- Page Object クラス ---

class SidebarMenu {
  constructor(private page: Page) {}

  get nav() { return this.page.getByLabel('メインナビゲーション'); }

  async navigateTo(name: string) {
    await this.page.getByRole('menuitem', { name }).click();
  }
}

class UserListPO {
  constructor(private page: Page) {}

  get heading() { return this.page.getByRole('heading', { name: 'ユーザー管理' }); }
  get table() { return this.page.getByRole('table', { name: 'ユーザー一覧' }); }
  get searchInput() { return this.page.getByLabel('ユーザー検索'); }
  get roleFilter() { return this.page.getByLabel('ロールでフィルター'); }
  get newUserButton() { return this.page.getByRole('button', { name: '新規ユーザー' }); }
  get userCount() { return this.page.getByRole('status'); }

  async goto() {
    await this.page.goto('/users');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async filterByRole(role: string) {
    await this.roleFilter.selectOption(role);
  }

  getUserRow(testId: string) {
    return this.page.getByTestId(testId);
  }

  async deleteUser(name: string) {
    await this.page.getByRole('button', { name: `${name}を削除` }).click();
  }
}

class UserFormPO {
  constructor(private page: Page) {}

  get nameInput() { return this.page.getByLabel('名前'); }
  get emailInput() { return this.page.getByLabel('メール'); }
  get roleSelect() { return this.page.getByLabel('ロール'); }
  get departmentInput() { return this.page.getByLabel('部署'); }
  get saveButton() { return this.page.getByRole('button', { name: '保存' }); }
  get cancelButton() { return this.page.getByRole('button', { name: 'キャンセル' }); }

  async goto() {
    await this.page.goto('/users/new');
  }

  async fillForm(data: { name: string; email: string; role?: string; department: string }) {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    if (data.role) await this.roleSelect.selectOption(data.role);
    await this.departmentInput.fill(data.department);
  }

  async submit() {
    await this.saveButton.click();
  }
}

// --- テスト ---

test.describe('Page Object Model学習', () => {
  test('POMを使ったユーザー一覧の検証', async ({ page }) => {
    const userList = new UserListPO(page);
    await userList.goto();

    await expect(userList.heading).toBeVisible();
    await expect(userList.table).toBeVisible();
  });

  test('POMを使った検索', async ({ page }) => {
    const userList = new UserListPO(page);
    await userList.goto();

    await userList.search('鈴木');
    await expect(userList.userCount).toContainText('1件');
  });

  test('POMを使ったフィルタリング', async ({ page }) => {
    const userList = new UserListPO(page);
    await userList.goto();

    await userList.filterByRole('admin');
    await expect(userList.userCount).toContainText('1件');
  });

  test('POMを使ったフォーム入力', async ({ page }) => {
    const form = new UserFormPO(page);
    await form.goto();

    await form.fillForm({
      name: 'POMテストユーザー',
      email: 'pom@example.com',
      role: 'editor',
      department: 'POM部',
    });

    await expect(form.nameInput).toHaveValue('POMテストユーザー');
    await form.submit();
    await expect(page).toHaveURL(/\/users$/);
  });

  test('POMを組み合わせたE2Eテスト', async ({ page }) => {
    const sidebar = new SidebarMenu(page);
    const userList = new UserListPO(page);

    await page.goto('/dashboard');
    await sidebar.navigateTo('ユーザー管理');
    await expect(userList.heading).toBeVisible();

    await userList.search('田中');
    await expect(userList.getUserRow('user-row-u1')).toBeVisible();
  });
});
