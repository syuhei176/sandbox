
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  memo,
  useMemo,
  Suspense,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  TransformControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import type {
  GameObject,
  ScriptDefinition,
  GameSpec,
  Vector3,
} from "@/lib/types/gamespec";
import { modelStorage } from "@/lib/utils/model-storage";
import { GameEngine } from "@/lib/runtime/game-engine";

// TransformControlsWrapper - disables OrbitControls during transformation
function TransformControlsWrapper({
  object,
  mode,
  translationSnap,
  rotationSnap,
  scaleSnap,
  onObjectChange,
  onTransformingChange,
}: {
  object: THREE.Object3D;
  mode: 'translate' | 'rotate' | 'scale';
  translationSnap?: number;
  rotationSnap?: number;
  scaleSnap?: number;
  onObjectChange?: () => void;
  onTransformingChange?: (transforming: boolean) => void;
}) {
  const controlsRef = useRef<typeof TransformControls.prototype | null>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const callback = (event: { value: boolean }) => {
      onTransformingChange?.(event.value);
    };

    controls.addEventListener('dragging-changed', callback);
    return () => controls.removeEventListener('dragging-changed', callback);
  }, [onTransformingChange]);

  return (
    <TransformControls
      ref={controlsRef}
      object={object}
      mode={mode}
      translationSnap={translationSnap}
      rotationSnap={rotationSnap}
      scaleSnap={scaleSnap}
      onObjectChange={onObjectChange}
    />
  );
}

// DropZoneHandler - handles prefab drop inside Canvas
function DropZoneHandler({
  dropRequest,
  onPrefabDrop,
}: {
  dropRequest: {
    prefabId: string;
    mouseNDC: { x: number; y: number };
  } | null;
  onPrefabDrop?: (prefabId: string, position: Vector3) => void;
}) {
  const { camera } = useThree();

  useEffect(() => {
    if (!dropRequest || !onPrefabDrop) return;

    const { prefabId, mouseNDC } = dropRequest;
    console.log("DropZoneHandler processing drop:", prefabId, mouseNDC);

    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseNDC.x, mouseNDC.y), camera);

    // Ground plane at Y=0
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(groundPlane, intersection)) {
      console.log("Intersection found:", intersection);
      onPrefabDrop(prefabId, {
        x: intersection.x,
        y: intersection.y,
        z: intersection.z,
      });
    } else {
      console.warn("No intersection with ground plane, using origin");
      // Fallback to origin if no intersection
      onPrefabDrop(prefabId, { x: 0, y: 0, z: 0 });
    }
  }, [dropRequest, camera, onPrefabDrop]);

  return null;
}

interface Viewport3DProps {
  gameObjects: GameObject[];
  scripts: ScriptDefinition[];
  selectedObjectId: string | null;
  onObjectSelect?: (objectId: string) => void;
  onObjectTransformChange?: (
    objectId: string,
    transform: GameObject["transform"],
  ) => void;
  isPlayMode?: boolean;
  onPrefabDrop?: (prefabId: string, position: Vector3) => void;
}

export function Viewport3D({
  gameObjects,
  scripts,
  selectedObjectId,
  onObjectSelect,
  onObjectTransformChange,
  isPlayMode = false,
  onPrefabDrop,
}: Viewport3DProps) {
  const [transformMode, setTransformMode] = useState<
    "translate" | "rotate" | "scale"
  >("translate");
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropRequest, setDropRequest] = useState<{
    prefabId: string;
    mouseNDC: { x: number; y: number };
  } | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const orbitControlsRef = useRef<typeof OrbitControls.prototype | null>(null);

  // Handle drop events
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (isPlayMode) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      if (!isDragOver) {
        console.log("Drag over viewport");
        setIsDragOver(true);
      }
    },
    [isPlayMode, isDragOver],
  );

  const handleDragLeave = useCallback(
    () => {
      if (isPlayMode) return;
      setIsDragOver(false);
    },
    [isPlayMode],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      console.log("Drop event fired");
      if (isPlayMode) {
        console.log("Ignoring drop - play mode active");
        return;
      }
      e.preventDefault();
      setIsDragOver(false);

      const prefabId = e.dataTransfer.getData("application/prefab-id");
      console.log("Dropped prefab ID:", prefabId);
      if (!prefabId) {
        console.warn("No prefab ID in drop data");
        return;
      }

      // Convert mouse position to NDC
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      console.log("Drop NDC coordinates:", { x, y });
      setDropRequest({ prefabId, mouseNDC: { x, y } });
    },
    [isPlayMode],
  );

  // Keyboard shortcuts for transform modes (only in edit mode)
  useEffect(() => {
    if (isPlayMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Prevent default behavior for these keys to avoid any conflicts
      if (e.key === "w" || e.key === "W" || e.key === "e" || e.key === "E" || e.key === "r" || e.key === "R" ||
          e.key === "a" || e.key === "A" || e.key === "s" || e.key === "S" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        e.stopPropagation();
      }

      const key = e.key.toLowerCase();
      if (key === "w") setTransformMode("translate");
      if (key === "e") setTransformMode("rotate");
      if (key === "r") setTransformMode("scale");
    };

    // Use capture phase to intercept events before they reach other handlers
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isPlayMode]);

  // Initialize/cleanup GameEngine for play mode
  useEffect(() => {
    if (!isPlayMode) {
      // Destroy engine when switching to edit mode
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      return;
    }

    // Initialize and start engine in play mode
    const initEngine = async () => {
      if (!canvasRef.current) return;

      // Always create a fresh engine instance
      engineRef.current = new GameEngine(canvasRef.current);

      // Create GameSpec from current editor state
      const gameSpec: GameSpec = {
        meta: {
          title: "Editor Playtest",
          description: "Playing from editor",
          version: "1.0.0",
        },
        players: {
          min: 1,
          max: 4,
          spawn_points: [{ x: 0, y: 1, z: 5 }],
        },
        worlds: [
          {
            id: "world-1",
            name: "Main World",
            environment: {
              ambient_light: {
                color: "#ffffff",
                intensity: 0.5,
              },
              directional_light: {
                color: "#ffffff",
                intensity: 1,
                position: { x: 1, y: 1, z: 1 },
              },
              skybox: "#87ceeb",
            },
            objects: gameObjects,
          },
        ],
        scripts: scripts,
      };

      await engineRef.current.loadGame(gameSpec);
      engineRef.current.start();

      // Handle canvas resize
      const handleResize = () => {
        if (canvasRef.current && engineRef.current) {
          const { clientWidth, clientHeight } = canvasRef.current;
          engineRef.current.resize(clientWidth, clientHeight);
        }
      };
      window.addEventListener("resize", handleResize);
      handleResize();

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    };

    initEngine();
  }, [isPlayMode, gameObjects, scripts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative" style={{ background: 'var(--void-black)' }}>
      {/* Transform Mode Indicator (Edit Mode only) */}
      {!isPlayMode && (
        <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded text-sm font-bold tracking-wider cyber-border" style={{ background: 'rgba(13, 6, 24, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid var(--cyan-neon)', color: 'var(--cyan-neon)', fontFamily: 'var(--font-display)' }}>
          MODE: {transformMode.toUpperCase()} <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>(W/E/R)</span>
        </div>
      )}

      {/* Play Mode Indicator */}
      {isPlayMode && (
        <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded text-sm font-bold tracking-wider" style={{ background: 'rgba(57, 255, 20, 0.2)', backdropFilter: 'blur(10px)', border: '2px solid var(--neon-green)', color: 'var(--neon-green)', fontFamily: 'var(--font-display)', boxShadow: 'var(--glow-green)', animation: 'pulse-glow 2s ease-in-out infinite' }}>
          ▶ PLAY MODE
        </div>
      )}

      {/* Edit Mode Canvas (React Three Fiber) */}
      {!isPlayMode && (
        <div
          className="w-full h-full"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: isDragOver ? "2px solid var(--cyan-neon)" : "2px solid transparent",
            transition: "all 0.3s ease",
            boxShadow: isDragOver ? 'var(--glow-md)' : 'none',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <Canvas
            camera={{ position: [5, 5, 5], fov: 75 }}
            frameloop="always"
            style={{
              width: '100%',
              height: '100%',
              display: 'block'
            }}
          >
            {/* Drop Zone Handler */}
            <DropZoneHandler
              dropRequest={dropRequest}
              onPrefabDrop={onPrefabDrop}
            />

            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} />

            {/* Grid */}
            <Grid
              args={[20, 20]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#6b7280"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#9ca3af"
              fadeDistance={30}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid={true}
            />

            {/* Game Objects */}
            {gameObjects.map((obj) => (
              <GameObjectRenderer
                key={obj.id}
                gameObject={obj}
                isSelected={obj.id === selectedObjectId}
                transformMode={transformMode}
                onSelect={onObjectSelect}
                onTransformChange={onObjectTransformChange}
                onTransformingChange={setIsTransforming}
              />
            ))}

            {/* Camera Controls */}
            <OrbitControls
              ref={orbitControlsRef}
              makeDefault
              enabled={!isTransforming}
              enableDamping={false}
              enableRotate={true}
              enablePan={true}
              enableZoom={true}
              autoRotate={false}
              listenToKeyEvents={undefined}
              mouseButtons={{
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN,
              }}
            />
          </Canvas>
        </div>
      )}

      {/* Play Mode Canvas (Raw Three.js) */}
      {isPlayMode && (
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: "block" }}
        />
      )}
    </div>
  );
}

interface GameObjectRendererProps {
  gameObject: GameObject;
  isSelected: boolean;
  transformMode: "translate" | "rotate" | "scale";
  onSelect?: (objectId: string) => void;
  onTransformChange?: (
    objectId: string,
    transform: GameObject["transform"],
  ) => void;
  onTransformingChange?: (transforming: boolean) => void;
}

const GameObjectRenderer = memo(function GameObjectRenderer({
  gameObject,
  isSelected,
  transformMode,
  onSelect,
  onTransformChange,
  onTransformingChange,
}: GameObjectRendererProps) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(
        gameObject.transform.position.x,
        gameObject.transform.position.y,
        gameObject.transform.position.z,
      );
      groupRef.current.rotation.set(
        gameObject.transform.rotation.x,
        gameObject.transform.rotation.y,
        gameObject.transform.rotation.z,
      );
      groupRef.current.scale.set(
        gameObject.transform.scale.x,
        gameObject.transform.scale.y,
        gameObject.transform.scale.z,
      );
    }
  }, [gameObject.transform]);

  const handleTransformChange = useCallback(() => {
    if (groupRef.current && onTransformChange) {
      const pos = groupRef.current.position;
      const rot = groupRef.current.rotation;
      const scl = groupRef.current.scale;

      onTransformChange(gameObject.id, {
        position: { x: pos.x, y: pos.y, z: pos.z },
        rotation: { x: rot.x, y: rot.y, z: rot.z },
        scale: { x: scl.x, y: scl.y, z: scl.z },
      });
    }
  }, [gameObject.id, onTransformChange]);

  return (
    <>
      <group ref={groupRef}>
        {gameObject.components.map((component, index) => {
          if (component.type === "mesh") {
            return (
              <MeshComponent
                key={index}
                properties={component.properties}
                isSelected={isSelected}
                gameObjectId={gameObject.id}
                onSelect={onSelect}
              />
            );
          }
          if (component.type === "camera") {
            return <CameraHelper key={index} />;
          }
          if (component.type === "light") {
            return (
              <LightHelper key={index} properties={component.properties} />
            );
          }
          return null;
        })}
        {gameObject.children?.map((child) => (
          <GameObjectRenderer
            key={child.id}
            gameObject={child}
            isSelected={false}
            transformMode={transformMode}
            onSelect={onSelect}
            onTransformChange={onTransformChange}
            onTransformingChange={onTransformingChange}
          />
        ))}
      </group>

      {/* eslint-disable react-hooks/refs */}
      {isSelected && groupRef.current && (
        <TransformControlsWrapper
          object={groupRef.current}
          mode={transformMode}
          translationSnap={0.5}
          rotationSnap={Math.PI / 12}
          scaleSnap={0.1}
          onObjectChange={handleTransformChange}
          onTransformingChange={onTransformingChange}
        />
      )}
      {/* eslint-enable react-hooks/refs */}
    </>
  );
});

// Helper components for visualization
function CameraHelper() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.3, 0.7]} />
      <meshBasicMaterial color="#ffff00" wireframe />
    </mesh>
  );
}

function LightHelper({ properties }: { properties: Record<string, unknown> }) {
  const lightType = properties.lightType as string;
  const color = (properties.color as number) || 0xffffff;

  if (lightType === "point") {
    return (
      <mesh>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
    );
  }

  return (
    <mesh>
      <coneGeometry args={[0.3, 0.5, 8]} />
      <meshBasicMaterial color={color} wireframe />
    </mesh>
  );
}

// Custom Model Renderer using GLTF
interface CustomModelRendererProps {
  properties: Record<string, unknown>;
  isSelected: boolean;
  gameObjectId: string;
  onSelect?: (objectId: string) => void;
}

function ModelContent({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  // Clone scene to allow multiple instances
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return <primitive object={clonedScene} />;
}

function LoadingPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#gray" opacity={0.3} transparent wireframe />
    </mesh>
  );
}

function ErrorPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#ff0000" opacity={0.5} transparent wireframe />
    </mesh>
  );
}

const CustomModelRenderer = memo(function CustomModelRenderer({
  properties,
  isSelected,
  gameObjectId,
  onSelect,
}: CustomModelRendererProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const modelId = properties.model_id as string | undefined;
  const modelUrl = properties.model_url as string | undefined;
  const modelData = properties.model_data as string | undefined;

  // Load from IndexedDB if model_id is provided
  useEffect(() => {
    if (modelId) {
      modelStorage
        .getModel(modelId)
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          setError(null);
        })
        .catch((err) => {
          console.error("Failed to load model from IndexedDB:", err);
          setError(err.message);
        });
    }

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId]);

  const finalUrl = blobUrl || modelUrl || modelData;

  if (error || !finalUrl) {
    return <ErrorPlaceholder />;
  }

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(gameObjectId);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      <Suspense fallback={<LoadingPlaceholder />}>
        <ModelContent url={finalUrl} />
      </Suspense>
      {isSelected && (
        <Box args={[1, 1, 1]} visible={false}>
          <meshBasicMaterial color="#00ffff" opacity={0.2} transparent />
        </Box>
      )}
    </group>
  );
});

function Box({
  args,
  visible,
  children,
}: {
  args: [number, number, number];
  visible?: boolean;
  children: React.ReactNode;
}) {
  return (
    <mesh visible={visible}>
      <boxGeometry args={args} />
      {children}
    </mesh>
  );
}

interface MeshComponentProps {
  properties: Record<string, unknown>;
  isSelected: boolean;
  gameObjectId: string;
  onSelect?: (objectId: string) => void;
}

const MeshComponent = memo(function MeshComponent({
  properties,
  isSelected,
  gameObjectId,
  onSelect,
}: MeshComponentProps) {
  // Check if this is a custom model
  if (properties.geometry === "custom_model") {
    return (
      <CustomModelRenderer
        properties={properties}
        isSelected={isSelected}
        gameObjectId={gameObjectId}
        onSelect={onSelect}
      />
    );
  }

  return (
    <StandardMeshRenderer
      properties={properties}
      isSelected={isSelected}
      gameObjectId={gameObjectId}
      onSelect={onSelect}
    />
  );
});

const StandardMeshRenderer = memo(function StandardMeshRenderer({
  properties,
  isSelected,
  gameObjectId,
  onSelect,
}: MeshComponentProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Helper to safely get numeric properties
  const getNum = useCallback(
    (key: string, defaultValue: number): number => {
      const value = properties[key];
      return typeof value === "number" ? value : defaultValue;
    },
    [properties],
  );

  // Memoize geometry
  const geometry = useMemo(() => {
    const geomType = properties.geometry as string;

    switch (geomType) {
      case "box":
        return (
          <boxGeometry
            args={[getNum("width", 1), getNum("height", 1), getNum("depth", 1)]}
          />
        );
      case "sphere":
        return <sphereGeometry args={[getNum("radius", 0.5), 32, 32]} />;
      case "plane":
        return (
          <planeGeometry args={[getNum("width", 1), getNum("height", 1)]} />
        );
      case "cylinder":
        return (
          <cylinderGeometry
            args={[
              getNum("radiusTop", 0.5),
              getNum("radiusBottom", 0.5),
              getNum("height", 1),
              32,
            ]}
          />
        );
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [getNum, properties.geometry]);

  const color = getNum("color", 0xffffff);
  const metalness = getNum("metalness", 0);
  const roughness = getNum("roughness", 0.5);

  return (
    <>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(gameObjectId);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        {geometry}
        <meshStandardMaterial
          color={color}
          metalness={metalness}
          roughness={roughness}
          emissive={isSelected ? 0x4444ff : 0x000000}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
      {/* eslint-disable react-hooks/refs */}
      {isSelected && meshRef.current && (
        <lineSegments>
          <edgesGeometry attach="geometry" args={[meshRef.current.geometry]} />
          <lineBasicMaterial attach="material" color="#00ffff" linewidth={2} />
        </lineSegments>
      )}
      {/* eslint-enable react-hooks/refs */}
    </>
  );
});
