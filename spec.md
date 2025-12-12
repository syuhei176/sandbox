# AI Game Platform Spec v0 (Simple)

## Overview

ユーザーが自然言語から 3Dゲームを自動生成できるプラットフォームを作る。
ゲームの仕様は **JSON構造 + Lua Script** で定義される。
3Dレンダリングは **Web（Next.js + three.js）** で行う。

LLM の役割：
- 自然言語プロンプトを解析し **GameSpec(JSON)** と **Luaスクリプト** を生成する
- Luaはオブジェクトごとの挙動制御に限定し、主要構造はJSONに保持する

ランタイムの役割：
- JSONからthree.jsでゲームワールドを自動構築する
- GameObject に紐付いた Lua スクリプトを Lua VM で実行し、`on_start` / `on_update` を呼び出す
- 3Dモデル（GLTF/GLB）とアニメーションを自動的にロード・管理する


自然言語だけでなく、Unityのようなエディタでも開発できるようにする。

---

## Output format (LLMが返す形式)

LLMは以下の形式の **1つの JSONオブジェクトのみ** を返す：

```jsonc
{
  "meta": { ... },
  "players": { ... },
  "worlds": [ ... ],
  "scripts": [ ... ]
}
```

---

## 主要機能

### 3Dモデルとアニメーション

#### 3Dモデルのロード

GLTF/GLB形式の3Dモデルをサポート：
- `model_url`: リモートURLから読み込み
- `model_id`: IndexedDBから読み込み
- `model_data`: インラインBase64データ

#### アニメーションシステム

GLTFモデルに含まれるアニメーションを自動検出・管理：
- **自動再生**: `autoPlayAnimation: true` で起動時に自動再生
- **デフォルトアニメーション**: `defaultAnimation` でクリップ名を指定
- **ループ制御**: `animationLoop` でループ有効化
- **再生速度**: `animationSpeed` で速度調整

#### Luaアニメーション制御API

Luaスクリプトからアニメーションを完全制御：

**状態テーブル** (読み取り専用):
```lua
animation.clips       -- 利用可能なクリップ名の配列
animation.current     -- 現在再生中のクリップ名
animation.time        -- 現在の再生時間（秒）
animation.is_playing  -- 再生状態
```

**制御関数**:
```lua
play_animation("Walk")                            -- アニメーション再生
play_animation("Attack", {loop=false, speed=1.5}) -- オプション付き再生
pause_animation()                                 -- 一時停止
resume_animation()                                -- 再開
stop_animation()                                  -- 停止
set_animation_speed(2.0)                         -- 速度変更
```

**ライフサイクルフック**:
```lua
function on_animation_complete(clip_name)
  -- ループなしアニメーション終了時に呼ばれる
end
