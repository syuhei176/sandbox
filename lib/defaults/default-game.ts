import type { GameObject, ScriptDefinition } from "../types/gamespec";

export const defaultGameObjects: GameObject[] = [
  {
    id: "obj-ground",
    name: "Ground",
    transform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 15, y: 0.2, z: 15 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "box",
          color: 0x95e1d3,
          width: 1,
          height: 1,
          depth: 1,
        },
      },
    ],
  },
  {
    id: "obj-platform1",
    name: "Platform1",
    transform: {
      position: { x: 3, y: 0.5, z: 3 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 2, y: 0.3, z: 2 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "box",
          color: 0xff6b6b,
          width: 1,
          height: 1,
          depth: 1,
        },
      },
    ],
  },
  {
    id: "obj-platform2",
    name: "Platform2",
    transform: {
      position: { x: -4, y: 1.0, z: -2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 2.5, y: 0.3, z: 2.5 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "box",
          color: 0xffe66d,
          width: 1,
          height: 1,
          depth: 1,
        },
      },
    ],
  },
  {
    id: "obj-player",
    name: "Player",
    transform: {
      position: { x: 0, y: 1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.5, y: 1, z: 0.5 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "cylinder",
          color: 0x4ecdc4,
          radiusTop: 0.5,
          radiusBottom: 0.5,
          height: 2,
        },
      },
    ],
    script_id: "script-player",
  },
  {
    id: "obj-camera",
    name: "MainCamera",
    transform: {
      position: { x: 0, y: 8, z: 8 },
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
  {
    id: "obj-collectible1",
    name: "Collectible1",
    transform: {
      position: { x: 2, y: 1.5, z: 2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.3, y: 0.3, z: 0.3 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "box",
          color: 0xffd93d,
          width: 1,
          height: 1,
          depth: 1,
        },
      },
    ],
    script_id: "script-collectible",
  },
  {
    id: "obj-collectible2",
    name: "Collectible2",
    transform: {
      position: { x: -3, y: 1.5, z: 3 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.3, y: 0.3, z: 0.3 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "box",
          color: 0xff6bcf,
          width: 1,
          height: 1,
          depth: 1,
        },
      },
    ],
    script_id: "script-collectible",
  },
  {
    id: "obj-collectible3",
    name: "Collectible3",
    transform: {
      position: { x: 4, y: 2, z: -3 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.3, y: 0.3, z: 0.3 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "box",
          color: 0xff9a3c,
          width: 1,
          height: 1,
          depth: 1,
        },
      },
    ],
    script_id: "script-collectible",
  },
  {
    id: "obj-collectible4",
    name: "Collectible4",
    transform: {
      position: { x: -4, y: 2.5, z: -2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.3, y: 0.3, z: 0.3 },
    },
    components: [
      {
        type: "mesh",
        properties: {
          geometry: "box",
          color: 0x6bcfff,
          width: 1,
          height: 1,
          depth: 1,
        },
      },
    ],
    script_id: "script-collectible",
  },
  {
    id: "obj-light",
    name: "PointLight",
    transform: {
      position: { x: 0, y: 5, z: 0 },
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
];

export const defaultScripts: ScriptDefinition[] = [
  {
    id: "script-player",
    name: "PlayerController",
    lua_code: `-- Player Controller with Arrow Keys
local speed = 5.0

function on_start()
end

function on_update(dt)
  if not gameobject then return end

  -- Movement with arrow keys
  if input and input["arrowup"] then
    gameobject.transform.position.z = gameobject.transform.position.z - speed * dt
  end
  if input and input["arrowdown"] then
    gameobject.transform.position.z = gameobject.transform.position.z + speed * dt
  end
  if input and input["arrowleft"] then
    gameobject.transform.position.x = gameobject.transform.position.x - speed * dt
  end
  if input and input["arrowright"] then
    gameobject.transform.position.x = gameobject.transform.position.x + speed * dt
  end

  -- Keep player above ground
  if gameobject.transform.position.y < 1 then
    gameobject.transform.position.y = 1
  end
end`,
  },
  {
    id: "script-camera",
    name: "CameraFollow",
    lua_code: `-- Camera follows the player
local offset_x = 0
local offset_y = 5
local offset_z = 10

function on_start()
end

function on_update(dt)
  if not gameobject then return end

  -- Find the player object
  local player = find_gameobject("Player")

  if player and player.transform then
    -- Follow player with offset
    gameobject.transform.position.x = player.transform.position.x + offset_x
    gameobject.transform.position.y = player.transform.position.y + offset_y
    gameobject.transform.position.z = player.transform.position.z + offset_z
  end
end`,
  },
  {
    id: "script-collectible",
    name: "CollectibleRotate",
    lua_code: `-- Rotate collectible items
local rotation_speed = 2.0

function on_start()
end

function on_update(dt)
  if gameobject then
    -- Rotate the collectible
    gameobject.transform.rotation.y = gameobject.transform.rotation.y + (rotation_speed * dt)

    -- Bob up and down
    local time = dt * 2
    gameobject.transform.position.y = gameobject.transform.position.y + math.sin(time) * 0.01
  end
end`,
  },
];
