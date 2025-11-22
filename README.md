# AI Game Platform

自然言語から3Dゲームを生成・編集できるプラットフォーム。**GameSpec (JSON) + Lua スクリプト**でゲームを定義し、**Next.js + three.js + React Three Fiber**でブラウザ上にレンダリングします。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 主な機能

### 🎮 ビジュアルエディタ
Unity風の3Dゲームエディタでゲームを作成・編集できます。

- **シーンヒエラルキー** - GameObjectの階層構造を管理
- **インスペクター** - Transform、コンポーネント、スクリプトを編集
- **3Dビューポート** - リアルタイムプレビュー
- **スクリプトエディタ** - Luaスクリプトで挙動を定義
- **プロジェクト管理** - ローカルストレージへの保存/読み込み、エクスポート/インポート

### 🚀 ランタイム
GameSpec JSONをパースして3Dワールドを構築し、Luaスクリプトを実行します。

- **three.jsシーン構築** - GameSpecから自動的に3Dシーンを生成
- **Lua VM実行** - fengari-webを使用したブラウザ上でのLua実行
- **スクリプトライフサイクル** - `on_start()`, `on_update(dt)` のイベントハンドラ

## クイックスタート

### 前提条件

- Node.js 18以降
- npm, yarn, pnpm, またはbun

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd sandbox

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### エディタを使う

[http://localhost:3000/editor](http://localhost:3000/editor) でビジュアルエディタにアクセスできます。

#### 基本操作

1. **GameObjectの追加** - ヒエラルキーパネルの「+」ボタン
2. **オブジェクトの編集** - ヒエラルキーでオブジェクトを選択し、インスペクターで編集
3. **コンポーネントの追加** - インスペクターの「Add Component」ドロップダウン
4. **スクリプトの作成** - スクリプトエディタの「+」ボタンでLuaスクリプトを作成
5. **プロジェクトの保存** - ツールバーの「Save」ボタン（Ctrl/Cmd+S）

#### キーボードショートカット

- `Delete` - 選択中のGameObjectを削除
- `Ctrl/Cmd + D` - 選択中のGameObjectを複製
- `Ctrl/Cmd + S` - プロジェクトを保存

## プロジェクト構造

```
sandbox/
├── app/
│   ├── editor/          # エディタページ
│   ├── runtime/         # ランタイムページ
│   └── page.tsx         # ランディングページ
├── components/
│   ├── editor/          # エディタUIコンポーネント
│   │   ├── SceneHierarchy.tsx
│   │   ├── Inspector.tsx
│   │   ├── Viewport3D.tsx
│   │   └── ScriptEditor.tsx
│   └── runtime/         # ランタイムコンポーネント
├── lib/
│   ├── types/
│   │   └── gamespec.ts  # GameSpec型定義
│   ├── runtime/
│   │   ├── game-engine.ts  # ゲームエンジン
│   │   └── lua-vm.ts       # Lua VM ラッパー
│   └── utils/
│       └── storage.ts   # localStorage ユーティリティ
└── spec.md              # 仕様書（日本語）
```

## GameSpec フォーマット

ゲームは`GameSpec`オブジェクトで定義されます：

```typescript
{
  meta: {
    title: "My Game",
    description: "A 3D game",
    version: "1.0.0"
  },
  players: {
    count: { min: 1, max: 4 },
    spawn_points: [{ x: 0, y: 0, z: 0 }]
  },
  worlds: [{
    id: "main",
    environment: {
      skybox: { type: "color", color: "#87CEEB" },
      ambient_light: { color: "#ffffff", intensity: 0.5 },
      directional_light: {
        color: "#ffffff",
        intensity: 1.0,
        direction: { x: -1, y: -1, z: -1 }
      }
    },
    objects: [
      {
        id: "player",
        name: "Player",
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 }
        },
        components: [
          {
            type: "mesh",
            geometry: { type: "box", width: 1, height: 1, depth: 1 },
            material: { color: "#ff0000" }
          }
        ],
        script_id: "player_controller"
      }
    ]
  }],
  scripts: [
    {
      id: "player_controller",
      name: "Player Controller",
      lua_code: `
function on_start()
  print("Player started!")
end

function on_update(dt)
  -- Update logic here
end
      `
    }
  ]
}
```

## コンポーネントシステム

GameObjectは以下のコンポーネントを持つことができます：

- **mesh** - 視覚的なジオメトリ（box, sphere, plane, cylinder）
- **light** - ライティング（point, spot, directional）
- **camera** - カメラ（FOV、アスペクト比、near/far）
- **collider** - コリジョン（未実装）
- **rigidbody** - 物理演算（未実装）
- **audio_source** - オーディオ（未実装）
- **particle_system** - パーティクル（未実装）

## Luaスクリプト

各GameObjectはLuaスクリプトをアタッチできます。Lua VMは以下のAPIを提供します：

```lua
-- ライフサイクルイベント
function on_start()
  -- オブジェクトのインスタンス化時に1回呼ばれる
end

function on_update(dt)
  -- 毎フレーム呼ばれる（dt = deltaTime）
end

-- グローバル変数
gameobject = {
  id = "obj-123",
  name = "My Object",
  transform = {
    position = { x = 0, y = 0, z = 0 },
    rotation = { x = 0, y = 0, z = 0 },
    scale = { x = 1, y = 1, z = 1 }
  }
}
```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# Linter実行
npm run lint

# テスト実行
npm test
```

## 技術スタック

- **フレームワーク**: Next.js 16.0.3 (App Router)
- **言語**: TypeScript 5
- **3Dレンダリング**: three.js, @react-three/fiber, @react-three/drei
- **スクリプティング**: fengari-web (Lua VM)
- **スタイリング**: Tailwind CSS 4
- **テスト**: Vitest
- **ストレージ**: localStorage (ブラウザ)

## ExecPlan ワークフロー

大規模な機能追加やリファクタリングには**ExecPlan**手法を使用します（`.agent/PLANS.md`参照）。

ExecPlanの原則：
- **Self-contained** - 外部参照なし、すべての必要な知識を埋め込む
- **Novice-guiding** - 読者がゼロコンテキストであることを前提とする
- **Outcome-focused** - 変更後にユーザーができることと検証方法を記述
- **Living document** - Progress、Decision Log、その他のセクションを継続的に更新

## ライセンス

MIT

## ドキュメント

- `spec.md` - プラットフォームアーキテクチャの仕様（日本語）
- `CLAUDE.md` - Claude Codeのためのプロジェクトガイド
- `AGENTS.md` - ExecPlanワークフローについての概要
- `.agent/PLANS.md` - ExecPlan手法の詳細
