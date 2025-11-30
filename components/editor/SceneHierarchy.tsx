import type { GameObject } from "@/lib/types/gamespec";

interface SceneHierarchyProps {
  gameObjects: GameObject[];
  selectedObjectId: string | null;
  onObjectSelect: (objectId: string) => void;
  onAddObject: () => void;
  onDuplicateObject: (objectId: string) => void;
  onDeleteObject: (objectId: string) => void;
  onCreatePrefab?: () => void;
}

export function SceneHierarchy({
  gameObjects,
  selectedObjectId,
  onObjectSelect,
  onAddObject,
  onDuplicateObject,
  onDeleteObject,
  onCreatePrefab,
}: SceneHierarchyProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-700">
        <button
          onClick={onAddObject}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          title="Add GameObject"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z" />
          </svg>
        </button>
        <button
          onClick={() =>
            selectedObjectId && onDuplicateObject(selectedObjectId)
          }
          disabled={!selectedObjectId}
          className="p-1 hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Duplicate Selected"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" />
          </svg>
        </button>
        <button
          onClick={() => selectedObjectId && onDeleteObject(selectedObjectId)}
          disabled={!selectedObjectId}
          className="p-1 hover:bg-red-900/50 text-red-400 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Delete Selected"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
            <path
              fillRule="evenodd"
              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
            />
          </svg>
        </button>
        {onCreatePrefab && (
          <button
            onClick={onCreatePrefab}
            disabled={!selectedObjectId}
            className="p-1 hover:bg-green-900/50 text-green-400 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ml-auto"
            title="Create Prefab from Selected"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2L2 5v6c0 3.7 2.56 7.16 6 8 3.44-.84 6-4.3 6-8V5l-6-3z" />
            </svg>
          </button>
        )}
      </div>

      {/* GameObject List */}
      <div className="flex-1 overflow-y-auto p-2">
        {gameObjects.map((obj) => (
          <GameObjectItem
            key={obj.id}
            gameObject={obj}
            selectedObjectId={selectedObjectId}
            onObjectSelect={onObjectSelect}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
}

interface GameObjectItemProps {
  gameObject: GameObject;
  selectedObjectId: string | null;
  onObjectSelect: (objectId: string) => void;
  depth: number;
}

function GameObjectItem({
  gameObject,
  selectedObjectId,
  onObjectSelect,
  depth,
}: GameObjectItemProps) {
  const isSelected = gameObject.id === selectedObjectId;

  return (
    <div>
      <div
        className={`
          flex items-center px-2 py-1 rounded cursor-pointer hover:bg-gray-700
          ${isSelected ? "bg-blue-600 hover:bg-blue-700" : ""}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onObjectSelect(gameObject.id)}
      >
        <span className="text-sm">{gameObject.name}</span>
      </div>
      {gameObject.children?.map((child) => (
        <GameObjectItem
          key={child.id}
          gameObject={child}
          selectedObjectId={selectedObjectId}
          onObjectSelect={onObjectSelect}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
