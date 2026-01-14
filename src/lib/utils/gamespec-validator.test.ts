import { describe, it, expect } from 'vitest';
import { validateGameObject, validateComponent } from './gamespec-validator';
import { createTestGameObject } from '@/test/test-utils';

describe('gamespec-validator', () => {
  describe('validateGameObject', () => {
    it('should validate a valid GameObject', () => {
      const obj = createTestGameObject();
      const errors = validateGameObject(obj);

      expect(errors).toHaveLength(0);
    });

    it('should require id field', () => {
      const obj = createTestGameObject();
      obj.id = '';
      const errors = validateGameObject(obj);

      expect(errors.some(e => e.path === 'id')).toBe(true);
    });

    it('should require name field', () => {
      const obj = createTestGameObject();
      obj.name = '';
      const errors = validateGameObject(obj);

      expect(errors.some(e => e.path === 'name')).toBe(true);
    });

    it('should require valid transform', () => {
      const obj = createTestGameObject();
      delete (obj as {transform?: unknown}).transform;
      const errors = validateGameObject(obj);

      expect(errors.some(e => e.path === 'transform')).toBe(true);
    });

    it('should validate transform.position', () => {
      const obj = createTestGameObject();
      obj.transform.position = { x: 0, y: 0, z: 'invalid' } as never;
      const errors = validateGameObject(obj);

      expect(errors.some(e => e.path === 'transform.position')).toBe(true);
    });

    it('should validate components array', () => {
      const obj = createTestGameObject();
      obj.components = [
        {
          type: 'invalid' as never,
          properties: {},
        },
      ];
      const errors = validateGameObject(obj);

      expect(errors.some(e => e.path.includes('components[0]'))).toBe(true);
    });
  });

  describe('validateComponent', () => {
    it('should validate a valid mesh component', () => {
      const comp = {
        type: 'mesh' as const,
        properties: {
          geometry: 'box',
          color: 0xffffff,
        },
      };
      const errors = validateComponent(comp);

      expect(errors).toHaveLength(0);
    });

    it('should reject invalid component type', () => {
      const comp = {
        type: 'invalid',
        properties: {},
      };
      const errors = validateComponent(comp);

      expect(errors.some(e => e.path === 'type')).toBe(true);
    });

    it('should require properties object', () => {
      const comp = {
        type: 'mesh',
      };
      const errors = validateComponent(comp);

      expect(errors.some(e => e.path === 'properties')).toBe(true);
    });
  });
});
