import type { GameTemplate } from "./types";

export const sideScrollActionTemplate: GameTemplate = {
  id: "side-scroll-action",
  name: "2D横スクロールアクション",
  description: "横スクロールのアクションゲーム。左右移動とジャンプで進みます。",
  gameObjects: [
    // Ground
    {
      id: "ground",
      name: "Ground",
      transform: {
        position: { x: 0, y: -0.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 30, y: 1, z: 3 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x4a4a4a,
            width: 1,
            height: 1,
            depth: 1,
            hasCollision: true,
            collisionShape: "box",
            isTrigger: false,
            collisionLayer: 0,
          },
        },
      ],
    },
    // Platform 1
    {
      id: "platform1",
      name: "Platform1",
      transform: {
        position: { x: 5, y: 1.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 4, y: 0.4, z: 3 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x8b7355,
            width: 1,
            height: 1,
            depth: 1,
            hasCollision: true,
            collisionShape: "box",
            isTrigger: false,
            collisionLayer: 0,
          },
        },
      ],
    },
    // Platform 2
    {
      id: "platform2",
      name: "Platform2",
      transform: {
        position: { x: 10, y: 3, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 4, y: 0.4, z: 3 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x8b7355,
            width: 1,
            height: 1,
            depth: 1,
            hasCollision: true,
            collisionShape: "box",
            isTrigger: false,
            collisionLayer: 0,
          },
        },
      ],
    },
    // Platform 3 (高い位置)
    {
      id: "platform3",
      name: "Platform3",
      transform: {
        position: { x: 15, y: 5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 4, y: 0.4, z: 3 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x8b7355,
            width: 1,
            height: 1,
            depth: 1,
            hasCollision: true,
            collisionShape: "box",
            isTrigger: false,
            collisionLayer: 0,
          },
        },
      ],
    },
    // Player
    {
      id: "player",
      name: "Player",
      transform: {
        position: { x: -10, y: 1, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.8, y: 1.2, z: 0.8 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x4169e1,
            width: 1,
            height: 1,
            depth: 1,
            hasCollision: true,
            collisionShape: "box",
            isTrigger: false,
            collisionLayer: 1,
          },
        },
      ],
      script_id: "player_controller",
    },
    // Enemy 1 (パトロール)
    {
      id: "enemy1",
      name: "Enemy1",
      transform: {
        position: { x: 8, y: 0.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.8, y: 0.8, z: 0.8 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0xdc143c,
            width: 1,
            height: 1,
            depth: 1,
            hasCollision: true,
            collisionShape: "box",
            isTrigger: true,
            collisionLayer: 2,
          },
        },
      ],
      script_id: "enemy_patrol",
    },
    // Enemy 2 (プラットフォーム上)
    {
      id: "enemy2",
      name: "Enemy2",
      transform: {
        position: { x: 10, y: 4, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.8, y: 0.8, z: 0.8 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0xdc143c,
            width: 1,
            height: 1,
            depth: 1,
            hasCollision: true,
            collisionShape: "box",
            isTrigger: true,
            collisionLayer: 2,
          },
        },
      ],
      script_id: "enemy_patrol",
    },
    // Coin 1
    {
      id: "coin1",
      name: "Coin1",
      transform: {
        position: { x: 3, y: 2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.5, y: 0.5, z: 0.1 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "cylinder",
            color: 0xffd700,
            width: 1,
            height: 1,
            depth: 1,
            hasCollision: true,
            collisionShape: "sphere",
            isTrigger: true,
            collisionLayer: 3,
          },
        },
      ],
      script_id: "coin_rotate",
    },
    // Coin 2
    {
      id: "coin2",
      name: "Coin2",
      transform: {
        position: { x: 7, y: 3.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.5, y: 0.5, z: 0.1 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "cylinder",
            color: 0xffd700,
            width: 1,
            height: 1,
            depth: 1,
            hasCollision: true,
            collisionShape: "sphere",
            isTrigger: true,
            collisionLayer: 3,
          },
        },
      ],
      script_id: "coin_rotate",
    },
    // Coin 3
    {
      id: "coin3",
      name: "Coin3",
      transform: {
        position: { x: 12, y: 5.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.5, y: 0.5, z: 0.1 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "cylinder",
            color: 0xffd700,
            width: 1,
            height: 1,
            depth: 1,
            hasCollision: true,
            collisionShape: "sphere",
            isTrigger: true,
            collisionLayer: 3,
          },
        },
      ],
      script_id: "coin_rotate",
    },
    // Goal
    {
      id: "goal",
      name: "Goal",
      transform: {
        position: { x: 20, y: 0.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1.5, y: 3, z: 1.5 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "cylinder",
            color: 0x32cd32,
            width: 1,
            height: 1,
            depth: 1,
            hasCollision: true,
            collisionShape: "cylinder",
            isTrigger: true,
            collisionLayer: 4,
          },
        },
      ],
      script_id: "goal_checker",
    },
    // Camera (横から見る固定視点)
    {
      id: "main_camera",
      name: "MainCamera",
      transform: {
        position: { x: 0, y: 3, z: 12 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      components: [
        {
          type: "camera",
          properties: {
            fov: 50,
            aspect: 16 / 9,
            near: 0.1,
            far: 1000,
          },
        },
      ],
      script_id: "camera_follow",
    },
    // Point Light 1
    {
      id: "point_light1",
      name: "PointLight1",
      transform: {
        position: { x: 0, y: 5, z: 3 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      components: [
        {
          type: "light",
          properties: {
            lightType: "point",
            color: 0xffffff,
            intensity: 1.5,
            distance: 20,
          },
        },
      ],
    },
    // Point Light 2
    {
      id: "point_light2",
      name: "PointLight2",
      transform: {
        position: { x: 15, y: 6, z: 3 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      components: [
        {
          type: "light",
          properties: {
            lightType: "point",
            color: 0xffffff,
            intensity: 1.5,
            distance: 20,
          },
        },
      ],
    },
  ],
  scripts: [
    {
      id: "player_controller",
      name: "PlayerController",
      lua_code: `-- 2D横スクロール プレイヤーコントローラー
local velocity_y = 0
local gravity = -15
local jump_force = 7
local move_speed = 5
local is_grounded = false
local collected_coins = 0
local was_space_pressed = false

function on_start()
    print("Player started! Use Arrow Keys or AD to move, Space to jump")
    print("Position: x=" .. gameobject.transform.position.x .. ", y=" .. gameobject.transform.position.y)
end

function on_update(dt)
    local pos = gameobject.transform.position

    -- 左右移動（矢印キーまたはAD）
    local move_x = 0
    if input["arrowleft"] or input["a"] then
        move_x = move_x - 1
    end
    if input["arrowright"] or input["d"] then
        move_x = move_x + 1
    end

    -- 重力適用
    velocity_y = velocity_y + gravity * dt

    -- ジャンプ（スペースキー - エッジ検出）
    local is_space_pressed = input[" "] == true
    if is_grounded and is_space_pressed and not was_space_pressed then
        velocity_y = jump_force
        is_grounded = false
        print("Jump!")
    end
    was_space_pressed = is_space_pressed

    -- 位置更新
    pos.x = pos.x + move_x * move_speed * dt
    pos.y = pos.y + velocity_y * dt

    -- 地面との衝突判定（簡易版）
    if pos.y <= 0.6 then
        pos.y = 0.6
        velocity_y = 0
        is_grounded = true
    else
        is_grounded = false
    end

    -- プラットフォームとの衝突判定（簡易版）
    -- Platform1: x=5, y=1.5, size=4x0.4
    if pos.x > 3 and pos.x < 7 and pos.y < 2.1 and pos.y > 1.3 and velocity_y <= 0 then
        pos.y = 2.1
        velocity_y = 0
        is_grounded = true
    end

    -- Platform2: x=10, y=3, size=4x0.4
    if pos.x > 8 and pos.x < 12 and pos.y < 3.6 and pos.y > 2.8 and velocity_y <= 0 then
        pos.y = 3.6
        velocity_y = 0
        is_grounded = true
    end

    -- Platform3: x=15, y=5, size=4x0.4
    if pos.x > 13 and pos.x < 17 and pos.y < 5.6 and pos.y > 4.8 and velocity_y <= 0 then
        pos.y = 5.6
        velocity_y = 0
        is_grounded = true
    end

    -- 下限チェック
    if pos.y < -5 then
        -- リスポーン
        pos.x = -10
        pos.y = 1
        velocity_y = 0
        print("Player respawned!")
    end

    gameobject.transform.position = pos
end`,
    },
    {
      id: "camera_follow",
      name: "CameraFollow",
      lua_code: `-- 横スクロールカメラ（プレイヤーのX座標を追従）
local smooth_speed = 5
local offset_x = 0
local offset_y = 3
local offset_z = 12

function on_start()
    print("Camera follow initialized")
end

function on_update(dt)
    -- プレイヤーを名前で検索
    local player = find_gameobject("Player")
    if player then
        local target_x = player.transform.position.x + offset_x
        local current_x = gameobject.transform.position.x

        -- スムーズに追従
        local new_x = current_x + (target_x - current_x) * smooth_speed * dt

        gameobject.transform.position.x = new_x
        gameobject.transform.position.y = offset_y
        gameobject.transform.position.z = offset_z
    end
end`,
    },
    {
      id: "enemy_patrol",
      name: "EnemyPatrol",
      lua_code: `-- 敵のパトロール（左右往復）
local patrol_distance = 2
local patrol_speed = 1.5
local start_x = 0
local direction = 1

function on_start()
    start_x = gameobject.transform.position.x
    print("Enemy patrol started at x=" .. start_x)
end

function on_update(dt)
    local pos = gameobject.transform.position

    -- 左右に往復移動
    pos.x = pos.x + direction * patrol_speed * dt

    -- 範囲チェックで方向転換
    if pos.x > start_x + patrol_distance then
        direction = -1
    elseif pos.x < start_x - patrol_distance then
        direction = 1
    end

    gameobject.transform.position = pos
end

-- プレイヤーとの衝突判定（トリガー）
function on_trigger_enter(other)
    if other.name == "Player" then
        print("Player hit by enemy! Game Over!")
    end
end`,
    },
    {
      id: "coin_rotate",
      name: "CoinRotate",
      lua_code: `-- コインの回転と収集
local rotation_speed = 3
local collected = false

function on_start()
    print("Coin spawned at: x=" .. gameobject.transform.position.x .. ", y=" .. gameobject.transform.position.y)
end

function on_update(dt)
    if collected then
        -- 収集済みの場合は画面外に移動（destroy未実装のため）
        gameobject.transform.position.y = -100
        return
    end

    -- Y軸回転
    local rot = gameobject.transform.rotation
    rot.y = rot.y + rotation_speed * dt
    gameobject.transform.rotation = rot
end

-- プレイヤーとの衝突判定（トリガー）
function on_trigger_enter(other)
    if other.name == "Player" and not collected then
        collected = true
        print("Coin collected! ⭐")
        -- 画面外に移動
        gameobject.transform.position.y = -100
    end
end`,
    },
    {
      id: "goal_checker",
      name: "GoalChecker",
      lua_code: `-- ゴール判定
local goal_reached = false
local rotation_speed = 1

function on_start()
    print("Goal ready at position: x=" .. gameobject.transform.position.x)
end

function on_update(dt)
    -- ゴールを回転させて目立たせる
    local rot = gameobject.transform.rotation
    rot.y = rot.y + rotation_speed * dt
    gameobject.transform.rotation = rot
end

-- プレイヤーとの衝突判定（トリガー）
function on_trigger_enter(other)
    if other.name == "Player" and not goal_reached then
        goal_reached = true
        print("🎉 GOAL! Game Clear! 🎉")
    end
end`,
    },
  ],
};
