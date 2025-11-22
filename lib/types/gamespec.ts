export interface GameSpec {
  meta: GameMeta;
  players: PlayersConfig;
  worlds: World[];
  scripts: ScriptDefinition[];
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
}

export interface Transform {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
}

export interface Component {
  type: ComponentType;
  properties: Record<string, any>;
}

export type ComponentType =
  | 'mesh'
  | 'light'
  | 'camera'
  | 'collider'
  | 'rigidbody'
  | 'audio_source'
  | 'particle_system';

export interface ScriptDefinition {
  id: string;
  name: string;
  lua_code: string;
}
