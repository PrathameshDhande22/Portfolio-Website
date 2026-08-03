"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";

const MeshScene = dynamic(() => import("./mesh-scene").then((module) => module.MeshScene), {
  ssr: false,
});

export function MeshSphere() {
  const still = useReducedMotion() ?? false;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 left-auto z-0 h-full w-[44%] mask-[linear-gradient(90deg,#000_66%,#0000_100%)]"
    >
      <MeshScene still={still} />
    </div>
  );
}
