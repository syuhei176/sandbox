'use client';

import { useRef, useEffect, useState } from 'react';
import { GameEngine } from '@/lib/runtime/game-engine';
import type { GameSpec } from '@/lib/types/gamespec';

// Sample game spec for testing
const sampleGameSpec: GameSpec = {
  meta: {
    title: 'Sample 3D Game',
    description: 'A simple rotating cube demo',
    version: '1.0.0',
  },
  players: {
    min: 1,
    max: 4,
    spawn_points: [
      { x: 0, y: 1, z: 0 },
      { x: 5, y: 1, z: 0 },
    ],
  },
  worlds: [
    {
      id: 'world-1',
      name: 'Main World',
      environment: {
        skybox: '#87ceeb',
        ambient_light: {
          color: '#ffffff',
          intensity: 0.5,
        },
        directional_light: {
          color: '#ffffff',
          intensity: 0.8,
          position: { x: 10, y: 10, z: 5 },
        },
      },
      objects: [
        {
          id: 'ground',
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
          id: 'cube-1',
          name: 'Rotating Cube',
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
          script_id: 'rotate-script',
        },
        {
          id: 'sphere-1',
          name: 'Sphere',
          transform: {
            position: { x: 3, y: 1.5, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
          },
          components: [
            {
              type: 'mesh',
              properties: {
                geometry: 'sphere',
                color: 0x4ecdc4,
                radius: 0.75,
              },
            },
          ],
        },
        {
          id: 'light-1',
          name: 'Point Light',
          transform: {
            position: { x: -3, y: 3, z: 2 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
          },
          components: [
            {
              type: 'light',
              properties: {
                lightType: 'point',
                color: 0xffe66d,
                intensity: 1,
                distance: 10,
              },
            },
          ],
        },
      ],
    },
  ],
  scripts: [
    {
      id: 'rotate-script',
      name: 'RotateCube',
      lua_code: `-- Rotate the cube over time
local rotation_speed = 1.0

function on_start()
  print("Cube rotation started!")
end

function on_update(dt)
  if gameobject then
    gameobject.transform.rotation.y = gameobject.transform.rotation.y + (rotation_speed * dt)
  end
end`,
    },
  ],
};

export default function RuntimePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const initializeGame = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const engine = new GameEngine(canvasRef.current!);
        engineRef.current = engine;

        await engine.loadGame(sampleGameSpec);
        engine.start();

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize game:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
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
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (engineRef.current && canvasRef.current) {
        const width = canvasRef.current.clientWidth;
        const height = canvasRef.current.clientHeight;
        engineRef.current.resize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
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

      {/* Game Info Overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded text-sm">
        <h3 className="font-bold">{sampleGameSpec.meta.title}</h3>
        <p className="text-xs text-gray-300">{sampleGameSpec.meta.description}</p>
      </div>

      {/* Controls Info */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded text-xs">
        <p>Camera controls: Click and drag to rotate</p>
      </div>
    </div>
  );
}
