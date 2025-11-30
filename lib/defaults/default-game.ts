import type { GameObject, ScriptDefinition } from "../types/gamespec";
import { getTemplateById } from "../templates";

// Use the FPS template as default
const fpsTemplate = getTemplateById("fps");

export const defaultGameObjects: GameObject[] = fpsTemplate?.gameObjects || [
  // Ground
  {
    id: "obj-ground",
    name: "Ground",
    transform: {
      position: { x: 0, y: -0.1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 20, y: 0.2, z: 20 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "box",
          color: 0x2ecc71,
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

  // Obstacles (Walls)
  {
    id: "obj-wall1",
    name: "Wall1",
    transform: {
      position: { x: 3, y: 1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.5, y: 2, z: 3 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "box",
          color: 0x95a5a6,
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
  },
  {
    id: "obj-wall2",
    name: "Wall2",
    transform: {
      position: { x: -4, y: 1, z: 3 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 2, y: 2, z: 0.5 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "box",
          color: 0x95a5a6,
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
  },
  {
    id: "obj-wall3",
    name: "Wall3",
    transform: {
      position: { x: 0, y: 1, z: -5 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 4, y: 2, z: 0.5 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "box",
          color: 0x95a5a6,
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
  },

  // Platforms
  {
    id: "obj-platform1",
    name: "Platform1",
    transform: {
      position: { x: 5, y: 1.5, z: 5 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 2, y: 0.3, z: 2 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "box",
          color: 0xe67e22,
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
  {
    id: "obj-platform2",
    name: "Platform2",
    transform: {
      position: { x: -6, y: 2.5, z: -3 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 2.5, y: 0.3, z: 2.5 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "box",
          color: 0xe67e22,
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
    id: "obj-player",
    name: "Player",
    transform: {
      position: { x: 0, y: 0.5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.5, y: 1, z: 0.5 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "cylinder",
          color: 0x3498db,
          radiusTop: 0.5,
          radiusBottom: 0.5,
          height: 2,
          hasCollision: true,
          collisionShape: "sphere",
          isTrigger: false,
          collisionLayer: 0,
        },
      },
    ],
    script_id: "script-player",
  },

  // Coins (Collectibles)
  {
    id: "obj-coin1",
    name: "Coin1",
    transform: {
      position: { x: 2, y: 0.5, z: 2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.4, y: 0.4, z: 0.1 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "cylinder",
          color: 0xf39c12,
          radiusTop: 1,
          radiusBottom: 1,
          height: 1,
          hasCollision: true,
          collisionShape: "sphere",
          isTrigger: true,
          collisionLayer: 2,
        },
      },
    ],
    script_id: "script-coin",
  },
  {
    id: "obj-coin2",
    name: "Coin2",
    transform: {
      position: { x: -3, y: 0.5, z: -2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.4, y: 0.4, z: 0.1 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "cylinder",
          color: 0xf39c12,
          radiusTop: 1,
          radiusBottom: 1,
          height: 1,
          hasCollision: true,
          collisionShape: "sphere",
          isTrigger: true,
          collisionLayer: 2,
        },
      },
    ],
    script_id: "script-coin",
  },
  {
    id: "obj-coin3",
    name: "Coin3",
    transform: {
      position: { x: 5, y: 2.5, z: 5 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.4, y: 0.4, z: 0.1 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "cylinder",
          color: 0xf39c12,
          radiusTop: 1,
          radiusBottom: 1,
          height: 1,
          hasCollision: true,
          collisionShape: "sphere",
          isTrigger: true,
          collisionLayer: 2,
        },
      },
    ],
    script_id: "script-coin",
  },
  {
    id: "obj-coin4",
    name: "Coin4",
    transform: {
      position: { x: -6, y: 3.5, z: -3 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.4, y: 0.4, z: 0.1 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "cylinder",
          color: 0xf39c12,
          radiusTop: 1,
          radiusBottom: 1,
          height: 1,
          hasCollision: true,
          collisionShape: "sphere",
          isTrigger: true,
          collisionLayer: 2,
        },
      },
    ],
    script_id: "script-coin",
  },
  {
    id: "obj-coin5",
    name: "Coin5",
    transform: {
      position: { x: 6, y: 0.5, z: -6 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.4, y: 0.4, z: 0.1 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "cylinder",
          color: 0xf39c12,
          radiusTop: 1,
          radiusBottom: 1,
          height: 1,
          hasCollision: true,
          collisionShape: "sphere",
          isTrigger: true,
          collisionLayer: 2,
        },
      },
    ],
    script_id: "script-coin",
  },

  // Camera
  {
    id: "obj-camera",
    name: "MainCamera",
    transform: {
      position: { x: 0, y: 10, z: 10 },
      rotation: { x: -0.7, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    components: [
      {
        type: "camera",
        properties: {
          fov: 60,
          aspect: 16 / 9,
          near: 0.1,
          far: 1000,
          isMainCamera: true,
        },
      },
    ],
    script_id: "script-camera",
  },

  // Lights
  {
    id: "obj-light1",
    name: "Light1",
    transform: {
      position: { x: 5, y: 8, z: 5 },
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
          distance: 25,
        },
      },
    ],
  },
  {
    id: "obj-light2",
    name: "Light2",
    transform: {
      position: { x: -5, y: 8, z: -5 },
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
          distance: 25,
        },
      },
    ],
  },
];

export const defaultScripts: ScriptDefinition[] = fpsTemplate?.scripts || [
  {
    id: "script-player",
    name: "PlayerController",
    lua_code: `-- Player Controller with NATIVE COLLISION DETECTION
local speed = 5.0
local jump_force = 8.0
local gravity = -20.0
local velocity_y = 0
local is_grounded = false

function on_start()
  print("Player Controller Started (Native Collision)")
  print("Controls: Arrow Keys to move, Space to jump")
  print("Collision detection is now handled by the engine!")
end

function on_update(dt)
  if not gameobject then return end

  local pos = gameobject.transform.position

  -- Movement with arrow keys
  if input and input["arrowup"] then
    gameobject.transform.position.z = pos.z - speed * dt
  end
  if input and input["arrowdown"] then
    gameobject.transform.position.z = pos.z + speed * dt
  end
  if input and input["arrowleft"] then
    gameobject.transform.position.x = pos.x - speed * dt
  end
  if input and input["arrowright"] then
    gameobject.transform.position.x = pos.x + speed * dt
  end

  -- Jump with Space key
  if input and input[" "] and is_grounded then
    velocity_y = jump_force
    is_grounded = false
  end

  -- Apply gravity
  velocity_y = velocity_y + gravity * dt
  gameobject.transform.position.y = pos.y + velocity_y * dt

  -- Ground collision
  if gameobject.transform.position.y <= 0.5 then
    gameobject.transform.position.y = 0.5
    velocity_y = 0
    is_grounded = true
  else
    is_grounded = false
  end

  -- Keep player in bounds
  if gameobject.transform.position.x < -9 then gameobject.transform.position.x = -9 end
  if gameobject.transform.position.x > 9 then gameobject.transform.position.x = 9 end
  if gameobject.transform.position.z < -9 then gameobject.transform.position.z = -9 end
  if gameobject.transform.position.z > 9 then gameobject.transform.position.z = 9 end
end

-- NATIVE COLLISION CALLBACK - called automatically by engine
function on_collision(other)
  if other.name:match("^Wall") then
    print("Hit wall: " .. other.name)
    -- Collision response is automatic!
  end

  if other.name:match("^Platform") then
    -- Landing on platform
    is_grounded = true
    velocity_y = 0
  end
end

-- TRIGGER CALLBACK - for collectibles
function on_trigger_enter(other)
  if other.name:match("^Coin") then
    print("Collected coin: " .. other.name)
  end
end`,
  },
  {
    id: "script-camera",
    name: "CameraFollow",
    lua_code: `-- Camera follows the player smoothly
local offset_x = 0
local offset_y = 8
local offset_z = 8
local smoothness = 5.0

function on_start()
end

function on_update(dt)
  if not gameobject then return end

  local player = find_gameobject("Player")

  if player and player.transform then
    local target_x = player.transform.position.x + offset_x
    local target_y = player.transform.position.y + offset_y
    local target_z = player.transform.position.z + offset_z

    -- Smooth follow with lerp
    local current_x = gameobject.transform.position.x
    local current_y = gameobject.transform.position.y
    local current_z = gameobject.transform.position.z

    gameobject.transform.position.x = current_x + (target_x - current_x) * smoothness * dt
    gameobject.transform.position.y = current_y + (target_y - current_y) * smoothness * dt
    gameobject.transform.position.z = current_z + (target_z - current_z) * smoothness * dt
  end
end`,
  },
  {
    id: "script-coin",
    name: "CoinRotateAndCollect",
    lua_code: `-- Coin with rotation animation and collection
local rotation_speed = 3.0
local bob_speed = 2.0
local bob_amount = 0.3
local start_y = 0
local collected = false

function on_start()
  if gameobject then
    start_y = gameobject.transform.position.y
  end
end

function on_update(dt)
  if not gameobject or collected then return end

  -- Rotate around Y axis
  gameobject.transform.rotation.y = gameobject.transform.rotation.y + rotation_speed * dt

  -- Bob up and down
  local time_offset = (gameobject.transform.position.x + gameobject.transform.position.z) * 0.5
  local bob = math.sin((dt * bob_speed + time_offset) * 5) * bob_amount * dt
  gameobject.transform.position.y = gameobject.transform.position.y + bob
end

-- TRIGGER CALLBACK - when player collects this coin
function on_trigger_enter(other)
  if other.name == "Player" and not collected then
    collected = true
    -- Hide coin by moving it far away
    gameobject.transform.position.y = -100
    print("Coin collected!")
  end
end`,
  },
];
