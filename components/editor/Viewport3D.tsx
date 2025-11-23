"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  memo,
  useMemo,
  type ReactElement,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, TransformControls } from "@react-three/drei";
import * as THREE from "three";
import type { GameObject } from "@/lib/types/gamespec";

interface Viewport3DProps {
  gameObjects: GameObject[];
  selectedObjectId: string | null;
  onObjectTransformChange?: (
    objectId: string,
    transform: GameObject["transform"],
  ) => void;
}

export function Viewport3D({
  gameObjects,
  selectedObjectId,
  onObjectTransformChange,
}: Viewport3DProps) {
  const [transformMode, setTransformMode] = useState<
    "translate" | "rotate" | "scale"
  >("translate");

  // Keyboard shortcuts for transform modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "w") setTransformMode("translate");
      if (e.key === "e") setTransformMode("rotate");
      if (e.key === "r") setTransformMode("scale");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full h-full bg-gray-900 relative">
      {/* Transform Mode Indicator */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-2 rounded text-sm">
        Mode: {transformMode.toUpperCase()} (W/E/R to switch)
      </div>

      <Canvas camera={{ position: [5, 5, 5], fov: 75 }}>
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
            onTransformChange={onObjectTransformChange}
          />
        ))}

        {/* Camera Controls */}
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}

interface GameObjectRendererProps {
  gameObject: GameObject;
  isSelected: boolean;
  transformMode: "translate" | "rotate" | "scale";
  onTransformChange?: (
    objectId: string,
    transform: GameObject["transform"],
  ) => void;
}

const GameObjectRenderer = memo(function GameObjectRenderer({
  gameObject,
  isSelected,
  transformMode,
  onTransformChange,
}: GameObjectRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  const orbitControlsRef = useRef<any>(null);

  const { camera, gl } = useThree();

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
            onTransformChange={onTransformChange}
          />
        ))}
      </group>

      {isSelected && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode={transformMode}
          translationSnap={0.5}
          rotationSnap={Math.PI / 12}
          scaleSnap={0.1}
          onObjectChange={handleTransformChange}
        />
      )}
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

interface MeshComponentProps {
  properties: Record<string, unknown>;
  isSelected: boolean;
}

const MeshComponent = memo(function MeshComponent({
  properties,
  isSelected,
}: MeshComponentProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Helper to safely get numeric properties
  const getNum = (key: string, defaultValue: number): number => {
    const value = properties[key];
    return typeof value === "number" ? value : defaultValue;
  };

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
  }, [
    properties.geometry,
    properties.width,
    properties.height,
    properties.depth,
    properties.radius,
    properties.radiusTop,
    properties.radiusBottom,
  ]);

  const color = getNum("color", 0xffffff);
  const metalness = getNum("metalness", 0);
  const roughness = getNum("roughness", 0.5);

  // Memoize bounding box helper
  const boundingBoxHelper = useMemo(() => {
    if (!isSelected || !meshRef.current) return null;

    return (
      <boxHelper args={[meshRef.current, 0x00ffff]}>
        <lineBasicMaterial color="#00ffff" linewidth={2} />
      </boxHelper>
    );
  }, [isSelected]);

  return (
    <>
      <mesh ref={meshRef}>
        {geometry}
        <meshStandardMaterial
          color={color}
          metalness={metalness}
          roughness={roughness}
          emissive={isSelected ? 0x4444ff : 0x000000}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
      {isSelected && meshRef.current && (
        <lineSegments>
          <edgesGeometry attach="geometry" args={[meshRef.current.geometry]} />
          <lineBasicMaterial attach="material" color="#00ffff" linewidth={2} />
        </lineSegments>
      )}
    </>
  );
});
