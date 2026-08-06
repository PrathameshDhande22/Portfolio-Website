"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { DoubleSide, IcosahedronGeometry, type Group } from "three";

const MESH_VAR = "--slab-accent";
const MESH_FALLBACK = "#d2dc95";

function meshColor() {
  if (typeof window === "undefined") return MESH_FALLBACK;

  return getComputedStyle(document.documentElement).getPropertyValue(MESH_VAR).trim() || MESH_FALLBACK;
}

function Icosphere({ still, color }: { still: boolean; color: string }) {
  const group = useRef<Group>(null);
  const geometry = useMemo(() => new IcosahedronGeometry(1, 1), []);

  useFrame((_, delta) => {
    if (!still && group.current) group.current.rotation.y += delta * 0.22;
  });

  return (
    <group ref={group} rotation={[0.42, 0, 0]}>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={color} wireframe side={DoubleSide} transparent opacity={0.42} depthWrite={false} />
      </mesh>
      <points geometry={geometry}>
        <pointsMaterial color={color} size={0.045} sizeAttenuation transparent opacity={0.95} depthWrite={false} />
      </points>
    </group>
  );
}

export function MeshScene({ still }: { still: boolean }) {
  const color = meshColor();

  return (
    <Canvas
      camera={{ position: [0, 0, 3.4], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      frameloop={still ? "demand" : "always"}
      dpr={[1, 2]}
      resize={{ debounce: 0, scroll: false }}
      style={{ width: "100%", height: "100%" }}
    >
      <Icosphere still={still} color={color} />
    </Canvas>
  );
}
