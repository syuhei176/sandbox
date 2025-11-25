import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GameSpec, World, GameObject, Component } from "../types/gamespec";
import { LuaVM } from "./lua-vm";
import { modelStorage } from "../utils/model-storage";

interface ColliderData {
  gameObjectId: string;
  shape: "box" | "sphere";
  boundingBox?: THREE.Box3;
  boundingSphere?: THREE.Sphere;
  isTrigger: boolean;
  layer: number;
  originalRadius?: number;
}

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private gameObjects: Map<string, GameObjectInstance> = new Map();
  private scripts: Map<string, string> = new Map();
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private keyboardState: { [key: string]: boolean } = {};
  private mouseMovement: { x: number; y: number } = { x: 0, y: 0 };
  private mouseClick: boolean = false;
  private isPointerLocked: boolean = false;
  private canvas: HTMLCanvasElement;
  private mainCameraObjectId: string | null = null;
  private colliders: Map<string, ColliderData> = new Map();
  private previousCollisions: Set<string> = new Set();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

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
    // Clear previous state
    this.scene.clear();
    this.gameObjects.clear();
    this.scripts.clear();
    this.colliders.clear();
    this.previousCollisions.clear();

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
      await this.addComponent(object3D, component, gameObject.id);
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

  private async addComponent(
    object3D: THREE.Object3D,
    component: Component,
    gameObjectId: string,
  ): Promise<void> {
    switch (component.type) {
      case "mesh":
        await this.addMeshComponent(object3D, component, gameObjectId);
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

  private async addMeshComponent(
    object3D: THREE.Object3D,
    component: Component,
    gameObjectId: string,
  ): Promise<void> {
    const props = component.properties;

    // Handle custom models
    if (props.geometry === "custom_model") {
      await this.loadCustomModel(object3D, props);
      return;
    }

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

    // Create collider if collision is enabled - AFTER mesh is added
    if (props.hasCollision === true) {
      // Update the world matrix to ensure position is correct
      object3D.updateMatrixWorld(true);
      this.createCollider(gameObjectId, object3D, props);
    }
  }

  private async loadCustomModel(
    object3D: THREE.Object3D,
    props: Record<string, unknown>,
  ): Promise<void> {
    const loader = new GLTFLoader();
    const modelId = props.model_id as string | undefined;
    const modelUrl = props.model_url as string | undefined;
    const modelData = props.model_data as string | undefined;

    try {
      let url: string;

      if (modelId) {
        // Load from IndexedDB
        const blob = await modelStorage.getModel(modelId);
        url = URL.createObjectURL(blob);
      } else if (modelUrl) {
        // Use remote URL
        url = modelUrl;
      } else if (modelData) {
        // Use inline base64 data
        url = modelData;
      } else {
        console.error("No model source provided for custom_model");
        return;
      }

      // Load the GLTF model
      const gltf = await loader.loadAsync(url);

      // Add the loaded scene to the object
      object3D.add(gltf.scene);

      // Clean up blob URL if created
      if (modelId && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to load custom model:", error);

      // Add error placeholder (red wireframe box)
      const errorGeometry = new THREE.BoxGeometry(1, 1, 1);
      const errorMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        opacity: 0.5,
        transparent: true,
      });
      const errorMesh = new THREE.Mesh(errorGeometry, errorMaterial);
      object3D.add(errorMesh);
    }
  }

  private createCollider(
    gameObjectId: string,
    object3D: THREE.Object3D,
    properties: Record<string, unknown>,
  ): void {
    const shape = (properties.collisionShape as string) || "auto";
    const isTrigger = properties.isTrigger === true;
    const layer = (properties.collisionLayer as number) || 0;
    const geometry = properties.geometry as string;

    let colliderData: ColliderData;

    // Determine collision shape
    if (shape === "sphere" || (shape === "auto" && geometry === "sphere")) {
      // Create sphere collider
      const radius = (properties.radius as number) || 0.5;
      const maxScale = Math.max(
        object3D.scale.x,
        object3D.scale.y,
        object3D.scale.z,
      );

      // Get world position
      const worldPos = new THREE.Vector3();
      object3D.getWorldPosition(worldPos);

      const sphere = new THREE.Sphere(worldPos, radius * maxScale);
      colliderData = {
        gameObjectId,
        shape: "sphere",
        boundingSphere: sphere,
        isTrigger,
        layer,
      };

      // Store original radius for updates
      colliderData.originalRadius = radius;
    } else if (shape === "box" || shape === "auto") {
      // Create box collider (AABB)
      const box = new THREE.Box3();
      box.setFromObject(object3D);
      colliderData = {
        gameObjectId,
        shape: "box",
        boundingBox: box,
        isTrigger,
        layer,
      };
    } else {
      // Fallback to box
      const box = new THREE.Box3();
      box.setFromObject(object3D);
      colliderData = {
        gameObjectId,
        shape: "box",
        boundingBox: box,
        isTrigger,
        layer,
      };
    }

    this.colliders.set(gameObjectId, colliderData);

    console.log(`Created ${shape} collider for ${gameObjectId}:`, colliderData);
  }

  private updateColliders(): void {
    for (const [id, collider] of this.colliders) {
      const instance = this.gameObjects.get(id);
      if (!instance) continue;

      // Update world matrix first
      instance.object3D.updateMatrixWorld(true);

      if (collider.boundingBox) {
        collider.boundingBox.setFromObject(instance.object3D);
      } else if (collider.boundingSphere) {
        // Get world position
        const worldPos = new THREE.Vector3();
        instance.object3D.getWorldPosition(worldPos);
        collider.boundingSphere.center.copy(worldPos);

        // Update radius based on current scale
        const maxScale = Math.max(
          instance.object3D.scale.x,
          instance.object3D.scale.y,
          instance.object3D.scale.z,
        );

        if (collider.originalRadius && collider.boundingSphere) {
          collider.boundingSphere.radius = collider.originalRadius * maxScale;
        }
      }
    }
  }

  private checkCollisions(): void {
    const currentCollisions = new Set<string>();
    const colliderArray = Array.from(this.colliders.values());

    for (let i = 0; i < colliderArray.length; i++) {
      for (let j = i + 1; j < colliderArray.length; j++) {
        const a = colliderArray[i];
        const b = colliderArray[j];

        const isColliding = this.testCollision(a, b);

        if (isColliding) {
          const pairKey = `${a.gameObjectId}-${b.gameObjectId}`;
          currentCollisions.add(pairKey);

          // Check for new collision (trigger enter)
          if (!this.previousCollisions.has(pairKey)) {
            console.log(
              `Collision detected: ${a.gameObjectId} <-> ${b.gameObjectId}`,
            );
            if (a.isTrigger || b.isTrigger) {
              if (a.isTrigger) {
                this.notifyTriggerEnter(a.gameObjectId, b.gameObjectId);
              }
              if (b.isTrigger) {
                this.notifyTriggerEnter(b.gameObjectId, a.gameObjectId);
              }
            }
          }

          // Solid collision response - push back objects with scripts
          if (!a.isTrigger && !b.isTrigger) {
            const instanceA = this.gameObjects.get(a.gameObjectId);
            const instanceB = this.gameObjects.get(b.gameObjectId);

            // Determine if this is a ground/floor collision (skip XZ pushback for these)
            const isGroundCollision =
              instanceA?.gameObject.name === "Ground" ||
              instanceB?.gameObject.name === "Ground" ||
              (instanceB && instanceB.object3D.scale.y < 0.5);

            // Only push back on horizontal (XZ) collisions, not vertical (Y) collisions
            if (!isGroundCollision) {
              // If A has a script (is dynamic) and B doesn't (is static), push A back on XZ only
              if (
                instanceA?.luaVM &&
                !instanceB?.luaVM &&
                instanceA.previousPosition
              ) {
                instanceA.object3D.position.x = instanceA.previousPosition.x;
                instanceA.object3D.position.z = instanceA.previousPosition.z;
                instanceA.gameObject.transform.position.x =
                  instanceA.previousPosition.x;
                instanceA.gameObject.transform.position.z =
                  instanceA.previousPosition.z;
                // Update Lua VM position
                if (instanceA.luaVM) {
                  instanceA.luaVM.setGameObject(instanceA.gameObject);
                }
              }
              // If B has a script and A doesn't, push B back on XZ only
              else if (
                instanceB?.luaVM &&
                !instanceA?.luaVM &&
                instanceB.previousPosition
              ) {
                instanceB.object3D.position.x = instanceB.previousPosition.x;
                instanceB.object3D.position.z = instanceB.previousPosition.z;
                instanceB.gameObject.transform.position.x =
                  instanceB.previousPosition.x;
                instanceB.gameObject.transform.position.z =
                  instanceB.previousPosition.z;
                // Update Lua VM position
                if (instanceB.luaVM) {
                  instanceB.luaVM.setGameObject(instanceB.gameObject);
                }
              }
              // If both have scripts, push the one that moved into the other back on XZ only
              else if (
                instanceA?.luaVM &&
                instanceB?.luaVM &&
                instanceA.previousPosition
              ) {
                instanceA.object3D.position.x = instanceA.previousPosition.x;
                instanceA.object3D.position.z = instanceA.previousPosition.z;
                instanceA.gameObject.transform.position.x =
                  instanceA.previousPosition.x;
                instanceA.gameObject.transform.position.z =
                  instanceA.previousPosition.z;
                if (instanceA.luaVM) {
                  instanceA.luaVM.setGameObject(instanceA.gameObject);
                }
              }
            }

            // Call collision callbacks
            this.notifyCollision(a.gameObjectId, b.gameObjectId);
            this.notifyCollision(b.gameObjectId, a.gameObjectId);
          }
        }
      }
    }

    // Check for collision exit
    for (const pairKey of this.previousCollisions) {
      if (!currentCollisions.has(pairKey)) {
        const [aId, bId] = pairKey.split("-");
        const a = this.colliders.get(aId);
        const b = this.colliders.get(bId);
        if (a?.isTrigger) {
          this.notifyTriggerExit(aId, bId);
        }
        if (b?.isTrigger) {
          this.notifyTriggerExit(bId, aId);
        }
      }
    }

    this.previousCollisions = currentCollisions;
  }

  private testCollision(a: ColliderData, b: ColliderData): boolean {
    if (a.boundingBox && b.boundingBox) {
      return a.boundingBox.intersectsBox(b.boundingBox);
    } else if (a.boundingSphere && b.boundingSphere) {
      return a.boundingSphere.intersectsSphere(b.boundingSphere);
    } else if (a.boundingBox && b.boundingSphere) {
      return a.boundingBox.intersectsSphere(b.boundingSphere);
    } else if (a.boundingSphere && b.boundingBox) {
      return b.boundingBox.intersectsSphere(a.boundingSphere);
    }
    return false;
  }

  private notifyCollision(objectId: string, otherId: string): void {
    const instance = this.gameObjects.get(objectId);
    const otherInstance = this.gameObjects.get(otherId);

    if (instance?.luaVM && otherInstance) {
      instance.luaVM.onCollision(otherInstance.gameObject);
    }
  }

  private notifyTriggerEnter(objectId: string, otherId: string): void {
    const instance = this.gameObjects.get(objectId);
    const otherInstance = this.gameObjects.get(otherId);

    if (instance?.luaVM && otherInstance) {
      instance.luaVM.onTriggerEnter(otherInstance.gameObject);
    }
  }

  private notifyTriggerExit(objectId: string, otherId: string): void {
    const instance = this.gameObjects.get(objectId);
    const otherInstance = this.gameObjects.get(otherId);

    if (instance?.luaVM && otherInstance) {
      instance.luaVM.onTriggerExit(otherInstance.gameObject);
    }
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
    this.canvas.addEventListener("click", this.handleCanvasClick);
    document.addEventListener(
      "pointerlockchange",
      this.handlePointerLockChange,
    );
    document.addEventListener("mousemove", this.handleMouseMove);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keyboardState[event.key.toLowerCase()] = true;
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keyboardState[event.key.toLowerCase()] = false;
  };

  private handleCanvasClick = (): void => {
    this.mouseClick = true;
    // Request pointer lock on click if not already locked
    if (!this.isPointerLocked) {
      this.canvas.requestPointerLock();
    }
  };

  private handlePointerLockChange = (): void => {
    this.isPointerLocked = document.pointerLockElement === this.canvas;
  };

  private handleMouseMove = (event: MouseEvent): void => {
    if (this.isPointerLocked) {
      this.mouseMovement.x = event.movementX;
      this.mouseMovement.y = event.movementY;
    }
  };

  // Public method to allow Lua scripts to request pointer lock
  public requestPointerLock(): void {
    this.canvas.requestPointerLock();
  }

  public exitPointerLock(): void {
    if (this.isPointerLocked) {
      document.exitPointerLock();
    }
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();
  };

  private update(deltaTime: number): void {
    // Save previous positions before update
    for (const instance of this.gameObjects.values()) {
      if (this.colliders.has(instance.id)) {
        instance.previousPosition = instance.object3D.position.clone();
      }
    }

    // Update all game objects with scripts
    for (const instance of this.gameObjects.values()) {
      if (instance.luaVM) {
        // Set input state before calling update
        instance.luaVM.setInputState(this.keyboardState);
        instance.luaVM.setMouseMovement(this.mouseMovement);
        instance.luaVM.setMouseClick(this.mouseClick);

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

    // Update colliders and check collisions
    this.updateColliders();
    this.checkCollisions();

    // Reset per-frame mouse state
    this.mouseMovement.x = 0;
    this.mouseMovement.y = 0;
    this.mouseClick = false;
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
    this.canvas.removeEventListener("click", this.handleCanvasClick);
    document.removeEventListener(
      "pointerlockchange",
      this.handlePointerLockChange,
    );
    document.removeEventListener("mousemove", this.handleMouseMove);

    // Exit pointer lock if active
    this.exitPointerLock();

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
  previousPosition?: THREE.Vector3;
}
