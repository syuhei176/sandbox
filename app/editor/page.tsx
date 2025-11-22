"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SceneHierarchy } from "@/components/editor/SceneHierarchy";
import { Inspector } from "@/components/editor/Inspector";
import { Viewport3D } from "@/components/editor/Viewport3D";
import { ScriptEditor } from "@/components/editor/ScriptEditor";
import type {
  GameObject,
  ScriptDefinition,
  GameSpec,
} from "@/lib/types/gamespec";

export default function EditorPage() {
  const router = useRouter();
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [gameObjects, setGameObjects] = useState<GameObject[]>([
    // Sample game object
    {
      id: "obj-1",
      name: "Ground",
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 10, y: 0.1, z: 10 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x808080,
            width: 1,
            height: 1,
            depth: 1,
          },
        },
      ],
    },
    {
      id: "obj-2",
      name: "Cube",
      transform: {
        position: { x: 0, y: 2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
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
      script_id: "script-1",
    },
  ]);

  const [scripts, setScripts] = useState<ScriptDefinition[]>([
    {
      id: "script-1",
      name: "RotateCube",
      lua_code: `-- Rotate the cube over time
local rotation_speed = 1.0

function on_start()
  print("Cube started!")
end

function on_update(dt)
  if gameobject then
    gameobject.transform.rotation.y = gameobject.transform.rotation.y + (rotation_speed * dt)
  end
end`,
    },
  ]);

  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);

  const selectedObject = gameObjects.find((obj) => obj.id === selectedObjectId);
  const selectedScript = scripts.find(
    (script) => script.id === selectedScriptId,
  );

  const handleObjectSelect = (objectId: string) => {
    setSelectedObjectId(objectId);
  };

  const handleObjectUpdate = (
    objectId: string,
    updates: Partial<GameObject>,
  ) => {
    setGameObjects((prev) =>
      prev.map((obj) => (obj.id === objectId ? { ...obj, ...updates } : obj)),
    );
  };

  const handleScriptUpdate = (scriptId: string, code: string) => {
    setScripts((prev) =>
      prev.map((script) =>
        script.id === scriptId ? { ...script, lua_code: code } : script,
      ),
    );
  };

  const handlePlayGame = () => {
    // Convert editor state to GameSpec format
    const gameSpec: GameSpec = {
      meta: {
        title: "Editor Game",
        description: "Game created in editor",
        version: "1.0.0",
      },
      players: {
        min: 1,
        max: 4,
        spawn_points: [{ x: 0, y: 1, z: 5 }],
      },
      worlds: [
        {
          id: "world-1",
          name: "Main World",
          environment: {
            ambient_light: {
              color: "#ffffff",
              intensity: 0.5,
            },
            directional_light: {
              color: "#ffffff",
              intensity: 1,
              position: { x: 10, y: 10, z: 10 },
            },
          },
          objects: gameObjects,
        },
      ],
      scripts: scripts,
    };

    // Save to localStorage
    localStorage.setItem("editorGameSpec", JSON.stringify(gameSpec));

    // Navigate to runtime
    router.push("/runtime");
  };

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-gray-100 flex-col">
      {/* Toolbar */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2">
        <button
          onClick={handlePlayGame}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium transition-colors"
          title="Play Game"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 2l10 6-10 6V2z" />
          </svg>
          Play
        </button>
      </div>

      {/* Main Editor Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Scene Hierarchy */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">Hierarchy</h2>
          </div>
          <SceneHierarchy
            gameObjects={gameObjects}
            selectedObjectId={selectedObjectId}
            onObjectSelect={handleObjectSelect}
          />
        </div>

        {/* Center - 3D Viewport */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <Viewport3D
              gameObjects={gameObjects}
              selectedObjectId={selectedObjectId}
            />
          </div>

          {/* Bottom Panel - Script Editor */}
          <div className="h-80 bg-gray-800 border-t border-gray-700">
            <ScriptEditor
              scripts={scripts}
              selectedScriptId={selectedScriptId}
              onScriptSelect={setSelectedScriptId}
              onScriptUpdate={handleScriptUpdate}
            />
          </div>
        </div>

        {/* Right Panel - Inspector */}
        <div className="w-80 bg-gray-800 border-l border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">Inspector</h2>
          </div>
          <Inspector
            selectedObject={selectedObject}
            onObjectUpdate={handleObjectUpdate}
          />
        </div>
      </div>
    </div>
  );
}
