import type { GameSpec, GameObject, ScriptDefinition, Vector3 } from '@/lib/types/gamespec';

/**
 * Create a minimal valid GameSpec for testing
 */
export function createTestGameSpec(overrides?: Partial<GameSpec>): GameSpec {
  return {
    meta: {
      title: 'Test Game',
      description: 'A test game',
      version: '1.0.0',
    },
    players: {
      min: 1,
      max: 4,
      spawn_points: [{ x: 0, y: 0, z: 0 }],
    },
    worlds: [
      {
        id: 'test-world',
        name: 'Test World',
        objects: [],
      },
    ],
    scripts: [],
    ...overrides,
  };
}

/**
 * Create a test GameObject
 */
export function createTestGameObject(overrides?: Partial<GameObject>): GameObject {
  return {
    id: 'test-obj-1',
    name: 'Test Object',
    transform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    components: [],
    ...overrides,
  };
}

/**
 * Create a test script definition
 */
export function createTestScript(overrides?: Partial<ScriptDefinition>): ScriptDefinition {
  return {
    id: 'test-script-1',
    name: 'Test Script',
    lua_code: `
function on_start()
  print("Test script started")
end

function on_update(dt)
  -- test update
end
    `.trim(),
    ...overrides,
  };
}

/**
 * Create a test Vector3
 */
export function createTestVector3(x = 0, y = 0, z = 0): Vector3 {
  return { x, y, z };
}
