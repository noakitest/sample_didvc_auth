# ユーザーマイページ - プロトタイプ

Vite + React + Tailwind CSS で構築したユーザーマイページのプロトタイプです。

## 機能

### ログイン機能
- 会員IDとパスワードによる認証
- デモ用認証情報:
  - ID: `demo`
  - パスワード: `password`

### マイページ機能
- ユーザー情報の表示
  - 会員ID
  - 氏名
  - メールアドレス
  - 生年月日
  - 住所
  - パスワード（マスク表示）
  - 本人確認ステータス

### 本人確認機能（VC/VP）
- デジタルウォレットのモック実装
- 身分証VC（Verifiable Credential）の提出
  - 運転免許証
  - マイナンバーカード
- VP（Verifiable Presentation）提出フロー

## セットアップ

### 必要なもの
- Node.js 16.x 以上
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## プロジェクト構成

```
user-mypage/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx              # エントリーポイント
│   ├── App.jsx               # メインアプリケーション
│   ├── index.css             # グローバルスタイル
│   └── components/
│       ├── Icons.jsx         # アイコンコンポーネント
│       ├── LoginPage.jsx     # ログインページ
│       ├── MyPage.jsx        # マイページ
│       └── WalletModal.jsx   # ウォレットモーダル
```

## 技術スタック

- **React 18** - UIライブラリ
- **Vite 4** - ビルドツール
- **Tailwind CSS 3** - CSSフレームワーク
- **ESLint** - コード品質管理

## 使い方

1. 開発サーバーを起動: `npm run dev`
2. ブラウザで `http://localhost:5173` を開く
3. ログイン画面でデモ認証情報を入力
4. マイページで「本人確認を開始」ボタンをクリック
5. ウォレットから身分証VCを選択して提出
6. 本人確認ステータスが「確認済み」に変わる

## 注意事項

これはプロトタイプであり、以下の機能は実装されていません:
- 実際の認証処理
- データベース連携
- ブロックチェーン連携
- 実際のVC/VP検証
- セキュリティ対策

本番環境では適切なセキュリティ対策と実装が必要です。
