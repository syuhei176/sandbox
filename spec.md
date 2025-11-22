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
