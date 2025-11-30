"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameEngine } from "@/lib/runtime/game-engine";
import type { GameSpec } from "@/lib/types/gamespec";
import {
  defaultGameObjects,
  defaultScripts,
} from "@/lib/defaults/default-game";

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
      objects: defaultGameObjects,
    },
  ],
  scripts: defaultScripts,
};

export default function RuntimePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<
    ReturnType<GameEngine["getDebugInfo"]>
  >({});

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

  // Update debug info every frame
  useEffect(() => {
    let animationFrameId: number;

    const updateDebugInfo = () => {
      if (engineRef.current) {
        setDebugInfo(engineRef.current.getDebugInfo());
      }
      animationFrameId = requestAnimationFrame(updateDebugInfo);
    };

    updateDebugInfo();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
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

      {/* Debug HUD */}
      {debugInfo.cameraRot && (
        <div className="absolute top-20 right-4 bg-black bg-opacity-75 text-white p-4 rounded text-sm font-mono space-y-1">
          <div className="font-bold mb-2 text-green-400">Debug Info</div>
          <div>
            Camera Y: {debugInfo.cameraRot.y.toFixed(4)} rad (
            {((debugInfo.cameraRot.y * 180) / Math.PI).toFixed(1)}°)
          </div>
          {debugInfo.playerCameraRot && (
            <div
              className={
                debugInfo.playerCameraRot.y !== debugInfo.cameraRot.y
                  ? "text-red-400"
                  : "text-green-400"
              }
            >
              Player sees: {debugInfo.playerCameraRot.y.toFixed(4)} rad (
              {((debugInfo.playerCameraRot.y * 180) / Math.PI).toFixed(1)}°)
            </div>
          )}
          {debugInfo.cameraRot.y !== debugInfo.playerCameraRot?.y && (
            <div className="text-red-400 mt-2">⚠️ MISMATCH!</div>
          )}
        </div>
      )}
    </div>
  );
}
