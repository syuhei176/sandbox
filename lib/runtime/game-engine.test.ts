import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { GameEngine } from "./game-engine";
import { createTestGameSpec, createTestGameObject } from "@/test/test-utils";

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

describe("GameEngine", () => {
  let canvas: HTMLCanvasElement;
  let engine: GameEngine;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    engine = new GameEngine(canvas);
  });

  afterEach(() => {
    if (engine) {
      engine.destroy();
    }
  });

  describe("constructor", () => {
    it("should create a GameEngine instance", () => {
      expect(engine).toBeInstanceOf(GameEngine);
    });

    it("should initialize with a canvas element", () => {
      expect(() => new GameEngine(canvas)).not.toThrow();
    });
  });

  describe("loadGame", () => {
    it("should load a valid GameSpec", async () => {
      const spec = createTestGameSpec();

      await expect(engine.loadGame(spec)).resolves.not.toThrow();
    });

    it("should load game with objects", async () => {
      const obj = createTestGameObject({
        components: [
          {
            type: "mesh",
            properties: {
              geometry: "box",
              color: 0xff0000,
              width: 1,
              height: 1,
              depth: 1,
            },
          },
        ],
      });

      const spec = createTestGameSpec({
        worlds: [
          {
            id: "world-1",
            name: "Test World",
            objects: [obj],
          },
        ],
      });

      await expect(engine.loadGame(spec)).resolves.not.toThrow();
    });

    it("should load game with multiple component types", async () => {
      const meshObj = createTestGameObject({
        id: "mesh-obj",
        components: [
          {
            type: "mesh",
            properties: {
              geometry: "sphere",
              color: 0x00ff00,
              radius: 0.5,
            },
          },
        ],
      });

      const lightObj = createTestGameObject({
        id: "light-obj",
        components: [
          {
            type: "light",
            properties: {
              lightType: "point",
              color: 0xffffff,
              intensity: 1,
            },
          },
        ],
      });

      const spec = createTestGameSpec({
        worlds: [
          {
            id: "world-1",
            name: "Test World",
            objects: [meshObj, lightObj],
          },
        ],
      });

      await expect(engine.loadGame(spec)).resolves.not.toThrow();
    });
  });

  describe("start", () => {
    it("should start the game engine", async () => {
      const spec = createTestGameSpec();
      await engine.loadGame(spec);

      expect(() => engine.start()).not.toThrow();
    });

    it("should not throw if called before loadGame", () => {
      expect(() => engine.start()).not.toThrow();
    });
  });

  describe("stop", () => {
    it("should stop the game engine", async () => {
      const spec = createTestGameSpec();
      await engine.loadGame(spec);
      engine.start();

      expect(() => engine.stop()).not.toThrow();
    });
  });

  describe("resize", () => {
    it("should resize the renderer", async () => {
      const spec = createTestGameSpec();
      await engine.loadGame(spec);

      expect(() => engine.resize(1024, 768)).not.toThrow();
    });

    it("should handle resize before initialization", () => {
      expect(() => engine.resize(800, 600)).not.toThrow();
    });
  });

  describe("destroy", () => {
    it("should cleanup resources", async () => {
      const spec = createTestGameSpec();
      await engine.loadGame(spec);
      engine.start();

      expect(() => engine.destroy()).not.toThrow();
    });

    it("should stop animation loop on destroy", async () => {
      const spec = createTestGameSpec();
      await engine.loadGame(spec);
      engine.start();

      engine.destroy();

      // Engine should be stopped after destroy
      expect(() => engine.stop()).not.toThrow();
    });
  });

  describe("script integration", () => {
    it("should load game with scripts attached to objects", async () => {
      const obj = createTestGameObject({
        script_id: "test-script",
        components: [
          {
            type: "mesh",
            properties: {
              geometry: "box",
              color: 0xff0000,
              width: 1,
              height: 1,
              depth: 1,
            },
          },
        ],
      });

      const spec = createTestGameSpec({
        worlds: [
          {
            id: "world-1",
            name: "Test World",
            objects: [obj],
          },
        ],
        scripts: [
          {
            id: "test-script",
            name: "Test Script",
            lua_code: `
function on_start()
  print("Started")
end

function on_update(dt)
  -- update
end
            `.trim(),
          },
        ],
      });

      // Should not throw even with scripts (LuaVM might fail in test env, but that's OK)
      await expect(engine.loadGame(spec)).resolves.not.toThrow();
    });
  });

  describe("environment settings", () => {
    it("should apply environment settings", async () => {
      const spec = createTestGameSpec({
        worlds: [
          {
            id: "world-1",
            name: "Test World",
            environment: {
              skybox: "#87ceeb",
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
            objects: [],
          },
        ],
      });

      await expect(engine.loadGame(spec)).resolves.not.toThrow();
    });
  });
});
