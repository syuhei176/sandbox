import { describe, it, expect, beforeEach, vi } from "vitest";
import { GameEngine } from "./game-engine";
import type { GameSpec } from "../types/gamespec";

// Mock THREE.WebGLRenderer to avoid WebGL issues in tests
vi.mock("three", async () => {
  const actual = await vi.importActual<typeof import("three")>("three");

  class MockWebGLRenderer {
    domElement = document.createElement("canvas");
    setSize = vi.fn();
    setPixelRatio = vi.fn();
    render = vi.fn();
    dispose = vi.fn();
  }

  return {
    ...actual,
    WebGLRenderer: MockWebGLRenderer,
  };
});

describe("Input Handling", () => {
  let canvas: HTMLCanvasElement;
  let engine: GameEngine;

  beforeEach(() => {
    // Create a mock canvas
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);

    // Mock pointer lock API (not available in jsdom by default)
    canvas.requestPointerLock = vi.fn();

    engine = new GameEngine(canvas);
  });

  describe("Keyboard State Initialization", () => {
    it("should initialize common keys to false", async () => {
      const gameSpec: GameSpec = {
        meta: { title: "Test Game", version: "1.0.0" },
        players: { min: 1, max: 1, spawn_points: [{ x: 0, y: 0, z: 0 }] },
        worlds: [
          {
            id: "world-1",
            name: "Test World",
            objects: [],
          },
        ],
        scripts: [],
      };

      await engine.loadGame(gameSpec);

      // Access private keyboardState through engine's internal state
      // We'll verify this by checking that input is passed to Lua VM correctly
      const keyboardState = (
        engine as unknown as { keyboardState: { [key: string]: boolean } }
      ).keyboardState;

      // Common keys should be initialized to false
      expect(keyboardState["w"]).toBe(false);
      expect(keyboardState["a"]).toBe(false);
      expect(keyboardState["s"]).toBe(false);
      expect(keyboardState["d"]).toBe(false);
      expect(keyboardState["arrowup"]).toBe(false);
      expect(keyboardState["arrowdown"]).toBe(false);
      expect(keyboardState["arrowleft"]).toBe(false);
      expect(keyboardState["arrowright"]).toBe(false);
      expect(keyboardState[" "]).toBe(false); // space
      expect(keyboardState["shift"]).toBe(false);
      expect(keyboardState["control"]).toBe(false);
      expect(keyboardState["escape"]).toBe(false);
      expect(keyboardState["enter"]).toBe(false);
    });

    it("should not have undefined keys for common inputs", () => {
      const keyboardState = (
        engine as unknown as { keyboardState: { [key: string]: boolean } }
      ).keyboardState;

      // Keys should exist with explicit false, not undefined
      expect(keyboardState["w"]).not.toBeUndefined();
      expect(keyboardState["arrowleft"]).not.toBeUndefined();
      expect(keyboardState[" "]).not.toBeUndefined();
    });
  });

  describe("Canvas Focus Management", () => {
    it("should make canvas focusable with tabIndex", () => {
      engine.start();

      expect(canvas.tabIndex).toBe(0);
    });

    it("should focus the canvas on start", () => {
      const focusSpy = vi.spyOn(canvas, "focus");

      engine.start();

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe("Pointer Lock Control", () => {
    it("should not request pointer lock when usePointerLock is false", async () => {
      const requestPointerLockSpy = vi.spyOn(canvas, "requestPointerLock");

      const gameSpec: GameSpec = {
        meta: { title: "2D Game", version: "1.0.0" },
        players: { min: 1, max: 1, spawn_points: [{ x: 0, y: 0, z: 0 }] },
        worlds: [
          {
            id: "world-1",
            name: "Test World",
            objects: [
              {
                id: "camera",
                name: "MainCamera",
                transform: {
                  position: { x: 0, y: 0, z: 5 },
                  rotation: { x: 0, y: 0, z: 0 },
                  scale: { x: 1, y: 1, z: 1 },
                },
                components: [
                  {
                    type: "camera",
                    properties: {
                      fov: 75,
                      isMainCamera: true,
                      usePointerLock: false, // 2D game
                    },
                  },
                ],
              },
            ],
          },
        ],
        scripts: [],
      };

      await engine.loadGame(gameSpec);
      engine.start();

      // Simulate canvas click
      const clickEvent = new MouseEvent("click");
      canvas.dispatchEvent(clickEvent);

      // Should NOT request pointer lock
      expect(requestPointerLockSpy).not.toHaveBeenCalled();
    });

    it("should request pointer lock when usePointerLock is true", async () => {
      const requestPointerLockSpy = vi.spyOn(canvas, "requestPointerLock");

      const gameSpec: GameSpec = {
        meta: { title: "FPS Game", version: "1.0.0" },
        players: { min: 1, max: 1, spawn_points: [{ x: 0, y: 0, z: 0 }] },
        worlds: [
          {
            id: "world-1",
            name: "Test World",
            objects: [
              {
                id: "camera",
                name: "FPSCamera",
                transform: {
                  position: { x: 0, y: 0, z: 5 },
                  rotation: { x: 0, y: 0, z: 0 },
                  scale: { x: 1, y: 1, z: 1 },
                },
                components: [
                  {
                    type: "camera",
                    properties: {
                      fov: 75,
                      isMainCamera: true,
                      usePointerLock: true, // FPS game
                    },
                  },
                ],
              },
            ],
          },
        ],
        scripts: [],
      };

      await engine.loadGame(gameSpec);
      engine.start();

      // Simulate canvas click
      const clickEvent = new MouseEvent("click");
      canvas.dispatchEvent(clickEvent);

      // SHOULD request pointer lock
      expect(requestPointerLockSpy).toHaveBeenCalled();
    });

    it("should default to no pointer lock when usePointerLock is not specified", async () => {
      const requestPointerLockSpy = vi.spyOn(canvas, "requestPointerLock");

      const gameSpec: GameSpec = {
        meta: { title: "Default Game", version: "1.0.0" },
        players: { min: 1, max: 1, spawn_points: [{ x: 0, y: 0, z: 0 }] },
        worlds: [
          {
            id: "world-1",
            name: "Test World",
            objects: [
              {
                id: "camera",
                name: "Camera",
                transform: {
                  position: { x: 0, y: 0, z: 5 },
                  rotation: { x: 0, y: 0, z: 0 },
                  scale: { x: 1, y: 1, z: 1 },
                },
                components: [
                  {
                    type: "camera",
                    properties: {
                      fov: 75,
                      isMainCamera: true,
                      // usePointerLock not specified
                    },
                  },
                ],
              },
            ],
          },
        ],
        scripts: [],
      };

      await engine.loadGame(gameSpec);
      engine.start();

      // Simulate canvas click
      const clickEvent = new MouseEvent("click");
      canvas.dispatchEvent(clickEvent);

      // Should NOT request pointer lock by default
      expect(requestPointerLockSpy).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Event Handling", () => {
    it("should set keyboard state to true on keydown", () => {
      engine.start();

      const keyboardState = (
        engine as unknown as { keyboardState: { [key: string]: boolean } }
      ).keyboardState;

      // Simulate key down
      const keydownEvent = new KeyboardEvent("keydown", { key: "w" });
      window.dispatchEvent(keydownEvent);

      expect(keyboardState["w"]).toBe(true);
    });

    it("should set keyboard state to false on keyup", () => {
      engine.start();

      const keyboardState = (
        engine as unknown as { keyboardState: { [key: string]: boolean } }
      ).keyboardState;

      // Simulate key down then up
      const keydownEvent = new KeyboardEvent("keydown", { key: "a" });
      window.dispatchEvent(keydownEvent);

      expect(keyboardState["a"]).toBe(true);

      const keyupEvent = new KeyboardEvent("keyup", { key: "a" });
      window.dispatchEvent(keyupEvent);

      expect(keyboardState["a"]).toBe(false);
    });

    it("should normalize keys to lowercase", () => {
      engine.start();

      const keyboardState = (
        engine as unknown as { keyboardState: { [key: string]: boolean } }
      ).keyboardState;

      // Simulate uppercase key (e.g., shift+W)
      const keydownEvent = new KeyboardEvent("keydown", { key: "W" });
      window.dispatchEvent(keydownEvent);

      // Should be stored as lowercase
      expect(keyboardState["w"]).toBe(true);
      expect(keyboardState["W"]).toBeUndefined();
    });

    it("should handle arrow keys correctly", () => {
      engine.start();

      const keyboardState = (
        engine as unknown as { keyboardState: { [key: string]: boolean } }
      ).keyboardState;

      const arrowLeftEvent = new KeyboardEvent("keydown", {
        key: "ArrowLeft",
      });
      window.dispatchEvent(arrowLeftEvent);

      expect(keyboardState["arrowleft"]).toBe(true);
    });

    it("should handle space key correctly", () => {
      engine.start();

      const keyboardState = (
        engine as unknown as { keyboardState: { [key: string]: boolean } }
      ).keyboardState;

      const spaceEvent = new KeyboardEvent("keydown", { key: " " });
      window.dispatchEvent(spaceEvent);

      expect(keyboardState[" "]).toBe(true);
    });

    it("should handle multiple simultaneous key presses", () => {
      engine.start();

      const keyboardState = (
        engine as unknown as { keyboardState: { [key: string]: boolean } }
      ).keyboardState;

      // Press multiple keys
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));

      expect(keyboardState["w"]).toBe(true);
      expect(keyboardState["a"]).toBe(true);
      expect(keyboardState[" "]).toBe(true);

      // Release one key
      window.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));

      expect(keyboardState["w"]).toBe(true);
      expect(keyboardState["a"]).toBe(false);
      expect(keyboardState[" "]).toBe(true);
    });
  });

  describe("Input State Passed to Lua VM", () => {
    it("should pass input state to Lua VM on update", async () => {
      const gameSpec: GameSpec = {
        meta: { title: "Test Game", version: "1.0.0" },
        players: { min: 1, max: 1, spawn_points: [{ x: 0, y: 0, z: 0 }] },
        worlds: [
          {
            id: "world-1",
            name: "Test World",
            objects: [
              {
                id: "player",
                name: "Player",
                transform: {
                  position: { x: 0, y: 0, z: 0 },
                  rotation: { x: 0, y: 0, z: 0 },
                  scale: { x: 1, y: 1, z: 1 },
                },
                components: [],
                script_id: "player-script",
              },
            ],
          },
        ],
        scripts: [
          {
            id: "player-script",
            name: "PlayerScript",
            lua_code: `
              function on_start()
                print("Player started")
              end

              function on_update(dt)
                -- Input should always exist
                if not input then
                  error("Input table does not exist!")
                end
              end
            `,
          },
        ],
      };

      await engine.loadGame(gameSpec);

      // Start should not throw error about missing input
      expect(() => engine.start()).not.toThrow();
    });

    it("should ensure all initialized keys are available in input table", async () => {
      const gameSpec: GameSpec = {
        meta: { title: "Test Game", version: "1.0.0" },
        players: { min: 1, max: 1, spawn_points: [{ x: 0, y: 0, z: 0 }] },
        worlds: [
          {
            id: "world-1",
            name: "Test World",
            objects: [
              {
                id: "player",
                name: "Player",
                transform: {
                  position: { x: 0, y: 0, z: 0 },
                  rotation: { x: 0, y: 0, z: 0 },
                  scale: { x: 1, y: 1, z: 1 },
                },
                components: [],
                script_id: "test-script",
              },
            ],
          },
        ],
        scripts: [
          {
            id: "test-script",
            name: "TestScript",
            lua_code: `
              function on_start()
              end

              function on_update(dt)
                -- All common keys should be explicitly false or true, never nil
                if input["w"] == nil then error("w is nil") end
                if input["a"] == nil then error("a is nil") end
                if input["arrowleft"] == nil then error("arrowleft is nil") end
                if input[" "] == nil then error("space is nil") end
              end
            `,
          },
        ],
      };

      await engine.loadGame(gameSpec);

      // Start and run one frame - should not throw error about nil keys
      expect(() => {
        engine.start();
      }).not.toThrow();
    });
  });

  describe("Event Listener Cleanup", () => {
    it("should remove event listeners on destroy", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      engine.start();
      engine.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keyup",
        expect.any(Function),
      );
    });
  });
});
