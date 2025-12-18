import type { GameSpec, GameObject, Component } from '@/lib/types/gamespec';

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate a GameSpec object
 */
export function validateGameSpec(spec: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!spec || typeof spec !== 'object') {
    return { valid: false, errors: [{ path: 'root', message: 'GameSpec must be an object' }] };
  }

  const gameSpec = spec as Partial<GameSpec>;

  // Validate meta
  if (!gameSpec.meta) {
    errors.push({ path: 'meta', message: 'meta is required' });
  } else {
    if (!gameSpec.meta.title || typeof gameSpec.meta.title !== 'string') {
      errors.push({ path: 'meta.title', message: 'title is required and must be a string' });
    }
  }

  // Validate players
  if (!gameSpec.players) {
    errors.push({ path: 'players', message: 'players is required' });
  } else {
    if (typeof gameSpec.players.min !== 'number' || gameSpec.players.min < 1) {
      errors.push({ path: 'players.min', message: 'min must be a number >= 1' });
    }
    if (typeof gameSpec.players.max !== 'number' || gameSpec.players.max < gameSpec.players.min) {
      errors.push({ path: 'players.max', message: 'max must be a number >= min' });
    }
    if (!Array.isArray(gameSpec.players.spawn_points) || gameSpec.players.spawn_points.length === 0) {
      errors.push({ path: 'players.spawn_points', message: 'spawn_points must be a non-empty array' });
    }
  }

  // Validate worlds
  if (!Array.isArray(gameSpec.worlds)) {
    errors.push({ path: 'worlds', message: 'worlds must be an array' });
  } else if (gameSpec.worlds.length === 0) {
    errors.push({ path: 'worlds', message: 'at least one world is required' });
  } else {
    gameSpec.worlds.forEach((world, idx) => {
      if (!world.id || typeof world.id !== 'string') {
        errors.push({ path: `worlds[${idx}].id`, message: 'world id is required' });
      }
      if (!world.name || typeof world.name !== 'string') {
        errors.push({ path: `worlds[${idx}].name`, message: 'world name is required' });
      }
      if (!Array.isArray(world.objects)) {
        errors.push({ path: `worlds[${idx}].objects`, message: 'objects must be an array' });
      } else {
        world.objects.forEach((obj, objIdx) => {
          const objErrors = validateGameObject(obj);
          objErrors.forEach(err => {
            errors.push({ path: `worlds[${idx}].objects[${objIdx}].${err.path}`, message: err.message });
          });
        });
      }
    });
  }

  // Validate scripts
  if (!Array.isArray(gameSpec.scripts)) {
    errors.push({ path: 'scripts', message: 'scripts must be an array' });
  } else {
    gameSpec.scripts.forEach((script, idx) => {
      if (!script.id || typeof script.id !== 'string') {
        errors.push({ path: `scripts[${idx}].id`, message: 'script id is required' });
      }
      if (!script.name || typeof script.name !== 'string') {
        errors.push({ path: `scripts[${idx}].name`, message: 'script name is required' });
      }
      if (typeof script.lua_code !== 'string') {
        errors.push({ path: `scripts[${idx}].lua_code`, message: 'lua_code must be a string' });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a GameObject
 */
export function validateGameObject(obj: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!obj || typeof obj !== 'object') {
    return [{ path: 'root', message: 'GameObject must be an object' }];
  }

  const gameObj = obj as Partial<GameObject>;

  if (!gameObj.id || typeof gameObj.id !== 'string') {
    errors.push({ path: 'id', message: 'id is required' });
  }

  if (!gameObj.name || typeof gameObj.name !== 'string') {
    errors.push({ path: 'name', message: 'name is required' });
  }

  if (!gameObj.transform) {
    errors.push({ path: 'transform', message: 'transform is required' });
  } else {
    if (!isValidVector3(gameObj.transform.position)) {
      errors.push({ path: 'transform.position', message: 'position must be a valid Vector3' });
    }
    if (!isValidVector3(gameObj.transform.rotation)) {
      errors.push({ path: 'transform.rotation', message: 'rotation must be a valid Vector3' });
    }
    if (!isValidVector3(gameObj.transform.scale)) {
      errors.push({ path: 'transform.scale', message: 'scale must be a valid Vector3' });
    }
  }

  if (!Array.isArray(gameObj.components)) {
    errors.push({ path: 'components', message: 'components must be an array' });
  } else {
    gameObj.components.forEach((comp, idx) => {
      const compErrors = validateComponent(comp);
      compErrors.forEach(err => {
        errors.push({ path: `components[${idx}].${err.path}`, message: err.message });
      });
    });
  }

  return errors;
}

/**
 * Validate a Component
 */
export function validateComponent(comp: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!comp || typeof comp !== 'object') {
    return [{ path: 'root', message: 'Component must be an object' }];
  }

  const component = comp as Partial<Component>;

  const validTypes = ['mesh', 'light', 'camera', 'collider', 'rigidbody', 'audio_source', 'particle_system'];
  if (!component.type || !validTypes.includes(component.type)) {
    errors.push({ path: 'type', message: `type must be one of: ${validTypes.join(', ')}` });
  }

  if (!component.properties || typeof component.properties !== 'object') {
    errors.push({ path: 'properties', message: 'properties must be an object' });
  }

  return errors;
}

/**
 * Check if value is a valid Vector3
 */
function isValidVector3(v: unknown): boolean {
  if (!v || typeof v !== 'object') return false;
  const vec = v as { x?: unknown; y?: unknown; z?: unknown };
  return typeof vec.x === 'number' && typeof vec.y === 'number' && typeof vec.z === 'number';
}
