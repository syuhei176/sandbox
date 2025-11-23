import type {
  GameObject,
  Component,
  ScriptDefinition,
} from "@/lib/types/gamespec";
import { useState, useRef } from "react";
import { ModelGenerator } from "./ModelGenerator";

interface InspectorProps {
  selectedObject: GameObject | undefined;
  scripts: ScriptDefinition[];
  onObjectUpdate: (objectId: string, updates: Partial<GameObject>) => void;
}

export function Inspector({
  selectedObject,
  scripts,
  onObjectUpdate,
}: InspectorProps) {
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Script</h3>
        </div>

        {selectedObject.script_id ? (
          <div className="p-2 bg-gray-700 rounded border border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-blue-400">
                {scripts.find((s) => s.id === selectedObject.script_id)?.name ||
                  "Unknown Script"}
              </div>
              <button
                onClick={() =>
                  onObjectUpdate(selectedObject.id, { script_id: undefined })
                }
                className="text-red-400 hover:text-red-300 text-xs"
                title="Detach Script"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-gray-400">
              ID: {selectedObject.script_id}
            </div>
          </div>
        ) : (
          <div className="p-2 bg-gray-700 rounded border border-gray-600">
            <label className="block text-xs text-gray-400 mb-1">
              Attach Script
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onObjectUpdate(selectedObject.id, {
                    script_id: e.target.value,
                  });
                  e.target.value = ""; // Reset selection
                }
              }}
              className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs focus:outline-none focus:border-blue-500"
              defaultValue=""
            >
              <option value="" disabled>
                Select a script...
              </option>
              {scripts.map((script) => (
                <option key={script.id} value={script.id}>
                  {script.name}
                </option>
              ))}
              {scripts.length === 0 && (
                <option value="" disabled>
                  No scripts available
                </option>
              )}
            </select>
          </div>
        )}
      </div>
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
  const [isUploading, setIsUploading] = useState(false);
  const [showModelGenerator, setShowModelGenerator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExtensions = [".glb", ".gltf"];
    const fileExtension = file.name
      .toLowerCase()
      .slice(file.name.lastIndexOf("."));
    if (!validExtensions.includes(fileExtension)) {
      alert("Please upload a GLB or GLTF file");
      return;
    }

    setIsUploading(true);

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Generate unique ID
      const modelId = `model-${Date.now()}`;

      // Import modelStorage
      const { modelStorage } = await import("@/lib/utils/model-storage");

      // Save to IndexedDB
      await modelStorage.saveModel({
        id: modelId,
        name: file.name,
        data: arrayBuffer,
        format: fileExtension === ".glb" ? "glb" : "gltf",
        created_at: new Date().toISOString(),
        file_size: arrayBuffer.byteLength,
      });

      // Update GameObject properties
      onPropertyChange("model_id", modelId);
      onPropertyChange("geometry", "custom_model");

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to upload model:", error);
      alert("Failed to upload model. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleModelGenerated = (modelId: string, modelUrl: string) => {
    // Update GameObject properties with generated model
    onPropertyChange("model_id", modelId);
    onPropertyChange("geometry", "custom_model");
    setShowModelGenerator(false);
  };

  return (
    <>
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
            <option value="custom_model">Custom Model</option>
          </select>
        </div>

        {properties.geometry === "custom_model" && (
          <div className="space-y-2 p-3 bg-gray-700 rounded border border-gray-600">
            <div className="text-xs text-gray-300 font-medium mb-2">
              Custom 3D Model
            </div>

            {properties.model_id ? (
              <div className="space-y-2">
                <div className="text-xs text-green-400">
                  ✓ Model loaded: {String(properties.model_id)}
                </div>
                <button
                  onClick={() => {
                    onPropertyChange("model_id", undefined);
                    onPropertyChange("geometry", "box");
                  }}
                  className="w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-white text-xs transition-colors"
                >
                  Remove Model
                </button>
              </div>
            ) : (
              <div>
                <label className="block">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".glb,.gltf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <div className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-white text-xs text-center cursor-pointer transition-colors">
                    {isUploading ? "Uploading..." : "Upload GLB/GLTF File"}
                  </div>
                </label>
                <div className="text-xs text-gray-400 mt-1">
                  Supported formats: .glb, .gltf
                </div>

                <div className="mt-3 pt-3 border-t border-gray-600">
                  <button
                    onClick={() => setShowModelGenerator(true)}
                    className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white text-xs text-center transition-colors"
                  >
                    ✨ Generate from AI
                  </button>
                  <div className="text-xs text-gray-400 mt-1 text-center">
                    Create 3D models using text descriptions
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {properties.geometry !== "custom_model" && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Color</label>
              <input
                type="color"
                value={`#${Number(properties.color || 0x888888)
                  .toString(16)
                  .padStart(6, "0")}`}
                onChange={(e) =>
                  onPropertyChange(
                    "color",
                    parseInt(e.target.value.slice(1), 16),
                  )
                }
                className="w-full h-8 bg-gray-600 border border-gray-500 rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Width
                </label>
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
                <label className="block text-xs text-gray-400 mb-1">
                  Height
                </label>
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
                <label className="block text-xs text-gray-400 mb-1">
                  Depth
                </label>
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
          </>
        )}

        {/* Collision Properties */}
        <div className="pt-3 border-t border-gray-600 space-y-2">
          <div className="text-xs font-semibold text-gray-300 mb-2">
            Collision Detection
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Enable Collision</label>
            <input
              type="checkbox"
              checked={properties.hasCollision === true}
              onChange={(e) =>
                onPropertyChange("hasCollision", e.target.checked)
              }
              className="w-4 h-4 bg-gray-600 border border-gray-500 rounded cursor-pointer"
            />
          </div>

          {properties.hasCollision === true && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Collision Shape
                </label>
                <select
                  value={String(properties.collisionShape || "auto")}
                  onChange={(e) =>
                    onPropertyChange("collisionShape", e.target.value)
                  }
                  className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="auto">Auto (match geometry)</option>
                  <option value="box">Box (AABB)</option>
                  <option value="sphere">Sphere</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs text-gray-400">
                    Is Trigger
                  </label>
                  <div className="text-xs text-gray-500">
                    Pass through but detect
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={properties.isTrigger === true}
                  onChange={(e) =>
                    onPropertyChange("isTrigger", e.target.checked)
                  }
                  className="w-4 h-4 bg-gray-600 border border-gray-500 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Collision Layer
                </label>
                <input
                  type="number"
                  value={Number(properties.collisionLayer || 0)}
                  onChange={(e) =>
                    onPropertyChange(
                      "collisionLayer",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  min="0"
                  max="31"
                  className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs focus:outline-none focus:border-blue-500"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Layer 0-31 for collision filtering
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Model Generator Modal */}
      {showModelGenerator && (
        <ModelGenerator
          onModelGenerated={handleModelGenerated}
          onClose={() => setShowModelGenerator(false)}
        />
      )}
    </>
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
