import type { GameObject } from '@/lib/types/gamespec';

interface SceneHierarchyProps {
  gameObjects: GameObject[];
  selectedObjectId: string | null;
  onObjectSelect: (objectId: string) => void;
}

export function SceneHierarchy({
  gameObjects,
  selectedObjectId,
  onObjectSelect,
}: SceneHierarchyProps) {
  return (
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
          ${isSelected ? 'bg-blue-600 hover:bg-blue-700' : ''}
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
