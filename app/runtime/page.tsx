"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameEngine } from "@/lib/runtime/game-engine";
import type { GameSpec } from "@/lib/types/gamespec";

// Sample game spec for testing - Collectible Item Game
const sampleGameSpec: GameSpec = {
  meta: {
    title: "Collectible Item Game",
    description: "Move with arrow keys and collect colorful items!",
    version: "1.0.0",
  },
  players: {
    min: 1,
    max: 1,
    spawn_points: [{ x: 0, y: 1, z: 0 }],
  },
  worlds: [
    {
      id: "world-1",
      name: "Main World",
      environment: {
        skybox: "#a8dadc",
        ambient_light: {
          color: "#ffffff",
          intensity: 0.6,
        },
        directional_light: {
          color: "#ffffff",
          intensity: 0.8,
          position: { x: 10, y: 10, z: 5 },
        },
      },
      objects: [
        {
          id: "ground",
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
          id: "platform-1",
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
          id: "platform-2",
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
          id: "player",
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
          script_id: "player-controller",
        },
        {
          id: "camera-main",
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
          script_id: "camera-follow",
        },
        {
          id: "collectible-1",
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
                geometry: "sphere",
                color: 0xffd93d,
                radius: 1,
              },
            },
          ],
          script_id: "collectible-rotate",
        },
        {
          id: "collectible-2",
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
                geometry: "sphere",
                color: 0xff6bcf,
                radius: 1,
              },
            },
          ],
          script_id: "collectible-rotate",
        },
        {
          id: "collectible-3",
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
                geometry: "sphere",
                color: 0xff9a3c,
                radius: 1,
              },
            },
          ],
          script_id: "collectible-rotate",
        },
        {
          id: "collectible-4",
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
                geometry: "sphere",
                color: 0x6bcfff,
                radius: 1,
              },
            },
          ],
          script_id: "collectible-rotate",
        },
        {
          id: "point-light",
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
      ],
    },
  ],
  scripts: [
    {
      id: "player-controller",
      name: "PlayerController",
      lua_code: `-- Player Controller with Arrow Keys
local speed = 5.0
local collected = 0

function on_start()
  print("Player ready! Use arrow keys to move.")
end

function on_update(dt)
  if not gameobject then return end

  local moved = false

  -- Movement with arrow keys
  if input and input["arrowup"] then
    gameobject.transform.position.z = gameobject.transform.position.z - speed * dt
    moved = true
  end
  if input and input["arrowdown"] then
    gameobject.transform.position.z = gameobject.transform.position.z + speed * dt
    moved = true
  end
  if input and input["arrowleft"] then
    gameobject.transform.position.x = gameobject.transform.position.x - speed * dt
    moved = true
  end
  if input and input["arrowright"] then
    gameobject.transform.position.x = gameobject.transform.position.x + speed * dt
    moved = true
  end

  -- Keep player above ground
  if gameobject.transform.position.y < 1 then
    gameobject.transform.position.y = 1
  end
end`,
    },
    {
      id: "camera-follow",
      name: "CameraFollow",
      lua_code: `-- Camera follows the player
local offset_x = 0
local offset_y = 8
local offset_z = 8
local frame_count = 0

function on_start()
  print("Camera follow started!")
end

function on_update(dt)
  if not gameobject then
    print("[CameraFollow] gameobject is nil!")
    return
  end

  -- Find the player object
  local player = find_gameobject("Player")

  if player and player.transform then
    -- Follow player with offset
    gameobject.transform.position.x = player.transform.position.x + offset_x
    gameobject.transform.position.y = player.transform.position.y + offset_y
    gameobject.transform.position.z = player.transform.position.z + offset_z

    -- Log every 60 frames
    frame_count = frame_count + 1
    if frame_count % 60 == 0 then
      print("[CameraFollow] Player pos:", player.transform.position.x, player.transform.position.y, player.transform.position.z)
      print("[CameraFollow] Camera pos:", gameobject.transform.position.x, gameobject.transform.position.y, gameobject.transform.position.z)
    end
  else
    print("[CameraFollow] Player not found or no transform!")
  end
end`,
    },
    {
      id: "collectible-rotate",
      name: "CollectibleRotate",
      lua_code: `-- Rotate collectible items
local rotation_speed = 2.0

function on_start()
  print("Collectible spawned!")
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
  ],
};

export default function RuntimePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize gameSpec from localStorage or use sample
  const [gameSpec] = useState<GameSpec>(() => {
    if (typeof window !== "undefined") {
      const storedGameSpec = localStorage.getItem("editorGameSpec");
      if (storedGameSpec) {
        try {
          return JSON.parse(storedGameSpec);
        } catch (err) {
          console.error("Failed to parse stored game spec:", err);
        }
      }
    }
    return sampleGameSpec;
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const initializeGame = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const engine = new GameEngine(canvasRef.current!);
        engineRef.current = engine;

        await engine.loadGame(gameSpec);
        engine.start();

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize game:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsLoading(false);
      }
    };

    initializeGame();

    // Cleanup
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [gameSpec]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (engineRef.current && canvasRef.current) {
        const width = canvasRef.current.clientWidth;
        const height = canvasRef.current.clientHeight;
        engineRef.current.resize(width, height);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-white text-xl">Loading game...</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-red-900 text-white p-6 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Top Bar with Back Button and Game Info */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/editor")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 bg-opacity-75 hover:bg-opacity-100 text-white rounded transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10 2L4 8l6 6V2z" />
          </svg>
          Back to Editor
        </button>

        <div className="bg-black bg-opacity-50 text-white p-3 rounded text-sm">
          <h3 className="font-bold">{gameSpec.meta.title}</h3>
          <p className="text-xs text-gray-300">{gameSpec.meta.description}</p>
        </div>
      </div>

      {/* Controls Info */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded text-xs">
        <p>Camera controls: Click and drag to rotate</p>
      </div>
    </div>
  );
}
