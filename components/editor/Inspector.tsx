import type { GameObject, Component } from "@/lib/types/gamespec";
import { useState } from "react";

interface InspectorProps {
  selectedObject: GameObject | undefined;
  onObjectUpdate: (objectId: string, updates: Partial<GameObject>) => void;
}

export function Inspector({ selectedObject, onObjectUpdate }: InspectorProps) {
  const [showAddComponent, setShowAddComponent] = useState(false);

  if (!selectedObject) {
    return (
      <div className="p-4 text-gray-400 text-sm">
        Select an object to view its properties
      </div>
    );
  }

  const handleTransformChange = (
    type: "position" | "rotation" | "scale",
    axis: "x" | "y" | "z",
    value: number,
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

  const handleAddComponent = (componentType: string) => {
    let newComponent: Component;

    switch (componentType) {
      case "mesh":
        newComponent = {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x888888,
            width: 1,
            height: 1,
            depth: 1,
          },
        };
        break;
      case "light":
        newComponent = {
          type: "light",
          properties: {
            light_type: "point",
            color: 0xffffff,
            intensity: 1,
          },
        };
        break;
      case "camera":
        newComponent = {
          type: "camera",
          properties: {
            fov: 75,
            aspect: 16 / 9,
            near: 0.1,
            far: 1000,
          },
        };
        break;
      default:
        return;
    }

    onObjectUpdate(selectedObject.id, {
      components: [...selectedObject.components, newComponent],
    });
    setShowAddComponent(false);
  };

  const handleRemoveComponent = (index: number) => {
    const newComponents = selectedObject.components.filter(
      (_, i) => i !== index,
    );
    onObjectUpdate(selectedObject.id, {
      components: newComponents,
    });
  };

  const handleComponentPropertyChange = (
    componentIndex: number,
    propertyKey: string,
    value: unknown,
  ) => {
    const newComponents = [...selectedObject.components];
    newComponents[componentIndex] = {
      ...newComponents[componentIndex],
      properties: {
        ...newComponents[componentIndex].properties,
        [propertyKey]: value,
      },
    };
    onObjectUpdate(selectedObject.id, {
      components: newComponents,
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
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Transform</h3>
          <div className="flex gap-1">
            <button
              onClick={() => {
                onObjectUpdate(selectedObject.id, {
                  transform: {
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 },
                    scale: { x: 1, y: 1, z: 1 },
                  },
                });
              }}
              className="px-2 py-0.5 text-xs bg-gray-600 hover:bg-gray-500 rounded transition-colors"
              title="Reset Transform"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Position */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400">Position</label>
            <button
              onClick={() => {
                onObjectUpdate(selectedObject.id, {
                  transform: {
                    ...selectedObject.transform,
                    position: { x: 0, y: 0, z: 0 },
                  },
                });
              }}
              className="px-1 text-xs text-gray-500 hover:text-gray-300"
              title="Reset Position"
            >
              ↺
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Vector3Input
              label="X"
              value={selectedObject.transform.position.x}
              onChange={(val) => handleTransformChange("position", "x", val)}
            />
            <Vector3Input
              label="Y"
              value={selectedObject.transform.position.y}
              onChange={(val) => handleTransformChange("position", "y", val)}
            />
            <Vector3Input
              label="Z"
              value={selectedObject.transform.position.z}
              onChange={(val) => handleTransformChange("position", "z", val)}
            />
          </div>
        </div>

        {/* Rotation */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400">Rotation</label>
            <button
              onClick={() => {
                onObjectUpdate(selectedObject.id, {
                  transform: {
                    ...selectedObject.transform,
                    rotation: { x: 0, y: 0, z: 0 },
                  },
                });
              }}
              className="px-1 text-xs text-gray-500 hover:text-gray-300"
              title="Reset Rotation"
            >
              ↺
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Vector3Input
              label="X"
              value={selectedObject.transform.rotation.x}
              onChange={(val) => handleTransformChange("rotation", "x", val)}
            />
            <Vector3Input
              label="Y"
              value={selectedObject.transform.rotation.y}
              onChange={(val) => handleTransformChange("rotation", "y", val)}
            />
            <Vector3Input
              label="Z"
              value={selectedObject.transform.rotation.z}
              onChange={(val) => handleTransformChange("rotation", "z", val)}
            />
          </div>
        </div>

        {/* Scale */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400">Scale</label>
            <button
              onClick={() => {
                onObjectUpdate(selectedObject.id, {
                  transform: {
                    ...selectedObject.transform,
                    scale: { x: 1, y: 1, z: 1 },
                  },
                });
              }}
              className="px-1 text-xs text-gray-500 hover:text-gray-300"
              title="Reset Scale"
            >
              ↺
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Vector3Input
              label="X"
              value={selectedObject.transform.scale.x}
              onChange={(val) => handleTransformChange("scale", "x", val)}
            />
            <Vector3Input
              label="Y"
              value={selectedObject.transform.scale.y}
              onChange={(val) => handleTransformChange("scale", "y", val)}
            />
            <Vector3Input
              label="Z"
              value={selectedObject.transform.scale.z}
              onChange={(val) => handleTransformChange("scale", "z", val)}
            />
          </div>
        </div>
      </div>

      {/* Components */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Components</h3>
          <button
            onClick={() => setShowAddComponent(!showAddComponent)}
            className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded transition-colors"
          >
            + Add
          </button>
        </div>

        {showAddComponent && (
          <div className="p-2 bg-gray-800 rounded border border-gray-600 space-y-1">
            <button
              onClick={() => handleAddComponent("mesh")}
              className="w-full text-left px-2 py-1 text-xs hover:bg-gray-700 rounded transition-colors"
            >
              Mesh Renderer
            </button>
            <button
              onClick={() => handleAddComponent("light")}
              className="w-full text-left px-2 py-1 text-xs hover:bg-gray-700 rounded transition-colors"
            >
              Light
            </button>
            <button
              onClick={() => handleAddComponent("camera")}
              className="w-full text-left px-2 py-1 text-xs hover:bg-gray-700 rounded transition-colors"
            >
              Camera
            </button>
          </div>
        )}

        {selectedObject.components.map((component, index) => (
          <ComponentEditor
            key={index}
            component={component}
            index={index}
            onRemove={() => handleRemoveComponent(index)}
            onPropertyChange={(key, value) =>
              handleComponentPropertyChange(index, key, value)
            }
          />
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

interface ComponentEditorProps {
  component: Component;
  index: number;
  onRemove: () => void;
  onPropertyChange: (key: string, value: unknown) => void;
}

function ComponentEditor({
  component,
  onRemove,
  onPropertyChange,
}: ComponentEditorProps) {
  return (
    <div className="p-2 bg-gray-700 rounded border border-gray-600">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-blue-400">
          {component.type === "mesh" && "Mesh Renderer"}
          {component.type === "light" && "Light"}
          {component.type === "camera" && "Camera"}
          {!["mesh", "light", "camera"].includes(component.type) &&
            component.type}
        </div>
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 text-xs"
          title="Remove Component"
        >
          ✕
        </button>
      </div>

      {component.type === "mesh" && (
        <MeshComponentEditor
          properties={component.properties}
          onPropertyChange={onPropertyChange}
        />
      )}

      {component.type === "light" && (
        <LightComponentEditor
          properties={component.properties}
          onPropertyChange={onPropertyChange}
        />
      )}

      {component.type === "camera" && (
        <CameraComponentEditor
          properties={component.properties}
          onPropertyChange={onPropertyChange}
        />
      )}

      {!["mesh", "light", "camera"].includes(component.type) && (
        <div className="text-xs text-gray-400">
          {Object.entries(component.properties).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span>{key}:</span>
              <span>{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface MeshComponentEditorProps {
  properties: Record<string, unknown>;
  onPropertyChange: (key: string, value: unknown) => void;
}

function MeshComponentEditor({
  properties,
  onPropertyChange,
}: MeshComponentEditorProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Geometry</label>
        <select
          value={String(properties.geometry || "box")}
          onChange={(e) => onPropertyChange("geometry", e.target.value)}
          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs focus:outline-none focus:border-blue-500"
        >
          <option value="box">Box</option>
          <option value="sphere">Sphere</option>
          <option value="plane">Plane</option>
          <option value="cylinder">Cylinder</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Color</label>
        <input
          type="color"
          value={`#${Number(properties.color || 0x888888)
            .toString(16)
            .padStart(6, "0")}`}
          onChange={(e) =>
            onPropertyChange("color", parseInt(e.target.value.slice(1), 16))
          }
          className="w-full h-8 bg-gray-600 border border-gray-500 rounded cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Width</label>
          <input
            type="number"
            value={Number(properties.width || 1)}
            onChange={(e) =>
              onPropertyChange("width", parseFloat(e.target.value) || 1)
            }
            step="0.1"
            className="w-full px-1 py-0.5 bg-gray-600 border border-gray-500 rounded text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Height</label>
          <input
            type="number"
            value={Number(properties.height || 1)}
            onChange={(e) =>
              onPropertyChange("height", parseFloat(e.target.value) || 1)
            }
            step="0.1"
            className="w-full px-1 py-0.5 bg-gray-600 border border-gray-500 rounded text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Depth</label>
          <input
            type="number"
            value={Number(properties.depth || 1)}
            onChange={(e) =>
              onPropertyChange("depth", parseFloat(e.target.value) || 1)
            }
            step="0.1"
            className="w-full px-1 py-0.5 bg-gray-600 border border-gray-500 rounded text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

interface LightComponentEditorProps {
  properties: Record<string, unknown>;
  onPropertyChange: (key: string, value: unknown) => void;
}

function LightComponentEditor({
  properties,
  onPropertyChange,
}: LightComponentEditorProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Light Type</label>
        <select
          value={String(properties.light_type || "point")}
          onChange={(e) => onPropertyChange("light_type", e.target.value)}
          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs focus:outline-none focus:border-blue-500"
        >
          <option value="point">Point Light</option>
          <option value="spot">Spot Light</option>
          <option value="directional">Directional Light</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Color</label>
        <input
          type="color"
          value={`#${Number(properties.color || 0xffffff)
            .toString(16)
            .padStart(6, "0")}`}
          onChange={(e) =>
            onPropertyChange("color", parseInt(e.target.value.slice(1), 16))
          }
          className="w-full h-8 bg-gray-600 border border-gray-500 rounded cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Intensity</label>
        <input
          type="number"
          value={Number(properties.intensity || 1)}
          onChange={(e) =>
            onPropertyChange("intensity", parseFloat(e.target.value) || 1)
          }
          step="0.1"
          min="0"
          max="10"
          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}

interface CameraComponentEditorProps {
  properties: Record<string, unknown>;
  onPropertyChange: (key: string, value: unknown) => void;
}

function CameraComponentEditor({
  properties,
  onPropertyChange,
}: CameraComponentEditorProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs text-gray-400 mb-1">FOV</label>
        <input
          type="number"
          value={Number(properties.fov || 75)}
          onChange={(e) =>
            onPropertyChange("fov", parseFloat(e.target.value) || 75)
          }
          step="1"
          min="1"
          max="180"
          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Aspect Ratio</label>
        <input
          type="number"
          value={Number(properties.aspect || 16 / 9)}
          onChange={(e) =>
            onPropertyChange("aspect", parseFloat(e.target.value) || 16 / 9)
          }
          step="0.01"
          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Near</label>
          <input
            type="number"
            value={Number(properties.near || 0.1)}
            onChange={(e) =>
              onPropertyChange("near", parseFloat(e.target.value) || 0.1)
            }
            step="0.1"
            min="0.01"
            className="w-full px-1 py-0.5 bg-gray-600 border border-gray-500 rounded text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Far</label>
          <input
            type="number"
            value={Number(properties.far || 1000)}
            onChange={(e) =>
              onPropertyChange("far", parseFloat(e.target.value) || 1000)
            }
            step="10"
            className="w-full px-1 py-0.5 bg-gray-600 border border-gray-500 rounded text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
