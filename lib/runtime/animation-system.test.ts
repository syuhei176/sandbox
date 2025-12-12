import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
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

  class MockAnimationMixer {
    private _time = 0;
    constructor(public root: unknown) {}
    clipAction(clip: unknown) {
      return new MockAnimationAction(clip);
    }
    update(deltaTime: number) {
      this._time += deltaTime;
    }
  }

  class MockAnimationAction {
    time = 0;
    paused = false;
    timeScale = 1;
    clampWhenFinished = false;

    constructor(private clip: { name: string; duration: number }) {}

    reset() {
      this.time = 0;
      return this;
    }
    play() {
      this.paused = false;
      return this;
    }
    stop() {
      this.paused = true;
      this.time = 0;
      return this;
    }
    setLoop(_loop: number) {
      return this;
    }
    fadeIn(_duration: number) {
      return this;
    }
    fadeOut(_duration: number) {
      return this;
    }
    getClip() {
      return this.clip;
    }
  }

  return {
    ...actual,
    WebGLRenderer: MockWebGLRenderer,
    AnimationMixer: MockAnimationMixer,
    LoopRepeat: 2201,
    LoopOnce: 2200,
  };
});

// Mock GLTFLoader
vi.mock("three/examples/jsm/loaders/GLTFLoader.js", () => ({
  GLTFLoader: class MockGLTFLoader {
    async loadAsync(_url: string) {
      // Return mock GLTF with animations
      return {
        scene: {
          children: [],
          add: vi.fn(),
        },
        animations: [
          { name: "Idle", duration: 2.0, tracks: [] },
          { name: "Walk", duration: 1.5, tracks: [] },
          { name: "Run", duration: 1.0, tracks: [] },
          { name: "Attack", duration: 0.8, tracks: [] },
        ],
      };
    }
  },
}));

describe("Animation System", () => {
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

  describe("Animation Mixer Creation", () => {
    it("should create animation mixer for GLTF models with animations", async () => {
      const gameSpec: GameSpec = {
        meta: {
          title: "Animation Test",
          version: "1.0",
        },
        players: {
          min: 1,
          max: 1,
          spawn_points: [{ x: 0, y: 0, z: 0 }],
        },
        worlds: [
          {
            id: "world-1",
            name: "Test World",
            objects: [
              {
                id: "obj-animated",
                name: "AnimatedChar",
                transform: {
                  position: { x: 0, y: 0, z: 0 },
                  rotation: { x: 0, y: 0, z: 0 },
                  scale: { x: 1, y: 1, z: 1 },
                },
                components: [
                  {
                    type: "mesh",
                    properties: {
                      geometry: "custom_model",
                      model_url: "https://example.com/character.glb",
                      autoPlayAnimation: true,
                      defaultAnimation: "Idle",
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

      const animState = engine.getAnimationState("obj-animated");
      expect(animState).toBeDefined();
      expect(animState?.clipNames).toContain("Idle");
      expect(animState?.clipNames).toContain("Walk");
      expect(animState?.clipNames).toContain("Run");
      expect(animState?.clipNames).toContain("Attack");
    });

    it("should auto-play default animation when configured", async () => {
      const gameSpec: GameSpec = {
        meta: { title: "AutoPlay Test" },
        players: { min: 1, max: 1, spawn_points: [{ x: 0, y: 0, z: 0 }] },
        worlds: [
          {
            id: "world-1",
            name: "Test World",
            objects: [
              {
                id: "obj-animated",
                name: "AnimatedChar",
                transform: {
                  position: { x: 0, y: 0, z: 0 },
                  rotation: { x: 0, y: 0, z: 0 },
                  scale: { x: 1, y: 1, z: 1 },
                },
                components: [
                  {
                    type: "mesh",
                    properties: {
                      geometry: "custom_model",
                      model_url: "https://example.com/character.glb",
                      autoPlayAnimation: true,
                      defaultAnimation: "Walk",
                      animationLoop: true,
                      animationSpeed: 1.5,
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

      const animState = engine.getAnimationState("obj-animated");
      expect(animState?.activeClipName).toBe("Walk");
      expect(animState?.isPlaying).toBe(true);
      expect(animState?.loop).toBe(true);
      expect(animState?.speed).toBe(1.5);
    });

    it("should not auto-play when autoPlayAnimation is false", async () => {
      const gameSpec: GameSpec = {
        meta: { title: "No AutoPlay Test" },
        players: { min: 1, max: 1, spawn_points: [{ x: 0, y: 0, z: 0 }] },
        worlds: [
          {
            id: "world-1",
            name: "Test World",
            objects: [
              {
                id: "obj-animated",
                name: "AnimatedChar",
                transform: {
                  position: { x: 0, y: 0, z: 0 },
                  rotation: { x: 0, y: 0, z: 0 },
                  scale: { x: 1, y: 1, z: 1 },
                },
                components: [
                  {
                    type: "mesh",
                    properties: {
                      geometry: "custom_model",
                      model_url: "https://example.com/character.glb",
                      autoPlayAnimation: false,
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

      const animState = engine.getAnimationState("obj-animated");
      expect(animState?.activeClipName).toBeNull();
      expect(animState?.isPlaying).toBe(false);
    });
  });

  describe("Animation Control Methods", () => {
    beforeEach(async () => {
      const gameSpec: GameSpec = {
        meta: { title: "Control Test" },
        players: { min: 1, max: 1, spawn_points: [{ x: 0, y: 0, z: 0 }] },
        worlds: [
          {
            id: "world-1",
            name: "Test World",
            objects: [
              {
                id: "obj-animated",
                name: "AnimatedChar",
                transform: {
                  position: { x: 0, y: 0, z: 0 },
                  rotation: { x: 0, y: 0, z: 0 },
                  scale: { x: 1, y: 1, z: 1 },
                },
                components: [
                  {
                    type: "mesh",
                    properties: {
                      geometry: "custom_model",
                      model_url: "https://example.com/character.glb",
                      autoPlayAnimation: false,
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
    });

    it("should play animation by name", () => {
      const result = engine.playAnimation("obj-animated", "Run");
      expect(result).toBe(true);

      const animState = engine.getAnimationState("obj-animated");
      expect(animState?.activeClipName).toBe("Run");
      expect(animState?.isPlaying).toBe(true);
    });

    it("should play animation with options", () => {
      engine.playAnimation("obj-animated", "Attack", {
        loop: false,
        speed: 2.0,
        fadeTime: 0.5,
      });

      const animState = engine.getAnimationState("obj-animated");
      expect(animState?.activeClipName).toBe("Attack");
      expect(animState?.loop).toBe(false);
      expect(animState?.speed).toBe(2.0);
    });

    it("should pause animation", () => {
      engine.playAnimation("obj-animated", "Walk");
      engine.pauseAnimation("obj-animated");

      const animState = engine.getAnimationState("obj-animated");
      expect(animState?.isPlaying).toBe(false);
    });

    it("should resume animation", () => {
      engine.playAnimation("obj-animated", "Walk");
      engine.pauseAnimation("obj-animated");
      engine.resumeAnimation("obj-animated");

      const animState = engine.getAnimationState("obj-animated");
      expect(animState?.isPlaying).toBe(true);
    });

    it("should stop animation", () => {
      engine.playAnimation("obj-animated", "Walk");
      engine.stopAnimation("obj-animated");

      const animState = engine.getAnimationState("obj-animated");
      expect(animState?.activeClipName).toBeNull();
      expect(animState?.isPlaying).toBe(false);
    });

    it("should set animation speed", () => {
      engine.playAnimation("obj-animated", "Walk");
      engine.setAnimationSpeed("obj-animated", 0.5);

      const animState = engine.getAnimationState("obj-animated");
      expect(animState?.speed).toBe(0.5);
    });

    it("should return false when playing non-existent animation", () => {
      const result = engine.playAnimation("obj-animated", "NonExistent");
      expect(result).toBe(false);
    });

    it("should return false when controlling non-existent object", () => {
      const result = engine.playAnimation("non-existent-obj", "Walk");
      expect(result).toBe(false);
    });
  });

  describe("Animation Cleanup", () => {
    it("should clear animations on loadGame", async () => {
      const gameSpec: GameSpec = {
        meta: { title: "Cleanup Test" },
        players: { min: 1, max: 1, spawn_points: [{ x: 0, y: 0, z: 0 }] },
        worlds: [
          {
            id: "world-1",
            name: "Test World",
            objects: [
              {
                id: "obj-animated",
                name: "AnimatedChar",
                transform: {
                  position: { x: 0, y: 0, z: 0 },
                  rotation: { x: 0, y: 0, z: 0 },
                  scale: { x: 1, y: 1, z: 1 },
                },
                components: [
                  {
                    type: "mesh",
                    properties: {
                      geometry: "custom_model",
                      model_url: "https://example.com/character.glb",
                      autoPlayAnimation: true,
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
      let animState = engine.getAnimationState("obj-animated");
      expect(animState).toBeDefined();

      // Load new game
      await engine.loadGame({
        ...gameSpec,
        worlds: [{ ...gameSpec.worlds[0], objects: [] }],
      });

      animState = engine.getAnimationState("obj-animated");
      expect(animState).toBeNull();
    });

    it("should clear animations on destroy", async () => {
      const gameSpec: GameSpec = {
        meta: { title: "Destroy Test" },
        players: { min: 1, max: 1, spawn_points: [{ x: 0, y: 0, z: 0 }] },
        worlds: [
          {
            id: "world-1",
            name: "Test World",
            objects: [
              {
                id: "obj-animated",
                name: "AnimatedChar",
                transform: {
                  position: { x: 0, y: 0, z: 0 },
                  rotation: { x: 0, y: 0, z: 0 },
                  scale: { x: 1, y: 1, z: 1 },
                },
                components: [
                  {
                    type: "mesh",
                    properties: {
                      geometry: "custom_model",
                      model_url: "https://example.com/character.glb",
                      autoPlayAnimation: true,
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
      engine.destroy();

      const animState = engine.getAnimationState("obj-animated");
      expect(animState).toBeNull();
    });
  });
});
