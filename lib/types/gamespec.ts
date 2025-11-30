export interface GameSpec {
  meta: GameMeta;
  players: PlayersConfig;
  worlds: World[];
  scripts: ScriptDefinition[];
  prefabs?: PrefabDefinition[];
}

export interface PrefabDefinition {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string; // Base64 encoded preview image
  template: GameObject; // The GameObject template
  createdAt: string;
  updatedAt: string;
}

export interface GameMeta {
  title: string;
  description?: string;
  version?: string;
}

export interface PlayersConfig {
  min: number;
  max: number;
  spawn_points: Vector3[];
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface World {
  id: string;
  name: string;
  environment?: Environment;
  objects: GameObject[];
}

export interface Environment {
  skybox?: string;
  ambient_light?: {
    color: string;
    intensity: number;
  };
  directional_light?: {
    color: string;
    intensity: number;
    position: Vector3;
  };
}

export interface GameObject {
  id: string;
  name: string;
  transform: Transform;
  components: Component[];
  script_id?: string;
  children?: GameObject[];
  prefab_id?: string; // Reference to the source prefab if instantiated from one
}

export interface Transform {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
}

export interface Component {
  type: ComponentType;
  properties: Record<string, unknown>;
}

export type ComponentType =
  | "mesh"
  | "light"
  | "camera"
  | "collider"
  | "rigidbody"
  | "audio_source"
  | "particle_system";

// Geometry types for mesh components
export type GeometryType =
  | "box"
  | "sphere"
  | "plane"
  | "cylinder"
  | "custom_model";

// Extended properties for mesh components with custom_model geometry:
// - model_id: Reference to IndexedDB stored model
// - model_url: URL to remote GLB/GLTF file
// - model_data: Base64-encoded GLB data for inline storage
// - model_prompt: Original text prompt used for AI generation (optional)

// Collision properties for mesh components:
// - hasCollision: boolean - Enable collision detection for this mesh
// - collisionShape: "box" | "sphere" | "auto" - Shape of the collision volume
// - isTrigger: boolean - If true, passes through but triggers collision events
// - collisionLayer: number - Layer for collision filtering (default: 0)

export type CollisionShape = "box" | "sphere" | "auto";

export interface ScriptDefinition {
  id: string;
  name: string;
  lua_code: string;
}
