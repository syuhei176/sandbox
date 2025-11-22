import type { GameObject } from '@/lib/types/gamespec';

interface InspectorProps {
  selectedObject: GameObject | undefined;
  onObjectUpdate: (objectId: string, updates: Partial<GameObject>) => void;
}

export function Inspector({ selectedObject, onObjectUpdate }: InspectorProps) {
  if (!selectedObject) {
    return (
      <div className="p-4 text-gray-400 text-sm">
        Select an object to view its properties
      </div>
    );
  }

  const handleTransformChange = (
    type: 'position' | 'rotation' | 'scale',
    axis: 'x' | 'y' | 'z',
    value: number
  ) => {
    onObjectUpdate(selectedObject.id, {
      transform: {
        ...selectedObject.transform,
        [type]: {
          ...selectedObject.transform[type],
          [axis]: value,
        },
      },
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Object Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1">
          Name
        </label>
        <input
          type="text"
          value={selectedObject.name}
          onChange={(e) =>
            onObjectUpdate(selectedObject.id, { name: e.target.value })
          }
          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Transform */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Transform</h3>

        {/* Position */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Position</label>
          <div className="grid grid-cols-3 gap-2">
            <Vector3Input
              label="X"
              value={selectedObject.transform.position.x}
              onChange={(val) => handleTransformChange('position', 'x', val)}
            />
            <Vector3Input
              label="Y"
              value={selectedObject.transform.position.y}
              onChange={(val) => handleTransformChange('position', 'y', val)}
            />
            <Vector3Input
              label="Z"
              value={selectedObject.transform.position.z}
              onChange={(val) => handleTransformChange('position', 'z', val)}
            />
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Rotation</label>
          <div className="grid grid-cols-3 gap-2">
            <Vector3Input
              label="X"
              value={selectedObject.transform.rotation.x}
              onChange={(val) => handleTransformChange('rotation', 'x', val)}
            />
            <Vector3Input
              label="Y"
              value={selectedObject.transform.rotation.y}
              onChange={(val) => handleTransformChange('rotation', 'y', val)}
            />
            <Vector3Input
              label="Z"
              value={selectedObject.transform.rotation.z}
              onChange={(val) => handleTransformChange('rotation', 'z', val)}
            />
          </div>
        </div>

        {/* Scale */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Scale</label>
          <div className="grid grid-cols-3 gap-2">
            <Vector3Input
              label="X"
              value={selectedObject.transform.scale.x}
              onChange={(val) => handleTransformChange('scale', 'x', val)}
            />
            <Vector3Input
              label="Y"
              value={selectedObject.transform.scale.y}
              onChange={(val) => handleTransformChange('scale', 'y', val)}
            />
            <Vector3Input
              label="Z"
              value={selectedObject.transform.scale.z}
              onChange={(val) => handleTransformChange('scale', 'z', val)}
            />
          </div>
        </div>
      </div>

      {/* Components */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Components</h3>
        {selectedObject.components.map((component, index) => (
          <div
            key={index}
            className="p-2 bg-gray-700 rounded border border-gray-600"
          >
            <div className="text-xs font-semibold text-blue-400 mb-1">
              {component.type}
            </div>
            <div className="text-xs text-gray-400">
              {Object.entries(component.properties).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Script */}
      {selectedObject.script_id && (
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">
            Script
          </label>
          <div className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-blue-400">
            {selectedObject.script_id}
          </div>
        </div>
      )}
    </div>
  );
}

interface Vector3InputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function Vector3Input({ label, value, onChange }: Vector3InputProps) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step="0.1"
        className="w-full px-1 py-0.5 bg-gray-700 border border-gray-600 rounded text-xs focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}
