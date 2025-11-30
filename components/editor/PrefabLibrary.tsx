"use client";

import type { PrefabDefinition } from "@/lib/types/gamespec";

interface PrefabLibraryProps {
  prefabs: PrefabDefinition[];
  onInstantiatePrefab: (prefabId: string) => void;
  onDeletePrefab: (prefabId: string) => void;
  onUpdatePrefab?: (prefabId: string) => void;
}

export function PrefabLibrary({
  prefabs,
  onInstantiatePrefab,
  onDeletePrefab,
  onUpdatePrefab,
}: PrefabLibraryProps) {
  if (prefabs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="mx-auto mb-2 opacity-50"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          <p className="text-sm">No prefabs yet</p>
          <p className="text-xs mt-1">
            Right-click a GameObject and select &quot;Create Prefab&quot;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="grid grid-cols-2 gap-2">
        {prefabs.map((prefab) => (
          <PrefabCard
            key={prefab.id}
            prefab={prefab}
            onInstantiate={() => onInstantiatePrefab(prefab.id)}
            onDelete={() => onDeletePrefab(prefab.id)}
            onUpdate={onUpdatePrefab ? () => onUpdatePrefab(prefab.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

interface PrefabCardProps {
  prefab: PrefabDefinition;
  onInstantiate: () => void;
  onDelete: () => void;
  onUpdate?: () => void;
}

function PrefabCard({
  prefab,
  onInstantiate,
  onDelete,
  onUpdate,
}: PrefabCardProps) {
  return (
    <div className="bg-gray-700 rounded-lg overflow-hidden group hover:bg-gray-650 transition-colors">
      {/* Thumbnail */}
      <div className="aspect-square bg-gray-800 flex items-center justify-center relative">
        {prefab.thumbnail ? (
          <img
            src={prefab.thumbnail}
            alt={prefab.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-blue-500"
          >
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
          </svg>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={onInstantiate}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
            title="Instantiate"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z" />
            </svg>
          </button>
          {onUpdate && (
            <button
              onClick={onUpdate}
              className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
              title="Update Prefab"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8z" />
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
              </svg>
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
            title="Delete"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
              <path
                fillRule="evenodd"
                d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-2">
        <h4 className="text-sm font-medium truncate" title={prefab.name}>
          {prefab.name}
        </h4>
        {prefab.description && (
          <p className="text-xs text-gray-400 truncate" title={prefab.description}>
            {prefab.description}
          </p>
        )}
      </div>
    </div>
  );
}
