# Lua API リファレンス

AI Game PlatformのLuaスクリプトで利用可能なAPI完全リファレンス。

---

## 📚 目次

1. [グローバル変数](#グローバル変数)
2. [ライフサイクル関数](#ライフサイクル関数)
3. [ユーティリティ関数](#ユーティリティ関数)
4. [数学ライブラリ](#数学ライブラリ)
5. [サンプルコード集](#サンプルコード集)

---

## グローバル変数

### `gameobject` テーブル

現在のスクリプトがアタッチされているGameObjectへの参照。**常に存在**します。

#### プロパティ

| プロパティ | 型 | 説明 | 例 |
|-----------|-----|------|-----|
| `gameobject.id` | string | GameObjectの一意のID | `"obj-player-1"` |
| `gameobject.name` | string | GameObjectの表示名 | `"Player"` |
| `gameobject.transform` | table | Transform情報（位置・回転・スケール） | 下記参照 |

#### Transform プロパティ

##### Position（位置）

```lua
gameobject.transform.position.x  -- number: X座標
gameobject.transform.position.y  -- number: Y座標（上方向が正）
gameobject.transform.position.z  -- number: Z座標
```

**座標系:**
- X軸: 右が正
- Y軸: 上が正
- Z軸: 手前が正

##### Rotation（回転）

```lua
gameobject.transform.rotation.x  -- number: X軸回転（ラジアン）
gameobject.transform.rotation.y  -- number: Y軸回転（ラジアン）
gameobject.transform.rotation.z  -- number: Z軸回転（ラジアン）
```

**ラジアン変換:**
```lua
-- 度 → ラジアン
local radians = math.rad(45)  -- 45度をラジアンに

-- ラジアン → 度
local degrees = math.deg(rotation_y)  -- ラジアンを度に
```

##### Scale（スケール）

```lua
gameobject.transform.scale.x  -- number: Xスケール
gameobject.transform.scale.y  -- number: Yスケール
gameobject.transform.scale.z  -- number: Zスケール
```

#### Transform更新の重要な注意事項

❌ **これは動作しません:**
```lua
gameobject.transform.position.x = gameobject.transform.position.x + 1
```

✅ **正しい方法:**
```lua
local pos = gameobject.transform.position
pos.x = pos.x + 1
gameobject.transform.position = pos  -- 必ず代入！
```

**理由:** Luaテーブルのコピーセマンティクスのため、ローカル変数にコピーして変更後に代入する必要があります。

---

### `input` テーブル

キーボード入力状態。**常に存在**し、すべてのキーは`true`または`false`の値を持ちます（`nil`にはなりません）。

#### 利用可能なキー

| キー名 | 説明 | 用途 |
|--------|------|------|
| `input["w"]` | W キー | 前進 |
| `input["a"]` | A キー | 左移動 |
| `input["s"]` | S キー | 後退 |
| `input["d"]` | D キー | 右移動 |
| `input["arrowup"]` | ↑ キー | 上移動 / 前進 |
| `input["arrowdown"]` | ↓ キー | 下移動 / 後退 |
| `input["arrowleft"]` | ← キー | 左移動 |
| `input["arrowright"]` | → キー | 右移動 |
| `input[" "]` | スペースキー | ジャンプ / アクション |
| `input["shift"]` | Shift キー | ダッシュ / しゃがみ |
| `input["control"]` | Ctrl キー | 特殊アクション |
| `input["escape"]` | Esc キー | メニュー / 一時停止 |
| `input["enter"]` | Enter キー | 決定 |

#### 使用例

```lua
function on_update(dt)
  -- 防御的チェック（推奨だが必須ではない）
  if not input then return end
  
  -- 単一キー
  if input["w"] then
    print("W key is pressed")
  end
  
  -- 複数キーOR
  if input["a"] or input["arrowleft"] then
    print("Moving left")
  end
  
  -- 複数キーAND（同時押し）
  if input["shift"] and input["w"] then
    print("Running forward")
  end
  
  -- エッジ検出（押した瞬間）
  local was_space_pressed = false
  local is_space_pressed = input[" "] == true
  if is_space_pressed and not was_space_pressed then
    print("Space just pressed")
  end
  was_space_pressed = is_space_pressed
end
```

---

### `mouse_movement` テーブル

マウスの移動量。**ポインターロックが有効な場合のみ**有効です。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| `mouse_movement.x` | number | 水平移動量（ピクセル） |
| `mouse_movement.y` | number | 垂直移動量（ピクセル） |

#### 使用例（FPSカメラ）

```lua
local mouse_sensitivity = 0.002
local rotation_x = 0
local rotation_y = 0

function on_update(dt)
  if not mouse_movement then return end
  
  -- Y軸回転（水平視点）
  rotation_y = rotation_y - mouse_movement.x * mouse_sensitivity
  
  -- X軸回転（垂直視点）
  rotation_x = rotation_x - mouse_movement.y * mouse_sensitivity
  
  -- 垂直視点の制限（上下約85度）
  rotation_x = math.max(-1.5, math.min(1.5, rotation_x))
  
  local rot = gameobject.transform.rotation
  rot.x = rotation_x
  rot.y = rotation_y
  gameobject.transform.rotation = rot
end
```

---

### `mouse_click` ブール値

マウスクリック状態。**1フレームのみ`true`**になります。

```lua
function on_update(dt)
  if mouse_click then
    print("Mouse clicked this frame!")
    -- 発射、選択などのアクション
  end
end
```

---

## ライフサイクル関数

### `on_start()`

GameObjectが生成されたときに**1回だけ**呼ばれます。

#### 用途
- 初期化処理
- 変数の初期値設定
- デバッグメッセージ

#### シグネチャ
```lua
function on_start()
  -- 初期化コード
end
```

#### 例
```lua
local speed = 5
local health = 100

function on_start()
  print("Player initialized with health: " .. health)
  print("Starting position: " .. gameobject.transform.position.x)
end
```

---

### `on_update(dt)`

**毎フレーム**呼ばれます。ゲームロジックのメイン処理。

#### パラメータ
- `dt` (number): デルタタイム（前フレームからの経過時間、秒単位）

#### 用途
- 移動処理
- 入力処理
- AI処理
- アニメーション更新

#### シグネチャ
```lua
function on_update(dt)
  -- ゲームロジック
end
```

#### dtの使い方

```lua
-- ❌ dtを使わない（フレームレートに依存）
pos.x = pos.x + 5  -- 60FPSと30FPSで速度が変わる

-- ✅ dtを使う（フレームレート非依存）
pos.x = pos.x + 5 * dt  -- 常に5 units/sec
```

#### 例
```lua
local move_speed = 5

function on_update(dt)
  local pos = gameobject.transform.position
  
  -- 右に移動（速度一定）
  pos.x = pos.x + move_speed * dt
  
  gameobject.transform.position = pos
end
```

---

### `on_collision(other)`

**ソリッドコリジョン**（物理的な衝突）が発生したときに呼ばれます。

#### パラメータ
- `other` (table): 衝突相手のGameObject

#### otherの構造
```lua
other.id                          -- string: ID
other.name                        -- string: 名前
other.transform.position.x/y/z    -- number: 位置
other.transform.rotation.x/y/z    -- number: 回転
other.transform.scale.x/y/z       -- number: スケール
```

#### 用途
- 壁との衝突処理
- ダメージ判定
- 跳ね返り処理

#### シグネチャ
```lua
function on_collision(other)
  -- 衝突処理
end
```

#### 例
```lua
function on_collision(other)
  if other.name == "Wall" then
    print("Hit a wall!")
  elseif other.name == "Enemy" then
    print("Ouch! Took damage from: " .. other.name)
  end
end
```

---

### `on_trigger_enter(other)`

**トリガーコリジョン**に入ったときに呼ばれます。オブジェクトは通過可能です。

#### パラメータ
- `other` (table): トリガーに入ったGameObject

#### 用途
- アイテム収集
- ゴール判定
- エリア侵入検知

#### シグネチャ
```lua
function on_trigger_enter(other)
  -- トリガー処理
end
```

#### 例
```lua
local collected = false

function on_trigger_enter(other)
  if other.name == "Player" and not collected then
    collected = true
    print("Coin collected!")
    
    -- 画面外に移動（destroy未実装のため）
    gameobject.transform.position.y = -100
  end
end
```

---

### `on_trigger_exit(other)`

**トリガーコリジョン**から出たときに呼ばれます。

#### パラメータ
- `other` (table): トリガーから出たGameObject

#### 用途
- エリア退出検知
- エフェクト解除

#### シグネチャ
```lua
function on_trigger_exit(other)
  -- 退出処理
end
```

#### 例
```lua
function on_trigger_enter(other)
  if other.name == "Player" then
    print("Player entered speed boost zone")
  end
end

function on_trigger_exit(other)
  if other.name == "Player" then
    print("Player left speed boost zone")
  end
end
```

---

## ユーティリティ関数

### `find_gameobject(name)`

名前でGameObjectを検索します。

#### パラメータ
- `name` (string): 検索するGameObjectの名前

#### 戻り値
- GameObjectテーブル（見つかった場合）
- `nil`（見つからなかった場合）

#### シグネチャ
```lua
local obj = find_gameobject(name)
```

#### 例
```lua
function on_update(dt)
  -- プレイヤーを検索
  local player = find_gameobject("Player")
  
  if player then
    -- プレイヤーが存在する場合
    local distance_x = player.transform.position.x - gameobject.transform.position.x
    local distance_z = player.transform.position.z - gameobject.transform.position.z
    local distance = math.sqrt(distance_x * distance_x + distance_z * distance_z)
    
    if distance < 5 then
      print("Player is near!")
    end
  else
    print("Player not found")
  end
end
```

#### カメラ追従の例
```lua
function on_update(dt)
  local player = find_gameobject("Player")
  if not player then return end
  
  local pos = gameobject.transform.position
  
  -- プレイヤーのX座標を追従
  local target_x = player.transform.position.x
  local smooth_speed = 5
  
  pos.x = pos.x + (target_x - pos.x) * smooth_speed * dt
  
  gameobject.transform.position = pos
end
```

---

### `print(message)`

コンソールにメッセージを出力します（デバッグ用）。

#### パラメータ
- `message` (string): 出力するメッセージ

#### 例
```lua
function on_start()
  print("Game started!")
  print("Position: " .. gameobject.transform.position.x)
end

function on_update(dt)
  if input["w"] then
    print("Moving forward")
  end
end
```

---

## 数学ライブラリ

Luaの標準`math`ライブラリが利用可能です。

### 三角関数

```lua
math.sin(x)   -- サイン
math.cos(x)   -- コサイン
math.tan(x)   -- タンジェント
math.asin(x)  -- アークサイン
math.acos(x)  -- アークコサイン
math.atan(y, x)  -- アークタンジェント（2引数版）
```

### 角度変換

```lua
math.rad(degrees)  -- 度 → ラジアン
math.deg(radians)  -- ラジアン → 度
```

### その他

```lua
math.abs(x)        -- 絶対値
math.sqrt(x)       -- 平方根
math.pow(x, y)     -- べき乗
math.floor(x)      -- 切り捨て
math.ceil(x)       -- 切り上げ
math.max(a, b)     -- 最大値
math.min(a, b)     -- 最小値
math.random()      -- 0-1の乱数
math.random(n)     -- 1-nの整数乱数
math.random(m, n)  -- m-nの整数乱数
```

### 定数

```lua
math.pi    -- π (3.14159...)
math.huge  -- 無限大
```

---

## サンプルコード集

### 1. 基本的な移動

```lua
local speed = 5

function on_update(dt)
  if not input then return end
  
  local pos = gameobject.transform.position
  
  if input["w"] then pos.z = pos.z - speed * dt end
  if input["s"] then pos.z = pos.z + speed * dt end
  if input["a"] then pos.x = pos.x - speed * dt end
  if input["d"] then pos.x = pos.x + speed * dt end
  
  gameobject.transform.position = pos
end
```

---

### 2. 回転を考慮した移動（FPS）

```lua
local speed = 5
local rotation_y = 0

function on_update(dt)
  if not input then return end
  
  local move_x = 0
  local move_z = 0
  
  if input["w"] then move_z = -1 end
  if input["s"] then move_z = 1 end
  if input["a"] then move_x = -1 end
  if input["d"] then move_x = 1 end
  
  -- 回転を適用
  local cos_y = math.cos(rotation_y)
  local sin_y = math.sin(rotation_y)
  
  local move_forward = move_z * cos_y - move_x * sin_y
  local move_right = move_z * sin_y + move_x * cos_y
  
  local pos = gameobject.transform.position
  pos.x = pos.x + move_right * speed * dt
  pos.z = pos.z + move_forward * speed * dt
  gameobject.transform.position = pos
end
```

---

### 3. 重力とジャンプ

```lua
local velocity_y = 0
local gravity = -20
local jump_force = 8
local is_grounded = false

function on_update(dt)
  if not input then return end
  
  local pos = gameobject.transform.position
  
  -- ジャンプ
  if input[" "] and is_grounded then
    velocity_y = jump_force
    is_grounded = false
  end
  
  -- 重力適用
  velocity_y = velocity_y + gravity * dt
  pos.y = pos.y + velocity_y * dt
  
  -- 地面判定
  if pos.y <= 0.5 then
    pos.y = 0.5
    velocity_y = 0
    is_grounded = true
  else
    is_grounded = false
  end
  
  gameobject.transform.position = pos
end
```

---

### 4. オブジェクトの回転

```lua
local rotation_speed = 2

function on_update(dt)
  local rot = gameobject.transform.rotation
  
  -- Y軸回転
  rot.y = rot.y + rotation_speed * dt
  
  gameobject.transform.rotation = rot
end
```

---

### 5. 他のオブジェクトとの距離計算

```lua
function on_update(dt)
  local player = find_gameobject("Player")
  if not player then return end
  
  local my_pos = gameobject.transform.position
  local player_pos = player.transform.position
  
  -- 距離計算（3D）
  local dx = player_pos.x - my_pos.x
  local dy = player_pos.y - my_pos.y
  local dz = player_pos.z - my_pos.z
  local distance = math.sqrt(dx*dx + dy*dy + dz*dz)
  
  if distance < 3 then
    print("Player is very close: " .. distance)
  end
end
```

---

### 6. 振り子運動

```lua
local start_x = 0
local amplitude = 3
local frequency = 1
local time = 0

function on_start()
  start_x = gameobject.transform.position.x
end

function on_update(dt)
  time = time + dt
  
  local pos = gameobject.transform.position
  pos.x = start_x + math.sin(time * frequency) * amplitude
  gameobject.transform.position = pos
end
```

---

### 7. ランダムな動き

```lua
local direction_x = 1
local direction_z = 1
local speed = 3
local change_time = 0
local change_interval = 2

function on_update(dt)
  change_time = change_time + dt
  
  -- 2秒ごとにランダムに方向変更
  if change_time >= change_interval then
    direction_x = math.random(-1, 1)
    direction_z = math.random(-1, 1)
    change_time = 0
  end
  
  local pos = gameobject.transform.position
  pos.x = pos.x + direction_x * speed * dt
  pos.z = pos.z + direction_z * speed * dt
  gameobject.transform.position = pos
end
```

---

## ベストプラクティス

### 1. ローカル変数を使う

```lua
-- ✅ 良い
function on_update(dt)
  local pos = gameobject.transform.position
  pos.x = pos.x + 1
  gameobject.transform.position = pos
end

-- ❌ 悪い
function on_update(dt)
  gameobject.transform.position.x = gameobject.transform.position.x + 1
end
```

### 2. dtを使ってフレームレート非依存に

```lua
-- ✅ 良い
pos.x = pos.x + 5 * dt  -- 常に5 units/sec

-- ❌ 悪い
pos.x = pos.x + 0.1  -- フレームレートに依存
```

### 3. nil チェックを忘れずに

```lua
-- ✅ 良い
local player = find_gameobject("Player")
if player then
  -- プレイヤーが存在する場合の処理
end

-- ❌ 悪い
local player = find_gameobject("Player")
local distance = player.transform.position.x  -- playerがnilの場合エラー
```

---

このAPIリファレンスを使って、楽しいゲームを作成してください！
