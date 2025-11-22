'use client';

import { useState } from 'react';
import { SceneHierarchy } from '@/components/editor/SceneHierarchy';
import { Inspector } from '@/components/editor/Inspector';
import { Viewport3D } from '@/components/editor/Viewport3D';
import { ScriptEditor } from '@/components/editor/ScriptEditor';
import type { GameObject, ScriptDefinition } from '@/lib/types/gamespec';

export default function EditorPage() {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [gameObjects, setGameObjects] = useState<GameObject[]>([
    // Sample game object
    {
      id: 'obj-1',
      name: 'Ground',
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 10, y: 0.1, z: 10 },
      },
      components: [
        {
          type: 'mesh',
          properties: {
            geometry: 'box',
            color: 0x808080,
            width: 1,
            height: 1,
            depth: 1,
          },
        },
      ],
    },
    {
      id: 'obj-2',
      name: 'Cube',
      transform: {
        position: { x: 0, y: 2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      components: [
        {
          type: 'mesh',
          properties: {
            geometry: 'box',
            color: 0xff6b6b,
            width: 1,
            height: 1,
            depth: 1,
          },
        },
      ],
      script_id: 'script-1',
    },
  ]);

  const [scripts, setScripts] = useState<ScriptDefinition[]>([
    {
      id: 'script-1',
      name: 'RotateCube',
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
  const selectedScript = scripts.find((script) => script.id === selectedScriptId);

  const handleObjectSelect = (objectId: string) => {
    setSelectedObjectId(objectId);
  };

  const handleObjectUpdate = (objectId: string, updates: Partial<GameObject>) => {
    setGameObjects((prev) =>
      prev.map((obj) => (obj.id === objectId ? { ...obj, ...updates } : obj))
    );
  };

  const handleScriptUpdate = (scriptId: string, code: string) => {
    setScripts((prev) =>
      prev.map((script) =>
        script.id === scriptId ? { ...script, lua_code: code } : script
      )
    );
  };

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-gray-100">
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
          <Viewport3D gameObjects={gameObjects} selectedObjectId={selectedObjectId} />
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
  );
}
