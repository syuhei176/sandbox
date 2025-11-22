const llmResponsibilities = [
  {
    title: "GameSpec Generator",
    description:
      "自然言語プロンプトを解析し、ゲーム構造を示す GameSpec(JSON) を生成。シーン構成、アセット、勝敗条件を JSON に閉じ込める。",
  },
  {
    title: "Lua Behavior Author",
    description:
      "各オブジェクトの `on_start` / `on_update` を Lua で記述。主なロジックは JSON に保持し、Lua には挙動制御のみを委任。",
  },
];

const runtimeResponsibilities = [
  {
    title: "three.js ワールド構築",
    description:
      "GameSpec(JSON) から three.js シーンを自動構築し、地形・ライト・プレイヤーを Next.js 上で即時レンダリング。",
  },
  {
    title: "Lua VM 実行",
    description:
      "GameObject ごとに Lua スクリプトをロードして `on_start` / `on_update` をコール。WebAssembly Lua VM で安全にサンドボックス化。",
  },
  {
    title: "状態同期",
    description:
      "Lua から公開 API 経由で位置/アニメーション/スコアなどを更新し、three.js のシーン状態と同期する。",
  },
];

const workflowPhases = [
  {
    title: "Prompt",
    description:
      "ユーザーが日本語/英語などの自然言語で 3D ゲームの要件を記述。",
    bullets: ["ジャンル、勝利条件、主要オブジェクト、世界観を含める"],
  },
  {
    title: "LLM Spec",
    description:
      "LLM が GameSpec(JSON) と Lua スクリプトを単一 JSON オブジェクトで返却。",
    bullets: ["構造: meta / players / worlds[] / scripts[].attach_to など"],
  },
  {
    title: "Runtime",
    description:
      "Next.js + three.js ランタイムが GameSpec を読み込み、Lua VM を起動してプレイアブルな体験を生成。",
    bullets: [
      "スクリプトイベント: on_start / on_update",
      "Web クライアントで即時デバッグ",
    ],
  },
];

const blueprintStats = [
  { label: "Game Definition", value: "JSON構造 + Lua Script" },
  { label: "Rendering Stack", value: "Next.js (App Router) + three.js" },
  { label: "Scripting API", value: "`on_start`, `on_update`" },
];

const outputFormatExample = `{
  "meta": { "title": "My 3D Game", "genre": "arena" },
  "players": { "count": 1, "abilities": ["move", "jump"] },
  "worlds": [
    {
      "id": "arena",
      "objects": [
        { "id": "player", "type": "character", "script": "player_controller" }
      ]
    }
  ],
  "scripts": [
    {
      "id": "player_controller",
      "attach_to": "player",
      "lua": "function on_update(dt) --[[ ... ]] end"
    }
  ]
}`;

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-900 text-zinc-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 sm:px-10 lg:px-16">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
            Spec v0 · Simple
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            AI Game Platform
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-zinc-300">
            自然言語を起点に 3D ゲームを自動生成するための最小仕様。LLM が
            GameSpec(JSON) + Lua Script を導出し、Next.js + three.js
            ランタイムがプレイアブルなワールドを構築します。
          </p>
          <div className="mt-8 flex flex-wrap gap-4 text-sm font-medium">
            <a
              className="rounded-full bg-emerald-400 px-6 py-3 text-black transition hover:bg-emerald-300"
              href="#overview"
            >
              View Overview
            </a>
            <a
              className="rounded-full border border-white/30 px-6 py-3 text-white transition hover:border-white"
              href="#output-format"
            >
              Jump to Output JSON
            </a>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {blueprintStats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm"
              >
                <p className="text-zinc-400">{item.label}</p>
                <p className="mt-2 text-base font-semibold text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="overview"
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-950/60 p-10"
        >
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-white">Overview</h2>
              <p className="mt-4 text-zinc-300">
                ユーザーの自然言語プロンプトから 3D
                ゲームを生成するエンドツーエンド体験。LLM はゲーム仕様を JSON
                &amp; Lua で出力し、ランタイムは three.js
                でワールドを組み立て、Lua VM が挙動を制御します。
              </p>
            </div>
            <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-6">
              <p className="text-sm font-semibold text-zinc-400">Core Ideas</p>
              <ul className="space-y-2 text-sm text-zinc-200">
                <li>• JSON の構造化により LLM 出力の検証を容易にする</li>
                <li>
                  • Lua スクリプトはオブジェクト挙動に限定し、主要ロジックは
                  JSON 側で担保
                </li>
                <li>• Web クライアントのみで 3D レンダリングを完結</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-xl font-semibold text-white">LLM Role</h3>
            <p className="mt-2 text-sm text-zinc-400">
              GameSpec の信頼性を高めるため、LLM は構造化された JSON と Lua
              スニペットを同時に吐き出します。
            </p>
            <div className="mt-6 space-y-4">
              {llmResponsibilities.map((item) => (
                <div key={item.title} className="rounded-2xl bg-black/40 p-4">
                  <p className="text-sm font-semibold text-emerald-300">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm text-zinc-200">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-xl font-semibold text-white">Runtime Role</h3>
            <p className="mt-2 text-sm text-zinc-400">
              ランタイムは three.js / Lua VM / Next.js
              を束ねてワールド構築と挙動更新を担います。
            </p>
            <div className="mt-6 space-y-4">
              {runtimeResponsibilities.map((item) => (
                <div key={item.title} className="rounded-2xl bg-black/40 p-4">
                  <p className="text-sm font-semibold text-sky-300">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm text-zinc-200">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h3 className="text-xl font-semibold text-white">End-to-End Flow</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {workflowPhases.map((phase) => (
              <div key={phase.title} className="rounded-2xl bg-black/40 p-5">
                <p className="text-sm font-semibold text-white">
                  {phase.title}
                </p>
                <p className="mt-3 text-sm text-zinc-300">
                  {phase.description}
                </p>
                <ul className="mt-4 space-y-1 text-xs text-zinc-400">
                  {phase.bullets.map((bullet) => (
                    <li key={bullet}>• {bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section
          id="output-format"
          className="rounded-3xl border border-emerald-400/60 bg-black/70 p-8"
        >
          <div className="flex items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white">
                Output Format
              </h3>
              <p className="mt-2 text-sm text-zinc-300">
                LLM は単一の JSON オブジェクトを返します。GameSpec 全体を 1
                つにまとめることで検証・ストリーミングを簡略化します。
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              meta · players · worlds · scripts
            </span>
          </div>
          <pre className="mt-6 overflow-x-auto rounded-2xl bg-zinc-950 p-6 text-sm text-emerald-200">
            <code>{outputFormatExample}</code>
          </pre>
        </section>

        <footer className="pb-10 text-center text-xs text-zinc-500">
          Built with Next.js · Spec inspired by Lua-driven 3D runtimes.
        </footer>
      </main>
    </div>
  );
}
