# Playwright 学習プロジェクト

Playwrightの基本からMCP連携まで学べる学習環境です。

## プロジェクト構成

```
playwright-learning/
├── target-app/         # 操作対象のReactアプリ（DDD/レイヤードアーキテクチャ）
├── playwright-basic/   # Playwright基本学習プロジェクト
├── playwright-mcp/     # Playwright MCP学習プロジェクト
└── README.md
```

## セットアップ

### 1. 操作対象アプリの起動

```bash
cd target-app
npm install
npm run dev
# → http://localhost:3000 で起動
```

### 2. Playwright基本学習

```bash
cd playwright-basic
npm install
npx playwright install chromium   # ブラウザのインストール（初回のみ）
npx playwright test               # 全テスト実行
npx playwright test --ui          # UIモードで実行（おすすめ）
npx playwright test tests/01-basics  # 特定のレッスンのみ実行
```

### 3. Playwright MCP学習

```bash
cd playwright-mcp
npm install
npx playwright install chromium   # ブラウザのインストール（初回のみ）
npx playwright test               # 全テスト実行
```

## 学習カリキュラム

### Playwright基本（playwright-basic）

| # | テーマ | ディレクトリ | 学習内容 |
|---|--------|-------------|---------|
| 01 | 基本 | `01-basics/` | test(), page.goto(), expect() |
| 02 | ロケーター | `02-locators/` | getByRole, getByText, getByLabel, filter |
| 03 | アクション | `03-actions/` | click, fill, selectOption, keyboard |
| 04 | アサーション | `04-assertions/` | toBeVisible, toHaveText, toHaveValue, soft |
| 05 | ナビゲーション | `05-navigation/` | goto, goBack, パンくず, 深い階層 |
| 06 | フォーム | `06-forms/` | 入力, バリデーション, 送信, エラー |
| 07 | テーブル | `07-tables/` | 行列取得, 検索, フィルタリング |
| 08 | 待機 | `08-dialogs-modals/` | 自動待機, waitForURL, aria-live |
| 09 | スクリーンショット | `09-screenshots/` | ページ/要素キャプチャ |
| 10 | APIモッキング | `10-api-mocking/` | route, インターセプト, 監視 |
| 11 | フィクスチャ | `11-fixtures/` | beforeEach, use, viewport, locale |
| 12 | Page Object | `12-page-objects/` | POMパターン, カプセル化 |
| 13 | アクセシビリティ | `13-accessibility/` | ARIA, キーボード, スクリーンリーダー |
| 14 | ビジュアル回帰 | `14-visual-regression/` | toHaveScreenshot, スナップショット比較 |
| 15 | 高度なテクニック | `15-advanced/` | step, パラメータ化, E2Eフロー |

### Playwright MCP（playwright-mcp）

| # | テーマ | ディレクトリ | 学習内容 |
|---|--------|-------------|---------|
| 01 | MCP基本 | `01-mcp-basics/` | MCPツールとPlaywright操作の対応 |
| 02 | ナビゲーション | `02-mcp-navigation/` | AIのナビゲーションフロー |
| 03 | スナップショット | `03-mcp-snapshots/` | アクセシビリティツリー活用 |
| 04 | フォーム | `04-mcp-forms/` | AIのフォーム操作パターン |
| 05 | アサーション | `05-mcp-assertions/` | AIの検証方法 |
| 06 | E2Eシナリオ | `06-mcp-advanced/` | 実践的な複合シナリオ |

## 操作対象アプリのアーキテクチャ

### レイヤードアーキテクチャ + DDD

```
target-app/src/
├── domain/               # ドメイン層（ビジネスロジック）
│   ├── entities/         # エンティティ（User, Product, Order, Settings）
│   ├── valueObjects/     # 値オブジェクト（Email, Money, UserId, ProductId）
│   ├── repositories/     # リポジトリインターフェース（DIP）
│   └── services/         # ドメインサービス
├── infrastructure/       # インフラ層（実装）
│   ├── repositories/     # インメモリリポジトリ実装
│   └── api/              # モックデータ
├── presentation/         # プレゼンテーション層
│   ├── components/       # UIコンポーネント（Layout, Sidebar, Breadcrumb）
│   ├── pages/            # ページコンポーネント
│   └── hooks/            # カスタムフック
├── di/                   # DIコンテナ
├── App.tsx               # ルーティング定義
└── main.tsx              # エントリーポイント
```

### メニューと画面階層

| メニュー | 階層深度 | ルート例 |
|---------|---------|---------|
| ダッシュボード | 3階層 | `/dashboard` → `/reports` → `/reports/:type` |
| ユーザー管理 | 4階層 | `/users` → `/:id` → `/edit` or `/activity` |
| 商品管理 | 5階層 | `/products` → `/:id` → `/variants` → `/:variantId` → `/edit` |
| 注文管理 | 4階層 | `/orders` → `/:id` → `/shipping` |
| 設定 | 3階層 | `/settings` → `/general` or `/notifications` or `/security` |

### ARIA対応

- `role="menubar"`, `role="menuitem"` - サイドバーナビゲーション
- `role="main"`, `aria-label` - メインコンテンツランドマーク
- `role="table"`, `scope="col"` - テーブル構造
- `role="form"`, `aria-required`, `aria-invalid` - フォームバリデーション
- `role="alert"` - エラーメッセージ
- `role="status"`, `aria-live="polite"` - 動的更新
- `role="tablist"`, `role="tab"`, `aria-selected` - タブナビゲーション
- `aria-label` on delete buttons - 操作対象の明確化
- Skip link - メインコンテンツへのスキップ
- `aria-current="page"` - パンくずリスト
