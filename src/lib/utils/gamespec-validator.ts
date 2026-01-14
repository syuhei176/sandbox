import type { GameObject, Component } from '@/lib/types/gamespec';

export interface ValidationError {
  path: string;
  message: string;
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
