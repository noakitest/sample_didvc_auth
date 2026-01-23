# ユーザーマイページ - VC（Verifiable Credentials）本人確認システム 仕様書

## 目次
1. [概要](#概要)
2. [技術スタック](#技術スタック)
3. [画面構成](#画面構成)
4. [データ構造](#データ構造)
5. [機能詳細](#機能詳細)
6. [UI/UXコンポーネント](#uiuxコンポーネント)
7. [状態管理](#状態管理)
8. [ビジネスロジック](#ビジネスロジック)
9. [ファイル構成](#ファイル構成)
10. [実装詳細](#実装詳細)

---

## 概要

### システムの目的
Verifiable Credentials（VC）とDecentralized Identifiers（DID）を使用した本人確認機能を持つユーザープロフィール管理システムのプロトタイプ。

### 主要機能
- 新規会員登録（手動入力 / VCから自動入力）
- ログイン（ID/パスワード / VC認証）
- プロフィール管理（表示・編集）
- 本人確認（VCによる）
- プロフィール情報の差異検出

---

## 技術スタック

### フロントエンド
- **React**: 18.x
- **Vite**: 4.x
- **Tailwind CSS**: 3.x

### 状態管理
- React Hooks (useState, useEffect)
- localStorage (ブラウザ永続化)

### モックデータ
- 認証情報: ハードコード
- VCデータ: コンポーネント内定義
- 本人確認ステータス: localStorage

---

## 画面構成

### 1. ログイン画面 (`LoginPage.jsx`)

#### 画面レイアウト
```
┌─────────────────────────────────────┐
│         [アイコン]                   │
│       ログイン画面                   │
│   サービスへのアクセス                │
├─────────────────────────────────────┤
│  [ID/パスワード] [VC認証]  (タブ)    │
├─────────────────────────────────────┤
│  ※選択されたタブの内容を表示          │
├─────────────────────────────────────┤
│     新規会員登録はこちら              │
└─────────────────────────────────────┘
```

#### タブ1: ID/パスワードログイン
- **会員ID** 入力フィールド
- **パスワード** 入力フィールド
- **ログイン** ボタン
- デモ用認証情報の表示: `ID: demo / パスワード: password`

#### タブ2: VC認証ログイン

**パターンA: 本人確認未済の場合**
```
┌───────────────────────────────────┐
│  [!] 本人確認が必要です            │
│                                   │
│  VC認証を利用するには、まず        │
│  ID/パスワードでログインして       │
│  本人確認を完了してください。      │
│                                   │
│  [ID/パスワードタブへ移動]         │
└───────────────────────────────────┘
```

**パターンB: 本人確認済みの場合**
```
┌───────────────────────────────────┐
│  [ウォレット] VC認証                │
│                                   │
│  デジタルウォレットから            │
│  身分証VCを提出してログイン        │
│                                   │
│  [ウォレットを開く]                │
│                                   │
│  DIDによる分散型認証を利用します   │
└───────────────────────────────────┘
```

#### 新規会員登録リンク
- テキストリンク: 「新規会員登録はこちら」
- クリックでサインアップ画面へ遷移

---

### 2. サインアップ画面 (`SignupPage.jsx`)

#### 画面レイアウト
```
┌─────────────────────────────────────┐
│  [←] ログイン画面に戻る              │
│                                     │
│         [アイコン]                   │
│       新規会員登録                   │
│  アカウント情報を入力してください     │
├─────────────────────────────────────┤
│  [手動入力] [VCから入力]  (タブ)     │
├─────────────────────────────────────┤
│  ■ アカウント情報                    │
│  ログインID *                        │
│  [               ]                  │
│  パスワード *                        │
│  [               ]                  │
│  パスワード（確認） *                 │
│  [               ]                  │
│                                     │
│  ■ 個人情報                         │
│  ※選択されたタブに応じた表示          │
│                                     │
│  [登録する]                          │
└─────────────────────────────────────┘
```

#### タブ1: 手動入力

**個人情報セクション:**
- **氏名** * (必須)
- **メールアドレス** * (必須)
- **住所** (任意)
- **生年月日** (任意)

すべてのフィールドが編集可能。

#### タブ2: VCから入力

**VC未提出の場合:**
```
┌───────────────────────────────────┐
│  [盾アイコン]                      │
│  VCから個人情報を自動入力します     │
│  ウォレットからVCを提出してください  │
│                                   │
│  [VCを提出して自動入力]            │
└───────────────────────────────────┘
```

**VC提出済みの場合:**
```
┌───────────────────────────────────┐
│  [✓] VCから情報を取得しました       │
│  提出された証明書: 運転免許証       │
│  (発行者: 東京都公安委員会)         │
└───────────────────────────────────┘

氏名 *
[山田 太郎] (グレーアウト・編集不可)

メールアドレス *
[                ] (編集可能)

住所
[東京都渋谷区...] (グレーアウト・編集不可)

生年月日
[1990-05-15] (グレーアウト・編集不可)
```

#### バリデーション
- ログインID: 必須
- パスワード: 必須、6文字以上
- パスワード（確認）: パスワードと一致
- 氏名: 必須
- メールアドレス: 必須

#### 登録完了後の動作
- 自動ログイン
- マイページに遷移
- VCから登録した場合: 本人確認済み + DID紐付け
- 手動入力で登録した場合: 本人確認未済

---

### 3. マイページ (`MyPage.jsx`)

#### 画面レイアウト
```
┌─────────────────────────────────────┐
│  マイページ              [ログアウト] │
│  アカウント情報の確認と管理           │
├─────────────────────────────────────┤
│  [アイコン]                          │
│  山田 太郎                           │
│  M123456789                         │
├─────────────────────────────────────┤
│  ■ アカウント情報                    │
│  会員ID: M123456789                 │
│  パスワード: ************            │
│                                     │
│  ■ 個人情報                         │
│  氏名: 山田 太郎                     │
│  メールアドレス: yamada.taro@...     │
│  住所: 〒150-0001 東京都渋谷区...    │
│  生年月日: 1990年5月15日             │
│                                     │
│  ■ 本人確認ステータス                │
│  [✓ 確認済み] または [未確認]        │
│  ※確認済みの場合のみDID表示           │
│                                     │
│  ※差異警告がある場合ここに表示        │
│                                     │
│  [プロフィール変更] [本人確認を開始]  │
└─────────────────────────────────────┘
```

#### 本人確認ステータス表示

**未確認の場合:**
```
┌───────────────────────────────────┐
│  [!] 本人確認ステータス             │
│  状態: 未確認                      │
│  VCを提出して本人確認を完了すると   │
│  より多くの機能が利用できます       │
└───────────────────────────────────┘
```

**確認済みの場合:**
```
┌───────────────────────────────────┐
│  [✓] 本人確認ステータス             │
│  状態: 確認済み                    │
│  確認日時: 2026-01-23 10:30       │
│                                   │
│  ■ 登録済みDID                    │
│  did:example:123456789abcd...     │
└───────────────────────────────────┘
```

#### プロフィール差異警告（VCログイン時）

VCでログインした際、登録済みプロフィールとVCの情報が異なる場合に表示:

```
┌───────────────────────────────────┐
│  [!] プロフィール情報の差異が       │
│      検出されました                │
│                                   │
│  ログインに使用したVCの情報と       │
│  登録されているプロフィール情報が   │
│  異なります。最新の情報に更新する   │
│  ことをお勧めします。              │
│                                   │
│  差異がある項目:                   │
│  • 住所: 登録「東京都渋谷区...」    │
│         → VC「東京都新宿区...」    │
│                                   │
│  [VCの情報で更新する]              │
│  [後で確認する]                    │
└───────────────────────────────────┘
```

#### アクションボタン

**本人確認未済の場合:**
- `[プロフィール変更]` ボタン
- `[本人確認を開始]` ボタン

**本人確認済みの場合:**
- `[プロフィール変更]` ボタンのみ

---

### 4. プロフィール編集画面 (`ProfileEdit.jsx`)

#### 画面レイアウト
```
┌─────────────────────────────────────┐
│  [←] マイページに戻る                │
│                                     │
│  プロフィール編集                    │
│  手動編集またはVCから情報を更新       │
├─────────────────────────────────────┤
│  氏名                               │
│  [山田 太郎                    ]     │
│                                     │
│  メールアドレス                      │
│  [yamada.taro@example.com     ]     │
│                                     │
│  住所                               │
│  [〒150-0001 東京都渋谷区...  ]     │
│                                     │
│  生年月日                           │
│  [1990年5月15日               ]     │
├─────────────────────────────────────┤
│  [!] 注意:                          │
│  手動で編集して保存すると、          │
│  本人確認ステータスが未確認に戻ります。│
│  VCから更新すると本人確認が維持されます。│
├─────────────────────────────────────┤
│  [手動で保存(本人確認は未確認に戻る)] │
│  [VCから更新(本人確認を維持)]        │
│  [キャンセル]                        │
└─────────────────────────────────────┘
```

#### 保存オプション

**1. 手動で保存**
- フォームの内容をそのまま保存
- 本人確認ステータス → 未確認
- linkedDID → null
- マイページに戻る

**2. VCから更新**
- ウォレットモーダルを開く
- VCを選択・提出
- ローディング表示（2秒）
- VCの情報でプロフィールを更新
- 本人確認ステータス → 確認済み（維持）
- linkedDID → VCのDID（更新または維持）
- マイページに戻る

---

### 5. ウォレットモーダル (`WalletModal.jsx`)

#### モーダルレイアウト
```
┌─────────────────────────────────────┐
│  デジタルウォレット           [×]    │
│  身分証VCを選択して提出してください   │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ 運転免許証                   │   │
│  │ 発行者: 東京都公安委員会      │   │
│  │ 有効期限: 2027-05-15        │   │
│  │ 氏名: 山田 太郎              │   │
│  │ 生年月日: 1990-05-15        │   │
│  │ 住所: 東京都渋谷区神宮前...   │   │
│  │ DID: did:example:123...     │   │
│  │                             │   │
│  │ [選択] ○                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ マイナンバーカード            │   │
│  │ 発行者: デジタル庁            │   │
│  │ 有効期限: 2031-06-01        │   │
│  │ 氏名: 山田 太郎              │   │
│  │ 生年月日: 1990-05-15        │   │
│  │ 住所: 東京都新宿区西新宿...   │   │
│  │ DID: did:example:123...     │   │
│  │                             │   │
│  │ [選択] ○                    │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  [VCを提出]                          │
└─────────────────────────────────────┘
```

#### VCデータ

**運転免許証VC:**
```javascript
{
  id: 'vc-001',
  type: '運転免許証',
  issuer: '東京都公安委員会',
  issuedDate: '2020-04-01',
  expiryDate: '2027-05-15',
  holderName: '山田 太郎',
  birthDate: '1990-05-15',
  address: '東京都渋谷区神宮前1-2-3',
  did: 'did:example:123456789abcdefghi'
}
```

**マイナンバーカードVC:**
```javascript
{
  id: 'vc-002',
  type: 'マイナンバーカード',
  issuer: 'デジタル庁',
  issuedDate: '2021-06-01',
  expiryDate: '2031-06-01',
  holderName: '山田 太郎',
  birthDate: '1990-05-15',
  address: '東京都新宿区西新宿2-8-1',  // ※運転免許証と異なる住所
  did: 'did:example:123456789abcdefghi'
}
```

#### VC選択と提出
1. ラジオボタンでVCを1つ選択
2. `[VCを提出]` ボタンをクリック
3. モーダルが閉じる
4. ローディング表示（2秒）
5. 呼び出し元の処理が実行される

---

### 6. ローディングオーバーレイ

すべてのVC処理時に表示される共通コンポーネント。

#### 表示デザイン
```
┌─────────────────────────────────────┐
│     (半透明黒背景)                   │
│                                     │
│    ┌───────────────────┐            │
│    │                   │            │
│    │   [グルグル]       │            │
│    │                   │            │
│    │ VCを検証中...      │            │
│    │ (処理内容に応じた  │            │
│    │  メッセージ)       │            │
│    │                   │            │
│    └───────────────────┘            │
│                                     │
└─────────────────────────────────────┘
```

#### 表示パターン

**パターン1: ログイン時（VCログイン）**
```
VCを検証中...
身分証明書の内容を確認しています
```

**パターン2: 本人確認VC提出時**
```
VCを検証中...
身分証明書の内容を確認しています
```

**パターン3: プロフィール更新時（VCから）**
```
VCを検証中...
プロフィール情報を更新しています
```

**パターン4: サインアップ時（VCから入力）**
```
VCを検証中...
身分証明書の内容を確認しています
```

#### 表示時間
- すべてのパターン: **2秒間**
- アニメーション: 回転するスピナー（青色）

---

## データ構造

### ユーザーデータ（`userData`）

```javascript
{
  memberId: 'M123456789',           // 会員ID
  name: '山田 太郎',                 // 氏名
  email: 'yamada.taro@example.com', // メールアドレス
  address: '〒150-0001 東京都渋谷区神宮前1-2-3', // 住所
  birthDate: '1990年5月15日',        // 生年月日
  password: '************',         // パスワード（表示用マスク）
  isVerified: false,                // 本人確認ステータス
  linkedDID: null                   // 紐付けられたDID
}
```

### ユーザーステート（`userState`）- localStorage保存

```javascript
{
  isVerified: true,                           // 本人確認ステータス
  linkedDID: 'did:example:123456789abcdefghi' // 紐付けられたDID
}
```

### VCデータ（Verifiable Credential）

```javascript
{
  id: 'vc-001',                               // VC ID
  type: '運転免許証',                          // VCタイプ
  issuer: '東京都公安委員会',                   // 発行者
  issuedDate: '2020-04-01',                   // 発行日
  expiryDate: '2027-05-15',                   // 有効期限
  holderName: '山田 太郎',                     // 保持者氏名
  birthDate: '1990-05-15',                    // 生年月日
  address: '東京都渋谷区神宮前1-2-3',           // 住所
  did: 'did:example:123456789abcdefghi'       // DID
}
```

### サインアップデータ（`signupData`）

```javascript
{
  loginId: 'user123',                         // ログインID
  password: 'password123',                    // パスワード
  confirmPassword: 'password123',             // パスワード（確認）
  name: '山田 太郎',                           // 氏名
  email: 'yamada.taro@example.com',           // メールアドレス
  address: '東京都渋谷区神宮前1-2-3',           // 住所
  birthDate: '1990年5月15日',                  // 生年月日
  vcData: VC | null,                          // 提出されたVC（VCから入力の場合のみ）
  isVerified: false                           // 本人確認済みフラグ
}
```

### プロフィール差異データ（`profileDifferences`）

```javascript
{
  hasDifference: true,        // 差異があるか
  name: false,                // 氏名に差異があるか
  birthDate: false,           // 生年月日に差異があるか
  address: true,              // 住所に差異があるか
  details: {
    address: {
      original: '〒150-0001 東京都渋谷区神宮前1-2-3',
      incoming: '東京都新宿区西新宿2-8-1'
    }
  }
}
```

---

## 機能詳細

### 1. 新規会員登録

#### フロー図
```
START
  ↓
ログイン画面で「新規会員登録はこちら」をクリック
  ↓
サインアップ画面表示
  ↓
入力方法を選択
  ├─ 手動入力
  │   ↓
  │  全フィールドを手動入力
  │   ↓
  │  [登録する]をクリック
  │   ↓
  │  バリデーション
  │   ↓
  │  アカウント作成（モック）
  │   ↓
  │  本人確認ステータス: 未確認
  │   ↓
  │  自動ログイン
  │   ↓
  │  マイページ表示
  │
  └─ VCから入力
      ↓
     [VCを提出して自動入力]をクリック
      ↓
     ウォレットモーダル表示
      ↓
     VCを選択して提出
      ↓
     ローディング表示（2秒）
      ↓
     氏名・住所・生年月日が自動入力
      ↓
     メールアドレスを手動入力
      ↓
     [登録する]をクリック
      ↓
     バリデーション
      ↓
     アカウント作成（モック）
      ↓
     本人確認ステータス: 確認済み
     linkedDID: VCのDID
      ↓
     自動ログイン
      ↓
     マイページ表示
```

#### バリデーションルール
1. **ログインID**: 必須、空白不可
2. **パスワード**: 必須、6文字以上
3. **パスワード（確認）**: パスワードと完全一致
4. **氏名**: 必須、空白不可
5. **メールアドレス**: 必須、空白不可

#### エラーメッセージ
- 必須項目が未入力: 「必須項目を入力してください」
- パスワード不一致: 「パスワードが一致しません」
- パスワードが短い: 「パスワードは6文字以上で入力してください」

---

### 2. ログイン

#### 2-1. ID/パスワードログイン

**フロー:**
```
会員IDとパスワードを入力
  ↓
[ログイン]をクリック
  ↓
認証チェック（モック）
  ├─ 成功（demo/password）
  │   ↓
  │  ログイン状態: true
  │  vcLoginInfo: null
  │   ↓
  │  マイページ表示
  │
  └─ 失敗
      ↓
     エラーメッセージ表示
     「IDまたはパスワードが正しくありません」
```

**モック認証情報:**
- ログインID: `demo`
- パスワード: `password`

#### 2-2. VC認証ログイン

**前提条件チェック:**
```
userState.isVerified === true ?
  ├─ YES → VC認証可能
  └─ NO  → 警告メッセージ表示
```

**フロー（本人確認済みの場合）:**
```
[ウォレットを開く]をクリック
  ↓
ウォレットモーダル表示
  ↓
VCを選択して提出
  ↓
ローディング表示（2秒）
  ↓
DID検証（モック）
  ├─ vc.did === linkedDID
  │   ↓
  │  ログイン成功
  │  vcLoginInfo: VC情報
  │   ↓
  │  マイページ表示
  │   ↓
  │  プロフィール差異チェック
  │
  └─ vc.did !== linkedDID
      ↓
     エラーメッセージ表示
     「VCのDIDが登録されていないか、一致しません」
```

---

### 3. 本人確認（VCによる）

**実行場所:** マイページ

**前提条件:** 本人確認未済（`isVerified === false`）

**フロー:**
```
[本人確認を開始]をクリック
  ↓
ウォレットモーダル表示
  ↓
VCを選択して提出
  ↓
モーダルが閉じる
  ↓
ローディング表示（2秒）
  ↓
本人確認処理（モック）
  ↓
userState更新:
  isVerified: true
  linkedDID: vc.did
  ↓
localStorage保存
  ↓
マイページ再表示
  ↓
本人確認ステータス: 確認済み
DID表示
成功メッセージ表示
```

---

### 4. プロフィール編集

#### 4-1. 手動編集

**フロー:**
```
[プロフィール変更]をクリック
  ↓
プロフィール編集画面表示
  ↓
フォームで情報を編集
  ↓
[手動で保存]をクリック
  ↓
プロフィール更新
本人確認ステータス: 未確認
linkedDID: null
  ↓
userState更新
localStorage保存
  ↓
マイページ表示
```

#### 4-2. VCから更新

**フロー:**
```
[プロフィール変更]をクリック
  ↓
プロフィール編集画面表示
  ↓
[VCから更新]をクリック
  ↓
ウォレットモーダル表示
  ↓
VCを選択して提出
  ↓
モーダルが閉じる
  ↓
ローディング表示（2秒）
  ↓
VCから情報を抽出:
  name: vc.holderName
  address: vc.address
  birthDate: vc.birthDate
  email: 保持（変更なし）
  ↓
プロフィール更新
本人確認ステータス: 確認済み（維持）
linkedDID: vc.did（更新または維持）
  ↓
userState更新
localStorage保存
  ↓
マイページ表示
```

---

### 5. プロフィール情報差異検出

#### 実行タイミング
VCでログインした直後、マイページ表示時

#### チェック処理

**正規化関数:**

```javascript
// 日付の正規化
normalizeDateString(dateStr) {
  // 1990年5月15日 → 1990-05-15
  // 1990/5/15 → 1990-05-15
  // 1990-05-15 → 1990-05-15
}

// 住所の正規化
normalizeAddress(address) {
  // 郵便番号を削除: 〒150-0001
  // 全角数字を半角に変換
  // 全角ハイフンを半角に変換
  // 空白を削除
}

// 氏名の正規化
normalizeName(name) {
  // 空白を削除
}
```

**比較ロジック:**

```javascript
compareProfileData(currentProfile, vcProfile) {
  const differences = {
    name: false,
    birthDate: false,
    address: false,
    details: {},
    hasDifference: false
  };
  
  // 氏名比較
  if (normalizeName(current.name) !== normalizeName(vc.name)) {
    differences.name = true;
    differences.details.name = {
      original: current.name,
      incoming: vc.name
    };
  }
  
  // 生年月日比較
  if (normalizeDateString(current.birthDate) !== normalizeDateString(vc.birthDate)) {
    differences.birthDate = true;
    differences.details.birthDate = {
      original: current.birthDate,
      incoming: vc.birthDate
    };
  }
  
  // 住所比較
  if (normalizeAddress(current.address) !== normalizeAddress(vc.address)) {
    differences.address = true;
    differences.details.address = {
      original: current.address,
      incoming: vc.address
    };
  }
  
  differences.hasDifference = differences.name || differences.birthDate || differences.address;
  
  return differences;
}
```

#### 差異検出時の動作

**警告表示:**
```
差異がある場合、オレンジ色の警告ボックスを表示
  ↓
差異のある項目を列挙
  ↓
2つのアクションボタン:
  [VCの情報で更新する]
  [後で確認する]
```

**「VCの情報で更新する」クリック時:**
```
VCの情報でプロフィールを即座に更新
  ↓
警告ボックスを非表示
  ↓
本人確認ステータス: 維持
```

**「後で確認する」クリック時:**
```
警告ボックスを非表示
  ↓
プロフィールは変更なし
```

---

## UI/UXコンポーネント

### アイコンコンポーネント

すべてのアイコンは `Icons.jsx` で定義されたSVGコンポーネント。

```javascript
// Icons.jsx
export const UserCircle = ({ className }) => (/* SVG */);
export const CheckCircle = ({ className }) => (/* SVG */);
export const AlertCircle = ({ className }) => (/* SVG */);
export const Edit = ({ className }) => (/* SVG */);
export const Shield = ({ className }) => (/* SVG */);
export const LogOut = ({ className }) => (/* SVG */);
export const ArrowLeft = ({ className }) => (/* SVG */);
export const Send = ({ className }) => (/* SVG */);
```

### カラーパレット

**ステータスカラー:**
- 成功・確認済み: `green-*` (緑)
- 警告: `yellow-*` / `orange-*` (黄・オレンジ)
- エラー: `red-*` (赤)
- 情報: `blue-*` (青)
- VC関連: `purple-*` (紫)

**ボタンカラー:**
- プライマリ: `blue-600` → `blue-700`（ホバー）
- セカンダリ: `white` + `border-gray-300`
- VC関連: `purple-600` → `purple-700`（ホバー）
- 警告: `orange-600` → `orange-700`（ホバー）

### レスポンシブ対応

基本的にモバイルファーストではないが、`max-w-*` クラスで最大幅を制限:
- ログイン/サインアップ: `max-w-md` (448px)
- マイページ/編集: `max-w-2xl` (672px)
- ウォレットモーダル: `max-w-2xl`

### アニメーション

**スピナー（ローディング）:**
```css
animate-spin
border-4 border-blue-200 border-t-blue-600
```

**トランジション:**
```css
transition-colors
transition-all
```

---

## 状態管理

### アプリケーション全体（App.jsx）

```javascript
const [currentView, setCurrentView] = useState('login');
// 値: 'login' | 'signup' | 'mypage'

const [isLoggedIn, setIsLoggedIn] = useState(false);

const [userState, setUserState] = useState(null);
// localStorage から復元
// 構造: { isVerified: boolean, linkedDID: string | null }

const [vcLoginInfo, setVcLoginInfo] = useState(null);
// VCログイン時のVC情報を保持
```

### ログイン画面（LoginPage.jsx）

```javascript
const [loginId, setLoginId] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'vc'
const [showWallet, setShowWallet] = useState(false);
const [isProcessingVC, setIsProcessingVC] = useState(false);

// Props
const { onLogin, userState, onNavigateToSignup } = props;
const isVerified = userState?.isVerified || false;
const linkedDID = userState?.linkedDID || null;
```

### サインアップ画面（SignupPage.jsx）

```javascript
const [inputMethod, setInputMethod] = useState('manual'); // 'manual' | 'vc'
const [formData, setFormData] = useState({
  loginId: '',
  password: '',
  confirmPassword: '',
  name: '',
  email: '',
  address: '',
  birthDate: '',
});
const [showWallet, setShowWallet] = useState(false);
const [isProcessingVC, setIsProcessingVC] = useState(false);
const [error, setError] = useState('');
const [vcData, setVcData] = useState(null);

// Props
const { onSignupComplete, onBackToLogin } = props;
```

### マイページ（MyPage.jsx）

```javascript
const [showWallet, setShowWallet] = useState(false);
const [submittedVC, setSubmittedVC] = useState(null);
const [isEditing, setIsEditing] = useState(false);
const [showProfileMismatch, setShowProfileMismatch] = useState(false);
const [profileDifferences, setProfileDifferences] = useState(null);
const [isProcessingVC, setIsProcessingVC] = useState(false);

const [userData, setUserData] = useState({
  memberId: 'M123456789',
  name: '山田 太郎',
  email: 'yamada.taro@example.com',
  address: '〒150-0001 東京都渋谷区神宮前1-2-3',
  birthDate: '1990年5月15日',
  password: '************',
  isVerified: userState?.isVerified || false,
  linkedDID: userState?.linkedDID || null
});

// Props
const { onLogout, userState, onUpdateUserState, vcLoginInfo } = props;
```

### プロフィール編集（ProfileEdit.jsx）

```javascript
const [formData, setFormData] = useState({
  name: userData.name,
  email: userData.email,
  address: userData.address,
  birthDate: userData.birthDate,
});
const [showWallet, setShowWallet] = useState(false);
const [updateMethod, setUpdateMethod] = useState(null); // 'manual' | 'vc'
const [isProcessingVC, setIsProcessingVC] = useState(false);

// Props
const { userData, onSave, onCancel } = props;
```

### ウォレットモーダル（WalletModal.jsx）

```javascript
const [selectedVC, setSelectedVC] = useState(null);

// Props
const { onClose, onSubmitVC } = props;
```

---

## ビジネスロジック

### 認証ロジック

#### ID/パスワード認証（モック）

```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  
  if (loginId === 'demo' && password === 'password') {
    onLogin(); // 成功
  } else {
    setError('IDまたはパスワードが正しくありません');
  }
};
```

#### VC認証（モック）

```javascript
const handleVCLogin = (vc) => {
  if (vc && vc.did && linkedDID && vc.did === linkedDID) {
    setShowWallet(false);
    setIsProcessingVC(true);
    
    setTimeout(() => {
      onLogin(vc); // VC情報を渡してログイン
    }, 2000);
  } else {
    setShowWallet(false);
    setError('VCのDIDが登録されていないか、一致しません');
  }
};
```

### サインアップロジック

```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  setError('');

  // バリデーション
  if (!formData.loginId || !formData.password || !formData.name || !formData.email) {
    setError('必須項目を入力してください');
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setError('パスワードが一致しません');
    return;
  }

  if (formData.password.length < 6) {
    setError('パスワードは6文字以上で入力してください');
    return;
  }

  // 登録処理
  onSignupComplete({
    ...formData,
    vcData: vcData,
    isVerified: inputMethod === 'vc' && vcData !== null
  });
};
```

### 本人確認ロジック

```javascript
const handleSubmitVC = (vc) => {
  setSubmittedVC(vc);
  setShowWallet(false);
  setIsProcessingVC(true);
  
  setTimeout(() => {
    const newUserData = { 
      ...userData, 
      isVerified: true,
      linkedDID: vc.did
    };
    setUserData(newUserData);
    
    onUpdateUserState({
      isVerified: true,
      linkedDID: vc.did
    });
    
    setIsProcessingVC(false);
  }, 2000);
};
```

### プロフィール更新ロジック

#### 手動保存

```javascript
const handleProfileSave = (formData, method, did = null) => {
  if (method === 'manual') {
    const newUserData = {
      ...userData,
      ...formData,
      isVerified: false,
      linkedDID: null
    };
    setUserData(newUserData);
    onUpdateUserState({
      isVerified: false,
      linkedDID: null
    });
  }
  setIsEditing(false);
};
```

#### VCから更新

```javascript
const handleProfileSave = (formData, method, did = null) => {
  if (method === 'vc') {
    const newUserData = {
      ...userData,
      ...formData,
      isVerified: true,
      linkedDID: did || userData.linkedDID
    };
    setUserData(newUserData);
    onUpdateUserState({
      isVerified: true,
      linkedDID: did || userData.linkedDID
    });
    setShowProfileMismatch(false);
  }
  setIsEditing(false);
};
```

### 差異検出ロジック

```javascript
useEffect(() => {
  if (vcLoginInfo) {
    const currentProfile = {
      name: userData.name,
      birthDate: userData.birthDate,
      address: userData.address
    };
    
    const vcProfile = {
      name: vcLoginInfo.holderName,
      birthDate: vcLoginInfo.birthDate,
      address: vcLoginInfo.address
    };
    
    const differences = compareProfileData(currentProfile, vcProfile);
    
    if (differences.hasDifference) {
      setProfileDifferences(differences);
      setShowProfileMismatch(true);
    }
  }
}, [vcLoginInfo, userData.name, userData.address, userData.birthDate]);
```

---

## ファイル構成

```
user-mypage/
├── public/
├── src/
│   ├── components/
│   │   ├── Icons.jsx                 # アイコンコンポーネント
│   │   ├── LoginPage.jsx             # ログイン画面
│   │   ├── SignupPage.jsx            # サインアップ画面
│   │   ├── MyPage.jsx                # マイページ
│   │   ├── ProfileEdit.jsx           # プロフィール編集画面
│   │   └── WalletModal.jsx           # ウォレットモーダル
│   ├── utils/
│   │   └── profileComparison.js      # プロフィール差異判定ユーティリティ
│   ├── App.jsx                       # メインアプリケーション
│   ├── main.jsx                      # エントリーポイント
│   └── index.css                     # グローバルスタイル
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 実装詳細

### 1. Icons.jsx

```jsx
export const UserCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="10" r="3"></circle>
    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
  </svg>
);

export const CheckCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export const AlertCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

export const Edit = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

export const Shield = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

export const LogOut = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

export const ArrowLeft = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export const Send = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);
```

### 2. profileComparison.js

```javascript
export const normalizeDateString = (dateStr) => {
  if (!dateStr) return '';
  
  // 既に YYYY-MM-DD 形式の場合
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // YYYY年MM月DD日 形式
  const japaneseFormat = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (japaneseFormat) {
    const year = japaneseFormat[1];
    const month = japaneseFormat[2].padStart(2, '0');
    const day = japaneseFormat[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // YYYY/MM/DD 形式
  const slashFormat = dateStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (slashFormat) {
    const year = slashFormat[1];
    const month = slashFormat[2].padStart(2, '0');
    const day = slashFormat[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return dateStr;
};

export const normalizeAddress = (address) => {
  if (!address) return '';
  
  return address
    .replace(/〒\s*\d{3}-?\d{4}\s*/g, '') // 郵便番号を削除
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)) // 全角数字を半角に
    .replace(/[－−‐]/g, '-') // 全角ハイフンを半角に
    .replace(/\s+/g, '') // 空白を削除
    .trim();
};

export const compareProfileData = (profile1, profile2) => {
  const differences = {
    name: false,
    birthDate: false,
    address: false,
    details: {}
  };
  
  // 氏名の比較
  const name1 = profile1.name?.replace(/\s+/g, '');
  const name2 = profile2.name?.replace(/\s+/g, '');
  if (name1 !== name2) {
    differences.name = true;
    differences.details.name = {
      original: profile1.name,
      incoming: profile2.name
    };
  }
  
  // 生年月日の比較
  const birthDate1 = normalizeDateString(profile1.birthDate);
  const birthDate2 = normalizeDateString(profile2.birthDate);
  if (birthDate1 !== birthDate2) {
    differences.birthDate = true;
    differences.details.birthDate = {
      original: profile1.birthDate,
      incoming: profile2.birthDate
    };
  }
  
  // 住所の比較
  const address1 = normalizeAddress(profile1.address);
  const address2 = normalizeAddress(profile2.address);
  if (address1 !== address2) {
    differences.address = true;
    differences.details.address = {
      original: profile1.address,
      incoming: profile2.address
    };
  }
  
  differences.hasDifference = differences.name || differences.birthDate || differences.address;
  
  return differences;
};
```

### 3. package.json

```json
{
  "name": "user-mypage",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.8"
  }
}
```

### 4. tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 5. vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### 6. index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 重要な実装ポイント

### 1. ローディング表示のタイミング

すべてのVC処理で2秒間のローディングを表示:

```javascript
setIsProcessingVC(true);

setTimeout(() => {
  // 処理
  setIsProcessingVC(false);
}, 2000);
```

### 2. localStorage の使用

```javascript
// 保存
localStorage.setItem('userState', JSON.stringify({
  isVerified: true,
  linkedDID: 'did:example:...'
}));

// 読み込み
useEffect(() => {
  const savedState = localStorage.getItem('userState');
  if (savedState) {
    setUserState(JSON.parse(savedState));
  }
}, []);
```

### 3. VCデータの住所の違い

運転免許証とマイナンバーカードで住所を変えることで、差異検出機能をデモできる:

```javascript
// 運転免許証
address: '東京都渋谷区神宮前1-2-3'

// マイナンバーカード
address: '東京都新宿区西新宿2-8-1'
```

### 4. モーダルとローディングのz-index

```css
/* モーダル */
z-50

/* ローディングオーバーレイ */
z-50
```

両方とも同じz-indexだが、ローディングは後から表示されるため上に重なる。

---

## テストシナリオ

### シナリオ1: 手動入力でサインアップ → 本人確認

1. ログイン画面で「新規会員登録はこちら」をクリック
2. 「手動入力」タブを選択
3. すべてのフィールドを入力
4. 「登録する」をクリック
5. マイページが表示される（本人確認: 未確認）
6. 「本人確認を開始」をクリック
7. ウォレットからVCを選択して提出
8. 2秒間のローディング
9. 本人確認完了（ステータス: 確認済み、DID表示）

### シナリオ2: VCからサインアップ

1. ログイン画面で「新規会員登録はこちら」をクリック
2. 「VCから入力」タブを選択
3. 「VCを提出して自動入力」をクリック
4. ウォレットからVCを選択して提出
5. 2秒間のローディング
6. 氏名・住所・生年月日が自動入力される
7. メールアドレスを手動入力
8. 「登録する」をクリック
9. マイページが表示される（本人確認: 確認済み、DID表示）

### シナリオ3: VCログイン → 差異検出

**前提:** シナリオ1または2でアカウント作成済み、本人確認済み

1. ログアウト
2. ログイン画面で「VC認証」タブを選択
3. 「ウォレットを開く」をクリック
4. **運転免許証VC**（住所: 渋谷区）を選択して提出
5. 2秒間のローディング
6. マイページが表示される
7. 登録済みプロフィールの住所が「新宿区」の場合、差異警告が表示される
8. 「VCの情報で更新する」をクリック
9. プロフィールが「渋谷区」に更新される
10. 警告が消える

### シナリオ4: プロフィール手動編集 → 本人確認リセット

**前提:** 本人確認済み

1. マイページで「プロフィール変更」をクリック
2. 住所を変更
3. 「手動で保存」をクリック
4. マイページに戻る
5. 本人確認ステータス: 未確認
6. DID表示なし

### シナリオ5: プロフィールVCから更新 → 本人確認維持

**前提:** 本人確認済み

1. マイページで「プロフィール変更」をクリック
2. 「VCから更新」をクリック
3. ウォレットからVCを選択して提出
4. 2秒間のローディング
5. VCの情報でプロフィールが更新される
6. マイページに戻る
7. 本人確認ステータス: 確認済み（維持）

---

## 注意事項

### プロトタイプとしての制限

1. **認証情報はハードコード**
   - ログインID: `demo`
   - パスワード: `password`

2. **データはローカルのみ**
   - サーバーへの保存なし
   - 別のブラウザ/デバイスでは共有されない

3. **VCの検証は行わない**
   - 署名検証なし
   - 発行者の信頼性確認なし
   - 有効期限チェックなし

4. **セキュリティ対策なし**
   - XSS対策なし
   - CSRF対策なし
   - パスワードのハッシュ化なし

### 本番環境への移行時に必要なこと

1. バックエンドAPI実装
2. データベース設計・構築
3. 認証・認可の実装（JWT等）
4. VCの署名検証実装
5. DID解決の実装
6. セキュリティ対策の実装
7. エラーハンドリングの強化
8. ロギング・モニタリング
9. テストコードの作成
10. パフォーマンス最適化

---

## まとめ

この仕様書に従って実装することで、Verifiable CredentialsとDIDを使用した本人確認システムのプロトタイプを再現できます。

すべてのUI/UX、データフロー、ビジネスロジック、状態管理が詳細に記載されているため、ゼロから実装する際の参考にしてください。
