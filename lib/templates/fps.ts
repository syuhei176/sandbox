import type { GameTemplate } from "./types";

export const fpsTemplate: GameTemplate = {
  id: "fps",
  name: "First Person Shooter",
  description: "一人称視点のシューティングゲーム。マウスで照準、WASDで移動。",
  gameObjects: [
    // Ground
    {
      id: "obj-ground",
      name: "Ground",
      transform: {
        position: { x: 0, y: -0.1, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 50, y: 0.2, z: 50 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x556b2f,
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
    // Walls - Create a simple arena
    {
      id: "obj-wall-north",
      name: "WallNorth",
      transform: {
        position: { x: 0, y: 2, z: -25 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 50, y: 4, z: 0.5 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x8b4513,
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
      id: "obj-wall-south",
      name: "WallSouth",
      transform: {
        position: { x: 0, y: 2, z: 25 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 50, y: 4, z: 0.5 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x8b4513,
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
      id: "obj-wall-east",
      name: "WallEast",
      transform: {
        position: { x: 25, y: 2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.5, y: 4, z: 50 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x8b4513,
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
      id: "obj-wall-west",
      name: "WallWest",
      transform: {
        position: { x: -25, y: 2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.5, y: 4, z: 50 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x8b4513,
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
    // Cover objects
    {
      id: "obj-cover1",
      name: "Cover1",
      transform: {
        position: { x: 5, y: 1, z: 5 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 2, y: 2, z: 2 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x696969,
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
      id: "obj-cover2",
      name: "Cover2",
      transform: {
        position: { x: -8, y: 1, z: 8 },
        rotation: { x: 0, y: 0.5, z: 0 },
        scale: { x: 3, y: 2, z: 1 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x696969,
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
      id: "obj-cover3",
      name: "Cover3",
      transform: {
        position: { x: 10, y: 1, z: -10 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 2, y: 2, z: 4 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x696969,
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
    // Target enemies
    {
      id: "obj-target1",
      name: "Target1",
      transform: {
        position: { x: 0, y: 1, z: -15 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 2, z: 1 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0xff4444,
            width: 1,
            height: 1,
            depth: 1,
            hasCollision: true,
            collisionShape: "box",
            isTrigger: false,
            collisionLayer: 2,
          },
        },
      ],
      script_id: "script-target",
    },
    {
      id: "obj-target2",
      name: "Target2",
      transform: {
        position: { x: -10, y: 1, z: -10 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 2, z: 1 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0xff4444,
            width: 1,
            height: 1,
            depth: 1,
            hasCollision: true,
            collisionShape: "box",
            isTrigger: false,
            collisionLayer: 2,
          },
        },
      ],
      script_id: "script-target",
    },
    {
      id: "obj-target3",
      name: "Target3",
      transform: {
        position: { x: 10, y: 1, z: 5 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 2, z: 1 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0xff4444,
            width: 1,
            height: 1,
            depth: 1,
            hasCollision: true,
            collisionShape: "box",
            isTrigger: false,
            collisionLayer: 2,
          },
        },
      ],
      script_id: "script-target",
    },
    // FPS Player (invisible collider)
    {
      id: "obj-fps-player",
      name: "FPSPlayer",
      transform: {
        position: { x: 0, y: 1, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1.8, z: 1 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x3498db,
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
      script_id: "script-fps-player",
    },
    // FPS Camera (attached to player position)
    {
      id: "obj-fps-camera",
      name: "FPSCamera",
      transform: {
        position: { x: 0, y: 1.6, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      components: [
        {
          type: "camera",
          properties: {
            fov: 75,
            aspect: 16 / 9,
            near: 0.1,
            far: 1000,
            isMainCamera: true,
          },
        },
      ],
      script_id: "script-fps-camera",
    },
    // Weapon (visual representation)
    {
      id: "obj-weapon",
      name: "Weapon",
      transform: {
        position: { x: 0.3, y: 1.2, z: -0.5 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.1, y: 0.1, z: 0.8 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x333333,
            width: 1,
            height: 1,
            depth: 1,
          },
        },
      ],
      script_id: "script-weapon",
    },
    // Lights
    {
      id: "obj-ambient-light",
      name: "AmbientLight",
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      components: [
        {
          type: "light",
          properties: {
            lightType: "ambient",
            color: 0xffffff,
            intensity: 0.5,
          },
        },
      ],
    },
    {
      id: "obj-directional-light",
      name: "DirectionalLight",
      transform: {
        position: { x: 10, y: 20, z: 10 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      components: [
        {
          type: "light",
          properties: {
            lightType: "directional",
            color: 0xffffff,
            intensity: 0.8,
          },
        },
      ],
    },
  ],
  scripts: [
    {
      id: "script-fps-player",
      name: "FPSPlayerController",
      lua_code: `-- FPS Player Controller
local move_speed = 8.0
local gravity = -20.0
local jump_force = 10.0
local velocity_y = 0
local is_grounded = true
local rotation_y = 0
local mouse_sensitivity = 0.002

function on_start()
  print("FPS Player Started - WASD to move, Space to jump")
end

function on_update(dt)
  if not gameobject then return end

  local pos = gameobject.transform.position

  -- Update rotation from mouse input
  if mouse_movement and mouse_movement.x ~= 0 then
    rotation_y = rotation_y - mouse_movement.x * mouse_sensitivity
  end
  -- Store rotation in transform so camera can read it
  gameobject.transform.rotation.y = rotation_y

  -- Calculate movement vectors based on rotation
  -- Three.js: rotation_y negative = looking right, so negate sin for forward_x
  local forward_x = -math.sin(rotation_y)
  local forward_z = -math.cos(rotation_y)
  local right_x = math.cos(rotation_y)
  local right_z = -math.sin(rotation_y)

  local move_x = 0
  local move_z = 0

  if input and input["w"] then
    move_x = move_x + forward_x
    move_z = move_z + forward_z
  end
  if input and input["s"] then
    move_x = move_x - forward_x
    move_z = move_z - forward_z
  end
  if input and input["a"] then
    move_x = move_x - right_x
    move_z = move_z - right_z
  end
  if input and input["d"] then
    move_x = move_x + right_x
    move_z = move_z + right_z
  end

  -- Normalize
  local move_length = math.sqrt(move_x * move_x + move_z * move_z)
  if move_length > 0 then
    move_x = move_x / move_length
    move_z = move_z / move_length
  end

  -- Apply movement
  gameobject.transform.position.x = pos.x + move_x * move_speed * dt
  gameobject.transform.position.z = pos.z + move_z * move_speed * dt

  -- Jump & gravity
  if input and input[" "] and is_grounded then
    velocity_y = jump_force
    is_grounded = false
  end

  velocity_y = velocity_y + gravity * dt
  gameobject.transform.position.y = pos.y + velocity_y * dt

  if gameobject.transform.position.y <= 1 then
    gameobject.transform.position.y = 1
    velocity_y = 0
    is_grounded = true
  end

  -- Bounds
  if gameobject.transform.position.x < -24 then gameobject.transform.position.x = -24 end
  if gameobject.transform.position.x > 24 then gameobject.transform.position.x = 24 end
  if gameobject.transform.position.z < -24 then gameobject.transform.position.z = -24 end
  if gameobject.transform.position.z > 24 then gameobject.transform.position.z = 24 end

  -- Debug output
  local camera = find_gameobject("FPSCamera")
  local cam_pos = camera and camera.transform.position or {x=0,y=0,z=0}
  local cam_rot = camera and camera.transform.rotation or {x=0,y=0,z=0}
  print(string.format("Player pos=(%.2f, %.2f, %.2f) rot_y=%.2f", pos.x, pos.y, pos.z, math.deg(rotation_y)))
  print(string.format("Camera pos=(%.2f, %.2f, %.2f) rot_y=%.2f", cam_pos.x, cam_pos.y, cam_pos.z, math.deg(cam_rot.y)))
end

function on_collision(other)
  if other.name:match("^Wall") or other.name:match("^Cover") then
    print("Collided with: " .. other.name)
  end
  if other.name:match("^Ground") then
    is_grounded = true
    velocity_y = 0
  end
end`,
    },
    {
      id: "script-fps-camera",
      name: "FPSCameraController",
      lua_code: `-- FPS Camera Controller
local mouse_sensitivity = 0.002
local rotation_x = 0

function on_start()
  print("FPS Camera Started - Mouse to look around")
end

function on_update(dt)
  if not gameobject then return end

  -- Get player for position and Y rotation
  local player = find_gameobject("FPSPlayer")
  if not player then return end

  -- Handle vertical mouse look (X rotation) only - Y rotation comes from player
  if mouse_movement and mouse_movement.y ~= 0 then
    rotation_x = rotation_x - mouse_movement.y * mouse_sensitivity

    if rotation_x > 1.5 then rotation_x = 1.5 end
    if rotation_x < -1.5 then rotation_x = -1.5 end
  end

  -- Follow player position
  gameobject.transform.position.x = player.transform.position.x
  gameobject.transform.position.y = player.transform.position.y + 0.6
  gameobject.transform.position.z = player.transform.position.z

  -- Use player's Y rotation, camera's X rotation (vertical look)
  gameobject.transform.rotation.x = rotation_x
  gameobject.transform.rotation.y = player.transform.rotation.y

  -- Debug output
  local rotation_y_deg = math.deg(player.transform.rotation.y)
  print(string.format("Camera: rot_y=%.4f rad (%.1f deg)", player.transform.rotation.y, rotation_y_deg))
end`,
    },
    {
      id: "script-weapon",
      name: "WeaponFollow",
      lua_code: `-- Weapon follows camera
function on_start()
end

function on_update(dt)
  if not gameobject then return end

  local camera = find_gameobject("FPSCamera")
  if camera then
    -- Position relative to camera
    local cam_rot_y = camera.transform.rotation.y
    local offset_x = 0.3
    local offset_z = -0.5

    local rotated_x = offset_x * math.cos(cam_rot_y) - offset_z * math.sin(cam_rot_y)
    local rotated_z = offset_x * math.sin(cam_rot_y) + offset_z * math.cos(cam_rot_y)

    gameobject.transform.position.x = camera.transform.position.x + rotated_x
    gameobject.transform.position.y = camera.transform.position.y - 0.4
    gameobject.transform.position.z = camera.transform.position.z + rotated_z

    gameobject.transform.rotation.y = cam_rot_y
  end
end`,
    },
    {
      id: "script-target",
      name: "TargetBehavior",
      lua_code: `-- Target that can be shot
local health = 3
local hit_flash_time = 0
local original_color = 0xff4444

function on_start()
  print("Target initialized with " .. health .. " health")
end

function on_update(dt)
  if not gameobject then return end

  -- Flash effect when hit
  if hit_flash_time > 0 then
    hit_flash_time = hit_flash_time - dt
    if hit_flash_time <= 0 then
      -- Reset color
      if gameobject.components and gameobject.components[1] then
        gameobject.components[1].properties.color = original_color
      end
    end
  end

  -- Simple idle animation
  local time = dt * 2
  gameobject.transform.position.y = 1 + math.sin(time) * 0.1
end

function on_hit()
  health = health - 1
  print("Target hit! Health: " .. health)

  -- Flash white
  hit_flash_time = 0.1
  if gameobject.components and gameobject.components[1] then
    gameobject.components[1].properties.color = 0xffffff
  end

  if health <= 0 then
    print("Target destroyed!")
    gameobject.transform.position.y = -100
  end
end`,
    },
  ],
};
