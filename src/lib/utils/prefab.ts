import type { GameObject, PrefabDefinition } from "@/lib/types/gamespec";

/**
 * Creates a prefab from a GameObject
 */
export function createPrefabFromGameObject(
  gameObject: GameObject,
  name?: string,
  description?: string,
): PrefabDefinition {
  // Clone the GameObject and strip instance-specific data
  const template = cloneGameObjectForPrefab(gameObject);

  return {
    id: `prefab-${Date.now()}`,
    name: name || gameObject.name,
    description,
    template,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Instantiates a GameObject from a prefab
 */
export function instantiatePrefab(prefab: PrefabDefinition): GameObject {
  const instance = JSON.parse(JSON.stringify(prefab.template)) as GameObject;

  // Generate new unique IDs for the instance and all children
  const newId = `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  instance.id = newId;
  instance.prefab_id = prefab.id;

  // Regenerate IDs for children recursively
  if (instance.children) {
    instance.children = instance.children.map((child) =>
      regenerateGameObjectIds(child, prefab.id),
    );
  }

  return instance;
}

/**
 * Clones a GameObject and removes instance-specific data for prefab storage
 */
function cloneGameObjectForPrefab(gameObject: GameObject): GameObject {
  const clone = JSON.parse(JSON.stringify(gameObject)) as GameObject;

  // Remove prefab_id from the template itself
  delete clone.prefab_id;

  // Recursively process children
  if (clone.children) {
    clone.children = clone.children.map((child) =>
      cloneGameObjectForPrefab(child),
    );
  }

  return clone;
}

/**
 * Recursively regenerates IDs for a GameObject and its children
 */
function regenerateGameObjectIds(
  gameObject: GameObject,
  prefabId: string,
): GameObject {
  const newId = `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const updated = {
    ...gameObject,
    id: newId,
    prefab_id: prefabId,
  };

  if (updated.children) {
    updated.children = updated.children.map((child) =>
      regenerateGameObjectIds(child, prefabId),
    );
  }

  return updated;
}
