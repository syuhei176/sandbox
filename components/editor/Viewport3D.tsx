"use client";

import { useRef, useEffect, type ReactElement } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import type { GameObject } from "@/lib/types/gamespec";

interface Viewport3DProps {
  gameObjects: GameObject[];
  selectedObjectId: string | null;
}

export function Viewport3D({ gameObjects, selectedObjectId }: Viewport3DProps) {
  return (
    <div className="w-full h-full bg-gray-900">
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
}

function GameObjectRenderer({
  gameObject,
  isSelected,
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

  return (
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
        return null;
      })}
      {gameObject.children?.map((child) => (
        <GameObjectRenderer
          key={child.id}
          gameObject={child}
          isSelected={false}
        />
      ))}
    </group>
  );
}

interface MeshComponentProps {
  properties: Record<string, unknown>;
  isSelected: boolean;
}

function MeshComponent({ properties, isSelected }: MeshComponentProps) {
  // Helper to safely get numeric properties
  const getNum = (key: string, defaultValue: number): number => {
    const value = properties[key];
    return typeof value === "number" ? value : defaultValue;
  };

  let geometry: ReactElement;

  switch (properties.geometry) {
    case "box":
      geometry = (
        <boxGeometry
          args={[getNum("width", 1), getNum("height", 1), getNum("depth", 1)]}
        />
      );
      break;
    case "sphere":
      geometry = <sphereGeometry args={[getNum("radius", 0.5), 32, 32]} />;
      break;
    case "plane":
      geometry = (
        <planeGeometry args={[getNum("width", 1), getNum("height", 1)]} />
      );
      break;
    case "cylinder":
      geometry = (
        <cylinderGeometry
          args={[
            getNum("radiusTop", 0.5),
            getNum("radiusBottom", 0.5),
            getNum("height", 1),
            32,
          ]}
        />
      );
      break;
    default:
      geometry = <boxGeometry args={[1, 1, 1]} />;
  }

  const color = getNum("color", 0xffffff);
  const metalness = getNum("metalness", 0);
  const roughness = getNum("roughness", 0.5);

  return (
    <mesh>
      {geometry}
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        emissive={isSelected ? 0x4444ff : 0x000000}
        emissiveIntensity={isSelected ? 0.3 : 0}
      />
      {isSelected && (
        <lineSegments>
          <edgesGeometry
            attach="geometry"
            args={[
              properties.geometry === "box"
                ? new THREE.BoxGeometry(
                    getNum("width", 1),
                    getNum("height", 1),
                    getNum("depth", 1),
                  )
                : new THREE.SphereGeometry(getNum("radius", 0.5), 32, 32),
            ]}
          />
          <lineBasicMaterial attach="material" color="#00ffff" />
        </lineSegments>
      )}
    </mesh>
  );
}
