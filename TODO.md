# AI Game Platform - 品質改善 TODO

このドキュメントは、プロジェクトの品質向上のための改善タスクをトラッキングします。

## 🎯 優先度の高いタスク

### フェーズ1: キーボード入力バグ修正（最優先）

- [ ] **型定義の更新** (`lib/types/gamespec.ts`)
  - [ ] `CameraProperties`に`usePointerLock?: boolean`を追加


- [ ] **ゲームエンジンの修正** (`lib/runtime/game-engine.ts`)
  - [ ] キャンバスフォーカス管理の追加（`tabIndex`, `focus()`）
  - [ ] キーボード状態の初期化メソッド追加
  - [ ] ポインターロックの条件付き有効化
  - [ ] メインカメラの`usePointerLock`プロパティチェック

- [ ] **Lua VM の修正** (`lib/runtime/lua-vm.ts`)
  - [ ] `setInputState`で常に入力テーブルを作成（空でも）
  - [ ] すべてのキー状態を明示的に設定（false含む）

- [ ] **テンプレートスクリプトの修正**
  - [ ] side-scroll-action: 入力検証追加、usePointerLock: false設定
  - [ ] fps: usePointerLock: true設定
  - [ ] basic-platform: 入力検証追加、usePointerLock設定

- [ ] **入力処理のテスト追加** (`lib/runtime/input-handling.test.ts`)
  - [ ] キャンバスフォーカス時のキーボードイベント受信
  - [ ] ポインターロックフラグの動作検証
  - [ ] 入力テーブルの存在保証
  - [ ] 複数キー同時押しの処理

---

## 🧪 フェーズ2: テストカバレッジ拡充

### Prefabシステムのテスト (`lib/utils/prefab.test.ts`)

- [ ] **テストユーティリティ追加** (`test/test-utils.ts`)
  - [ ] `createTestPrefab()`ファクトリー関数

- [ ] **createPrefabFromGameObject() テスト**
  - [ ] 単一GameObjectからPrefab作成
  - [ ] 子オブジェクト含むGameObjectからPrefab作成
  - [ ] スクリプト付きGameObjectからPrefab作成
  - [ ] カスタムモデル持つGameObjectからPrefab作成
  - [ ] name/description設定の検証

- [ ] **instantiatePrefab() テスト**
  - [ ] Prefabから新しいインスタンス作成
  - [ ] IDが一意に再生成される
  - [ ] transformのコピー
  - [ ] componentsの深いコピー
  - [ ] 子オブジェクトのID再生成
  - [ ] script_idの保持

- [ ] **updatePrefabFromGameObject() テスト**
  - [ ] 既存Prefabの更新
  - [ ] name/descriptionの変更
  - [ ] GameObjectの変更反映

### モデルストレージのテスト (`lib/utils/model-storage.test.ts`)

- [ ] **依存関係追加**
  - [ ] `fake-indexeddb@^6.0.0`をdevDependenciesに追加

- [ ] **saveModel() テスト**
  - [ ] 新規モデルの保存（Blob + メタデータ）
  - [ ] サムネイル付きモデルの保存
  - [ ] 既存モデルの上書き

- [ ] **getModel() テスト**
  - [ ] 保存したモデルの取得
  - [ ] 存在しないモデルでエラー

- [ ] **getAllModels() テスト**
  - [ ] 全モデルのメタデータ取得
  - [ ] 空のデータベース

- [ ] **deleteModel() テスト**
  - [ ] モデルの削除
  - [ ] 存在しないモデルの削除

- [ ] **updateModelMetadata() テスト**
  - [ ] name/tagsの更新

### ゲームテンプレートのテスト (`lib/templates/templates.test.ts`)

- [ ] **Empty テンプレート検証**
  - [ ] gameObjectsが有効
  - [ ] scriptsが有効
  - [ ] GameSpecValidatorで検証成功
  - [ ] 必須コンポーネント存在

- [ ] **FPS テンプレート検証**
  - [ ] FPSPlayer + FPSCamera存在
  - [ ] マウスルックスクリプト存在
  - [ ] script_id参照整合性
  - [ ] usePointerLock設定確認

- [ ] **Basic Platform テンプレート検証**
  - [ ] Player + ジャンプ機能
  - [ ] プラットフォーム衝突設定
  - [ ] カメラ設定

- [ ] **Side-Scroll Action テンプレート検証**
  - [ ] Player + 横スクロールカメラ
  - [ ] コイン + 敵の配置
  - [ ] usePointerLock無効化確認

### 既存テストの補強

- [ ] **game-engine.test.ts 追加**
  - [ ] コリジョン検出（Box-Box, Sphere-Sphere, Box-Sphere）
  - [ ] トリガー vs ソリッドコリジョン
  - [ ] transform同期（Three.js ↔ GameObject ↔ Lua VM）
  - [ ] カスタムモデル読み込み失敗時の処理
  - [ ] リソース破棄（destroy()）の完全性

- [ ] **lua-vm.test.ts 追加**
  - [ ] `find_gameobject()`関数の動作
  - [ ] `on_collision()`コールバック
  - [ ] `on_trigger_enter()`/`on_trigger_exit()`コールバック
  - [ ] 入力状態の受け渡し（keyboard, mouse）

---

## 📚 フェーズ3: Claude Skill開発

### スキルファイル作成

- [ ] **`.skills/game-generator.md` 作成**
  - [ ] 使用方法セクション
  - [ ] GameSpec完全仕様
  - [ ] Lua API リファレンス
  - [ ] コンポーネント仕様（Mesh, Light, Camera）
  - [ ] ベストプラクティス
  - [ ] テンプレート参考例（FPS, side-scroll, platform）
  - [ ] よくある問題と解決策

### ドキュメント整備

- [ ] **`docs/lua-api.md` 作成**
  - [ ] グローバル変数詳細
  - [ ] ライフサイクル関数詳細
  - [ ] ユーティリティ関数詳細
  - [ ] サンプルコード集

- [ ] **`docs/skill-usage.md` 作成**
  - [ ] Claude Codeでのスキル使用方法
  - [ ] 効果的なプロンプトの書き方
  - [ ] 生成結果の検証方法

---

## ✅ 検証タスク

- [ ] **入力バグ修正の検証**
  - [ ] 横スクロールアクションテンプレートで動作確認
  - [ ] 矢印キー/WASD/スペースキーすべて動作
  - [ ] FPSテンプレートでポインターロック動作

- [ ] **テストの検証**
  - [ ] `npm run test` ですべてのテスト合格
  - [ ] `npm run test:coverage` でカバレッジ確認
  - [ ] 目標: 46テスト → 100テスト以上

- [ ] **Claude Skillの検証**
  - [ ] スキルファイルが認識される
  - [ ] 自然言語からGameSpec生成
  - [ ] 生成されたLuaスクリプトが動作

---

## 📊 進捗状況

- **入力バグ修正:** 0% (0/4)
- **テストカバレッジ:** 0% (0/6)
- **Claude Skill:** 0% (0/3)
- **全体進捗:** 0% (0/13)

---

## 🎉 期待される成果

1. **テストカバレッジ:** 46テスト → 100テスト以上
2. **入力システム:** すべてのテンプレートでキーボード入力が確実に動作
3. **開発体験:** Claude SkillによりGameSpec生成の精度とスピードが向上
4. **ドキュメント:** Lua API完全リファレンスの完成
5. **保守性:** コアロジックの変更時に回帰テストで検出可能

---

## 📝 備考

- プランファイル: `/Users/syuhei/.claude/plans/elegant-dazzling-stallman.md`
- 実装順序: 入力バグ修正 → テストカバレッジ → Claude Skill
- 最優先: キーボード入力の問題解決（ユーザーが直面している課題）
