# JIRA DB Chrome 拡張機能

JIRA データをローカルの DuckDB データベース（WASM）に同期する Chrome 拡張機能です。JIRA 課題のオフライン検索・分析を可能にします。

## 機能

- **JIRA 課題の同期**: DuckDB WASM を使用して JIRA 課題をローカルに取得・保存
- **レジューム対応**: 同期は中断しても最後のチェックポイントから再開可能
- **差分同期**: 前回の同期以降に更新された課題のみを取得
- **全文検索**: サマリー、説明文、課題キーで検索
- **フィルター**: プロジェクト、ステータス、担当者でフィルタリング
- **課題詳細**: 変更履歴を含む課題の詳細を表示
- **JIRA へ遷移**: 課題を JIRA で直接開く

## インストール

### 開発環境のセットアップ

1. 依存パッケージをインストール:
   ```bash
   cd chrome-extension
   npm install
   ```

2. アイコンを生成:
   ```bash
   npm install canvas  # アイコン生成用のオプション依存パッケージ
   node scripts/generate-icons.js
   ```

   または、`public/icons/` に icon16.png、icon48.png、icon128.png を手動で作成してください。

3. 拡張機能をビルド:
   ```bash
   npm run build
   ```

4. Chrome に読み込み:
   - `chrome://extensions/` を開く
   - 「デベロッパーモード」を有効にする
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - `chrome-extension` ディレクトリを選択

### 本番ビルド

```bash
npm run build
```

ビルド後、Chrome ウェブストアへの提出用にディレクトリを ZIP 圧縮します（node_modules、src、開発用ファイルを除く）。

## 設定

1. 拡張機能のアイコンをクリックし、設定ボタン（歯車アイコン）を選択
2. JIRA 接続情報を入力:
   - **エンドポイント**: JIRA の URL（例: `https://your-domain.atlassian.net`）
   - **ユーザー名**: メールアドレス
   - **API トークン**: [Atlassian API トークン](https://id.atlassian.com/manage-profile/security/api-tokens)で生成
3. 「接続テスト」をクリックして確認
4. プロジェクトを取得し、同期したいプロジェクトを有効化
5. 同期設定を構成（差分同期、バッチサイズ）

## 使い方

### データの同期

1. 拡張機能のポップアップを開く
2. 同期ボタン（更新アイコン）をクリック
3. 同期完了まで待機（進捗が表示されます）
4. 中断された場合、最後のチェックポイントから自動的に再開されます

### 課題の検索

1. 検索ボックスにキーワードを入力して検索
2. プロジェクトドロップダウンでプロジェクト別にフィルタリング
3. ステータスドロップダウンでステータス別にフィルタリング
4. 課題をクリックして詳細を表示
5. 「JIRA で開く」をクリックして課題に遷移

## アーキテクチャ

```
chrome-extension/
├── manifest.json           # Chrome 拡張機能マニフェスト（V3）
├── popup.html              # ポップアップ UI
├── options.html            # 設定ページ
├── src/
│   ├── background/         # Service Worker
│   │   └── index.ts        # メッセージ処理、同期オーケストレーション
│   ├── popup/
│   │   └── popup.ts        # ポップアップ UI ロジック
│   ├── options/
│   │   └── options.ts      # 設定ページロジック
│   ├── lib/
│   │   ├── types.ts        # TypeScript 型定義
│   │   ├── database.ts     # DuckDB WASM ラッパー
│   │   ├── jira-client.ts  # JIRA API クライアント
│   │   ├── settings.ts     # Chrome Storage ラッパー
│   │   └── sync-service.ts # チェックポイント付き同期ロジック
│   └── styles/
│       ├── popup.css       # ポップアップスタイル
│       └── options.css     # 設定ページスタイル
├── public/
│   └── icons/              # 拡張機能アイコン
├── dist/                   # ビルド済みファイル
├── build.js                # esbuild ビルドスクリプト
├── package.json
└── tsconfig.json
```

## 主要技術

- **DuckDB WASM**: ブラウザ内 SQL データベースで課題を保存
- **Chrome Extension Manifest V3**: 最新の拡張機能アーキテクチャ
- **TypeScript**: 型安全な開発
- **esbuild**: 高速バンドラー

## 同期機能

### レジューム対応（チェックポイント）

同期の進捗は各バッチ処理後に Chrome Storage に保存されます:
- `lastProcessedUpdatedAt`: 最後に処理された課題のタイムスタンプ
- `startPosition`: 処理済み課題数
- `totalIssues`: 同期対象の総課題数

同期が中断された場合（ブラウザ終了、ネットワークエラーなど）、チェックポイントから再開されます。

### 差分同期

有効時（デフォルト）、前回の同期以降に更新された課題のみを取得します:
- 設定可能な安全マージンを適用（デフォルト: 5分）
- 過去の同期履歴がない場合はフル同期にフォールバック

## 権限

- `storage`: 設定と同期チェックポイントの保存
- `alarms`: バックグラウンド同期のスケジューリング（将来実装予定）
- `*.atlassian.net` への `host_permissions`: JIRA API へのアクセス

## 今後の拡張予定

- [ ] 自動バックグラウンド同期
- [ ] CSV/Excel エクスポート
- [ ] Claude Code Web 版との連携
- [ ] エンベディングによるセマンティック検索
- [ ] Service Worker によるオフラインファースト対応

## トラブルシューティング

### 接続に失敗する場合

1. JIRA エンドポイント URL が正しいか確認
2. API トークンが有効か確認
3. JIRA プロジェクトへのアクセス権限があるか確認

### 同期が停止・ハングする場合

1. ネットワーク接続を確認
2. ポップアップを閉じて再度開く
3. 最後のチェックポイントから同期が再開されます

### 課題が表示されない場合

1. 少なくとも1つのプロジェクトが有効になっているか確認
2. まず同期を実行してみる
3. コンソールでエラーを確認（拡張機能アイコンを右クリック → 「ポップアップを検証」）
