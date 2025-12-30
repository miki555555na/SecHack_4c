# 開発者向け UI 使用ガイド

タイミング攻撃教材プロジェクトにおけるUIコンポーネントの使用方法をまとめたガイドです。

## 目次

1. [shadcn/ui の基本](#shadcnui-の基本)
2. [カスタム教育用コンポーネント](#カスタム教育用コンポーネント)
3. [スタイリングガイドライン](#スタイリングガイドライン)
4. [ベストプラクティス](#ベストプラクティス)

---

## shadcn/ui の基本

### 既存のコンポーネント

プロジェクトには以下のshadcn/uiコンポーネントがインストール済みです：

```
components/ui/
├── button.tsx      # ボタンコンポーネント
├── card.tsx        # カードコンポーネント（CardHeader, CardTitle, CardDescription, CardContent含む）
└── input.tsx       # 入力フォームコンポーネント
```

### 新しいコンポーネントの追加方法

shadcn/uiの公式CLIを使用してコンポーネントを追加します：

```bash
# 例: Dialog コンポーネントを追加
npx shadcn@latest add dialog

# 例: Select コンポーネントを追加
npx shadcn@latest add select

# 例: 複数のコンポーネントを一度に追加
npx shadcn@latest add dialog select checkbox
```

利用可能なコンポーネント一覧は [shadcn/ui公式サイト](https://ui.shadcn.com/docs/components) を参照してください。

### コンポーネントの基本的な使い方

#### Button

```tsx
import { Button } from '@/components/ui/button';

export function Example() {
  return (
    <div>
      {/* 基本的なボタン */}
      <Button>クリック</Button>

      {/* バリアント */}
      <Button variant="outline">アウトライン</Button>
      <Button variant="destructive">削除</Button>
      <Button variant="ghost">ゴースト</Button>

      {/* サイズ */}
      <Button size="sm">小</Button>
      <Button size="lg">大</Button>
    </div>
  );
}
```

#### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>タイトル</CardTitle>
        <CardDescription>説明文</CardDescription>
      </CardHeader>
      <CardContent>
        <p>カードのコンテンツ</p>
      </CardContent>
    </Card>
  );
}
```

#### Input

```tsx
import { Input } from '@/components/ui/input';

export function Example() {
  return (
    <Input
      type="text"
      placeholder="入力してください"
    />
  );
}
```

---

## カスタム教育用コンポーネント

教育用に、セキュリティ教材特有のカラーコーディングを施したカスタムコンポーネントを用意しています。

```
components/educational/
├── vulnerable-card.tsx   # 脆弱なコード例用（赤色）
├── secure-card.tsx       # 安全なコード例用（緑色）
├── info-card.tsx         # 情報ハイライト用（黄色）
└── demo-button.tsx       # デモ切替用ボタン
```

### VulnerableCard（脆弱なコード例）

**用途：** タイミング攻撃に脆弱なコード例を表示する際に使用

**カラーテーマ：** 赤色（危険を示す）

**使い方：**

```tsx
import { VulnerableCard } from '@/components/educational/vulnerable-card';

export function Example() {
  return (
    <VulnerableCard
      title="脆弱なコード"
      description="このコードはタイミング攻撃に対して脆弱です"
    >
      <pre className="bg-white p-4 rounded">
        <code>{`if (userInput === correctPassword) {
  return "認証成功";
}`}</code>
      </pre>
    </VulnerableCard>
  );
}
```

**Props:**
- `title` (string, 必須): カードのタイトル
- `description` (string, 任意): カードの説明文
- `children` (ReactNode, 必須): カード内に表示するコンテンツ

**特徴:**
- ⚠️ 絵文字アイコンが自動で表示される
- 赤色のボーダーと背景
- タイトルと説明文も赤色でハイライト

---

### SecureCard（安全なコード例）

**用途：** タイミング攻撃に対して安全なコード例を表示する際に使用

**カラーテーマ：** 緑色（安全を示す）

**使い方：**

```tsx
import { SecureCard } from '@/components/educational/secure-card';

export function Example() {
  return (
    <SecureCard
      title="安全なコード"
      description="定数時間比較を使用しています"
    >
      <pre className="bg-white p-4 rounded">
        <code>{`function constantTimeCompare(a, b) {
  // 定数時間比較の実装
  return crypto.timingSafeEqual(a, b);
}`}</code>
      </pre>
    </SecureCard>
  );
}
```

**Props:**
- `title` (string, 必須): カードのタイトル
- `description` (string, 任意): カードの説明文
- `children` (ReactNode, 必須): カード内に表示するコンテンツ

**特徴:**
- ✅ チェックマーク絵文字が自動で表示される
- 緑色のボーダーと背景
- タイトルと説明文も緑色でハイライト

---

### InfoCard（情報ハイライト）

**用途：** 重要な情報や注意点を強調表示する際に使用

**カラーテーマ：** 黄色（注目を促す）

**使い方：**

```tsx
import { InfoCard } from '@/components/educational/info-card';

export function Example() {
  return (
    <InfoCard
      title="重要なポイント"
      description="タイミング攻撃の基本原理"
    >
      <p>
        タイミング攻撃は、処理時間の違いから機密情報を推測する攻撃手法です。
      </p>
    </InfoCard>
  );
}
```

**Props:**
- `title` (string, 必須): カードのタイトル
- `description` (string, 任意): カードの説明文
- `children` (ReactNode, 必須): カード内に表示するコンテンツ

**特徴:**
- 💡 電球絵文字が自動で表示される
- 黄色のボーダーと背景
- タイトルと説明文も黄色でハイライト

---

### DemoButton（デモ切替ボタン）

**用途：** 脆弱な実装と安全な実装を切り替えるデモで使用

**使い方：**

```tsx
import { DemoButton } from '@/components/educational/demo-button';
import { useState } from 'react';

export function Example() {
  const [mode, setMode] = useState<'vulnerable' | 'secure'>('vulnerable');

  return (
    <div className="flex gap-4">
      <DemoButton
        variant="vulnerable"
        active={mode === 'vulnerable'}
        onClick={() => setMode('vulnerable')}
      >
        脆弱な実装
      </DemoButton>

      <DemoButton
        variant="secure"
        active={mode === 'secure'}
        onClick={() => setMode('secure')}
      >
        安全な実装
      </DemoButton>
    </div>
  );
}
```

**Props:**
- `variant` ('vulnerable' | 'secure', 必須): ボタンのバリアント
- `active` (boolean, 必須): ボタンがアクティブかどうか
- `onClick` (() => void, 必須): クリック時のハンドラー
- `children` (ReactNode, 必須): ボタンのラベル

**特徴:**
- `variant="vulnerable"`: 赤色のボタン
- `variant="secure"`: 緑色のボタン
- `active={true}`: ボーダーが太くなり、不透明度が100%
- `active={false}`: 不透明度が60%（非アクティブ状態）

---

## スタイリングガイドライン

### Tailwind CSS 4.x の使用方法

このプロジェクトでは **Tailwind CSS 4.x** を使用しています。v4.xは「CSS-first」アプローチを採用しており、従来の `tailwind.config.js` は不要です。

#### グローバルスタイルの定義場所

`app/globals.css` にすべてのグローバルスタイルとカスタムCSS変数を定義します。

```css
/* app/globals.css */
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}

@layer base {
  /* カスタムCSSを追加する場合はここ */
}
```

#### Tailwind クラスの使用

```tsx
// 基本的なユーティリティクラス
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
  <p className="text-lg font-bold text-gray-800">テキスト</p>
</div>

// レスポンシブデザイン
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* カード要素 */}
</div>

// ホバー効果
<button className="transition-transform hover:-translate-y-0.5 hover:shadow-lg">
  ホバーしてください
</button>
```

### カラーコーディングのルール

教育用コンポーネントでは、以下のカラーコーディングを統一しています：

| 色 | 用途 | コンポーネント | Tailwindクラス例 |
|---|---|---|---|
| 🔴 **赤** | 脆弱なコード | `VulnerableCard` | `text-red-600`, `bg-red-50`, `border-red-500` |
| 🟢 **緑** | 安全なコード | `SecureCard` | `text-green-600`, `bg-green-50`, `border-green-500` |
| 🟡 **黄** | 重要な情報 | `InfoCard` | `text-yellow-600`, `bg-yellow-50`, `border-yellow-500` |

### レスポンシブデザイン

すべてのページとコンポーネントはレスポンシブ対応してください：

```tsx
// モバイルファースト設計
<div className="px-4 sm:px-6 lg:px-8">
  {/* モバイル: 4、タブレット: 6、デスクトップ: 8 */}
</div>

// グリッドレイアウト
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* モバイル: 1列、タブレット: 2列、デスクトップ: 3列 */}
</div>

// テキストサイズ
<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
  {/* レスポンシブなフォントサイズ */}
</h1>
```

---

## ベストプラクティス

### 1. コンポーネント構成

#### ディレクトリ構造

```
app/
├── IntroModule/       # 各モジュールごとにディレクトリを作成
│   └── page.tsx
├── PracticeModule/
│   └── page.tsx
├── layout.tsx
└── page.tsx

components/
├── educational/       # 教育用カスタムコンポーネント
│   ├── vulnerable-card.tsx
│   ├── secure-card.tsx
│   ├── info-card.tsx
│   └── demo-button.tsx
└── ui/               # shadcn/uiコンポーネント
    ├── button.tsx
    ├── card.tsx
    └── input.tsx
```

#### コンポーネントの命名規則

- **ファイル名:** kebab-case（例: `vulnerable-card.tsx`）
- **コンポーネント名:** PascalCase（例: `VulnerableCard`）
- **Props型:** `コンポーネント名 + Props`（例: `VulnerableCardProps`）

### 2. アクセシビリティ

教育教材として、アクセシビリティは重要です：

```tsx
// ✅ 良い例
<button
  className="..."
  onClick={handleClick}
  aria-label="脆弱な実装を表示"
>
  脆弱な実装
</button>

// ✅ セマンティックHTML
<main className="...">
  <h1>タイトル</h1>
  <section>
    <h2>セクションタイトル</h2>
  </section>
</main>

// ✅ カラーコントラスト
// 赤、緑、黄色は十分なコントラストを持つシェードを使用
text-red-600   // ❌ text-red-400 (コントラスト不足)
text-green-700 // ❌ text-green-300 (コントラスト不足)
```

### 3. パフォーマンス

```tsx
// ✅ クライアントコンポーネントは必要な場合のみ
'use client';  // インタラクション必要な場合のみ

// ✅ 動的インポート
import dynamic from 'next/dynamic';
const HeavyComponent = dynamic(() => import('@/components/heavy-component'));

// ✅ 画像最適化
import Image from 'next/image';
<Image src="/demo.png" alt="デモ" width={500} height={300} />
```

### 4. TypeScript の活用

```tsx
// ✅ Props型を明確に定義
interface DemoComponentProps {
  title: string;
  description?: string;  // 任意項目
  variant: 'vulnerable' | 'secure';  // ユニオン型
  children: ReactNode;
}

// ✅ 型推論を活用
const [mode, setMode] = useState<'vulnerable' | 'secure'>('vulnerable');
```

### 5. コードの再利用

共通のパターンは抽象化してください：

```tsx
// ❌ 悪い例: 同じコードの繰り返し
<Card className="border-3 border-red-500 bg-red-50">...</Card>
<Card className="border-3 border-red-500 bg-red-50">...</Card>

// ✅ 良い例: カスタムコンポーネントを使用
<VulnerableCard>...</VulnerableCard>
<VulnerableCard>...</VulnerableCard>
```

---

## よくある質問 (FAQ)

### Q1. 新しいページを追加するには？

```bash
# app/ディレクトリ内に新しいフォルダを作成
mkdir app/NewModule

# page.tsxを作成
touch app/NewModule/page.tsx
```

```tsx
// app/NewModule/page.tsx
export default function NewModulePage() {
  return (
    <main className="max-w-4xl mx-auto px-5 py-10">
      <h1>新しいモジュール</h1>
    </main>
  );
}
```

### Q2. 新しいshadcn/uiコンポーネントを追加するには？

```bash
# 利用可能なコンポーネント一覧を確認
npx shadcn@latest add

# 特定のコンポーネントを追加（例: dialog）
npx shadcn@latest add dialog
```

追加されたコンポーネントは `components/ui/` に配置されます。

### Q3. カスタムコンポーネントを作成するには？

1. `components/educational/` にファイルを作成
2. 既存のコンポーネント（VulnerableCardなど）を参考に実装
3. shadcn/uiの基本コンポーネントをベースに構築

### Q4. スタイルをカスタマイズするには？

shadcn/uiコンポーネントは `components/ui/` に直接コピーされているため、自由に編集できます：

```tsx
// components/ui/button.tsx を直接編集
// 独自のバリアントを追加したり、スタイルを変更したりできます
```

### Q5. ダークモード対応

Tailwind CSS 4.xのダークモードサポートを使用：

```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  ダークモード対応
</div>
```

`app/globals.css` でダークモード用のCSS変数を定義：

```css
@custom-variant dark (&:is(.dark *));

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

---

## 参考リンク

- [shadcn/ui公式ドキュメント](https://ui.shadcn.com/)
- [Tailwind CSS v4 ドキュメント](https://tailwindcss.com/)
- [Next.js 15 App Router](https://nextjs.org/docs)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

