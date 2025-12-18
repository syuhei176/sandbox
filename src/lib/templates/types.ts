import type { GameObject, ScriptDefinition } from "../types/gamespec";

export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  gameObjects: GameObject[];
  scripts: ScriptDefinition[];
}
