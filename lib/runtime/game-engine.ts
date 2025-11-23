import * as THREE from "three";
import type { GameSpec, World, GameObject, Component } from "../types/gamespec";
import { LuaVM } from "./lua-vm";

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private gameObjects: Map<string, GameObjectInstance> = new Map();
  private scripts: Map<string, string> = new Map();
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private keyboardState: { [key: string]: boolean } = {};
  private mainCameraObjectId: string | null = null;

  constructor(canvas: HTMLCanvasElement) {
    // Initialize scene
    this.scene = new THREE.Scene();

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.z = 5;

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  async loadGame(gameSpec: GameSpec): Promise<void> {
    // Load all scripts
    for (const script of gameSpec.scripts) {
      this.scripts.set(script.id, script.lua_code);
    }

    // Load the first world
    if (gameSpec.worlds.length > 0) {
      await this.loadWorld(gameSpec.worlds[0]);
    }

    // Setup environment
    this.setupEnvironment(gameSpec.worlds[0]);
  }

  private setupEnvironment(world: World): void {
    if (!world.environment) {
      // Default environment
      this.scene.background = new THREE.Color(0x87ceeb);
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      this.scene.add(directionalLight);
      return;
    }

    const env = world.environment;

    // Ambient light
    if (env.ambient_light) {
      const ambientLight = new THREE.AmbientLight(
        env.ambient_light.color,
        env.ambient_light.intensity,
      );
      this.scene.add(ambientLight);
    }

    // Directional light
    if (env.directional_light) {
      const directionalLight = new THREE.DirectionalLight(
        env.directional_light.color,
        env.directional_light.intensity,
      );
      directionalLight.position.set(
        env.directional_light.position.x,
        env.directional_light.position.y,
        env.directional_light.position.z,
      );
      this.scene.add(directionalLight);
    }

    // Skybox color
    if (env.skybox) {
      this.scene.background = new THREE.Color(env.skybox);
    }
  }

  private async loadWorld(world: World): Promise<void> {
    for (const gameObject of world.objects) {
      await this.instantiateGameObject(gameObject);
    }
  }

  private async instantiateGameObject(
    gameObject: GameObject,
    parent?: THREE.Object3D,
  ): Promise<void> {
    const object3D = new THREE.Group();
    object3D.name = gameObject.name;

    // Set transform
    object3D.position.set(
      gameObject.transform.position.x,
      gameObject.transform.position.y,
      gameObject.transform.position.z,
    );
    object3D.rotation.set(
      gameObject.transform.rotation.x,
      gameObject.transform.rotation.y,
      gameObject.transform.rotation.z,
    );
    object3D.scale.set(
      gameObject.transform.scale.x,
      gameObject.transform.scale.y,
      gameObject.transform.scale.z,
    );

    // Add components
    for (const component of gameObject.components) {
      this.addComponent(object3D, component, gameObject.id);
    }

    // Add to scene or parent
    if (parent) {
      parent.add(object3D);
    } else {
      this.scene.add(object3D);
    }

    // Create Lua VM if script is attached
    let luaVM: LuaVM | null = null;
    if (gameObject.script_id && this.scripts.has(gameObject.script_id)) {
      luaVM = new LuaVM();
      await luaVM.initialize();
      const scriptCode = this.scripts.get(gameObject.script_id)!;
      if (luaVM.loadScript(scriptCode, gameObject.script_id)) {
        luaVM.setGameObject(gameObject);
        luaVM.onStart();
      } else {
        luaVM = null;
      }
    }

    // Store game object instance
    const instance: GameObjectInstance = {
      id: gameObject.id,
      object3D,
      luaVM,
      gameObject,
    };
    this.gameObjects.set(gameObject.id, instance);

    // Instantiate children
    if (gameObject.children) {
      for (const child of gameObject.children) {
        await this.instantiateGameObject(child, object3D);
      }
    }
  }

  private addComponent(
    object3D: THREE.Object3D,
    component: Component,
    gameObjectId: string,
  ): void {
    switch (component.type) {
      case "mesh":
        this.addMeshComponent(object3D, component);
        break;
      case "light":
        this.addLightComponent(object3D, component);
        break;
      case "camera":
        this.addCameraComponent(object3D, component, gameObjectId);
        break;
      // Add more component types as needed
    }
  }

  private addMeshComponent(
    object3D: THREE.Object3D,
    component: Component,
  ): void {
    const props = component.properties;

    // Helper to safely get numeric properties
    const getNum = (key: string, defaultValue: number): number => {
      const value = props[key];
      return typeof value === "number" ? value : defaultValue;
    };

    let geometry: THREE.BufferGeometry;

    // Create geometry based on type
    switch (props.geometry) {
      case "box":
        geometry = new THREE.BoxGeometry(
          getNum("width", 1),
          getNum("height", 1),
          getNum("depth", 1),
        );
        break;
      case "sphere":
        geometry = new THREE.SphereGeometry(getNum("radius", 0.5), 32, 32);
        break;
      case "plane":
        geometry = new THREE.PlaneGeometry(
          getNum("width", 1),
          getNum("height", 1),
        );
        break;
      case "cylinder":
        geometry = new THREE.CylinderGeometry(
          getNum("radiusTop", 0.5),
          getNum("radiusBottom", 0.5),
          getNum("height", 1),
          32,
        );
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    // Create material
    const material = new THREE.MeshStandardMaterial({
      color: getNum("color", 0xffffff),
      metalness: getNum("metalness", 0),
      roughness: getNum("roughness", 0.5),
    });

    const mesh = new THREE.Mesh(geometry, material);
    object3D.add(mesh);
  }

  private addLightComponent(
    object3D: THREE.Object3D,
    component: Component,
  ): void {
    const props = component.properties;

    // Helper to safely get numeric properties
    const getNum = (key: string, defaultValue: number): number => {
      const value = props[key];
      return typeof value === "number" ? value : defaultValue;
    };

    let light: THREE.Light;

    switch (props.lightType) {
      case "point":
        light = new THREE.PointLight(
          getNum("color", 0xffffff),
          getNum("intensity", 1),
          getNum("distance", 0),
        );
        break;
      case "spot":
        light = new THREE.SpotLight(
          getNum("color", 0xffffff),
          getNum("intensity", 1),
        );
        break;
      case "directional":
        light = new THREE.DirectionalLight(
          getNum("color", 0xffffff),
          getNum("intensity", 1),
        );
        break;
      default:
        light = new THREE.PointLight(0xffffff, 1);
    }

    object3D.add(light);
  }

  private addCameraComponent(
    object3D: THREE.Object3D,
    component: Component,
    gameObjectId: string,
  ): void {
    const props = component.properties;

    // Helper to safely get numeric properties
    const getNum = (key: string, defaultValue: number): number => {
      const value = props[key];
      return typeof value === "number" ? value : defaultValue;
    };

    const camera = new THREE.PerspectiveCamera(
      getNum("fov", 75),
      getNum("aspect", 1),
      getNum("near", 0.1),
      getNum("far", 1000),
    );
    object3D.add(camera);

    // Optionally use this as the main camera
    if (props.isMainCamera) {
      this.camera = camera;
      this.mainCameraObjectId = gameObjectId;
    }
  }

  start(): void {
    this.lastTime = performance.now();
    this.setupInputListeners();
    this.animate();
  }

  private setupInputListeners(): void {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keyboardState[event.key.toLowerCase()] = true;
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keyboardState[event.key.toLowerCase()] = false;
  };

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();
  };

  private update(deltaTime: number): void {
    // Update all game objects with scripts
    for (const instance of this.gameObjects.values()) {
      if (instance.luaVM) {
        // Set input state before calling update
        instance.luaVM.setInputState(this.keyboardState);

        // Call Lua update
        instance.luaVM.onUpdate(deltaTime);

        // Read back transform from Lua and apply to three.js AND gameObject
        const transform = instance.luaVM.getGameObjectTransform();
        if (transform) {
          instance.object3D.position.set(
            transform.position.x,
            transform.position.y,
            transform.position.z,
          );
          instance.object3D.rotation.set(
            transform.rotation.x,
            transform.rotation.y,
            transform.rotation.z,
          );
          instance.object3D.scale.set(
            transform.scale.x,
            transform.scale.y,
            transform.scale.z,
          );

          // Also update the gameObject.transform so other scripts can see the new position
          instance.gameObject.transform.position = { ...transform.position };
          instance.gameObject.transform.rotation = { ...transform.rotation };
          instance.gameObject.transform.scale = { ...transform.scale };
        }
      }
    }

    // Now update all_gameobjects table with latest positions for scripts that reference other objects
    for (const instance of this.gameObjects.values()) {
      if (instance.luaVM) {
        instance.luaVM.setAllGameObjects(this.gameObjects);
      }
    }

    // Sync main camera position from its GameObject
    if (this.mainCameraObjectId) {
      const cameraInstance = this.gameObjects.get(this.mainCameraObjectId);
      if (cameraInstance) {
        this.camera.position.copy(cameraInstance.object3D.position);

        // Look at the player
        const playerInstance = Array.from(this.gameObjects.values()).find(
          (inst) => inst.gameObject.name === "Player",
        );
        if (playerInstance) {
          this.camera.lookAt(playerInstance.object3D.position);
        }
      }
    }
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  destroy(): void {
    this.stop();

    // Remove input listeners
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);

    // Destroy all Lua VMs
    for (const instance of this.gameObjects.values()) {
      if (instance.luaVM) {
        instance.luaVM.destroy();
      }
    }

    this.gameObjects.clear();
    this.scripts.clear();

    // Dispose of Three.js resources
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((mat) => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    this.renderer.dispose();
  }
}

interface GameObjectInstance {
  id: string;
  object3D: THREE.Object3D;
  luaVM: LuaVM | null;
  gameObject: GameObject;
}
