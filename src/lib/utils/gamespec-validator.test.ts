import { describe, it, expect } from 'vitest';
import { validateGameSpec, validateGameObject, validateComponent } from './gamespec-validator';
import { createTestGameSpec, createTestGameObject } from '@/test/test-utils';

describe('gamespec-validator', () => {
  describe('validateGameSpec', () => {
    it('should validate a valid GameSpec', () => {
      const spec = createTestGameSpec();
      const result = validateGameSpec(spec);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object input', () => {
      const result = validateGameSpec(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('must be an object');
    });

    it('should require meta field', () => {
      const spec = createTestGameSpec();
      delete (spec as {meta?: unknown}).meta;
      const result = validateGameSpec(spec);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path === 'meta')).toBe(true);
    });

    it('should require meta.title', () => {
      const spec = createTestGameSpec();
      spec.meta.title = '';
      const result = validateGameSpec(spec);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path === 'meta.title')).toBe(true);
    });

    it('should require valid players config', () => {
      const spec = createTestGameSpec();
      spec.players.min = 0;
      const result = validateGameSpec(spec);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path === 'players.min')).toBe(true);
    });

    it('should require max >= min', () => {
      const spec = createTestGameSpec();
      spec.players.min = 5;
      spec.players.max = 2;
      const result = validateGameSpec(spec);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path === 'players.max')).toBe(true);
    });

    it('should require at least one world', () => {
      const spec = createTestGameSpec();
      spec.worlds = [];
      const result = validateGameSpec(spec);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path === 'worlds')).toBe(true);
    });

    it('should validate world structure', () => {
      const spec = createTestGameSpec();
      spec.worlds[0].id = '';
      const result = validateGameSpec(spec);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path.includes('worlds[0].id'))).toBe(true);
    });

    it('should validate scripts array', () => {
      const spec = createTestGameSpec();
      spec.scripts = [
        {
          id: '',
          name: 'Test',
          lua_code: 'print("test")',
        },
      ];
      const result = validateGameSpec(spec);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path.includes('scripts[0].id'))).toBe(true);
    });
  });

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
