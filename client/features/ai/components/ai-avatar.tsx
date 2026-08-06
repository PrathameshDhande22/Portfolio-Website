"use client";

import { motion, useReducedMotion } from "motion/react";
import { LuSparkles } from "react-icons/lu";

const RINGS = [0, 1, 2];
const ORBITS = [
  { size: 6, radius: 40, duration: 7 },
  { size: 4, radius: 52, duration: 10 },
];

export function AiAvatar() {
  const still = useReducedMotion() ?? false;

  return (
    <div aria-hidden className="relative mx-auto mb-6 grid size-28 place-items-center">
      {still
        ? null
        : RINGS.map((ring) => (
            <motion.span
              key={ring}
              className="absolute size-14 rounded-full border border-accent"
              initial={{ scale: 0.7, opacity: 0.45 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2.8, repeat: Infinity, delay: ring * 0.9, ease: "easeOut" }}
            />
          ))}

      {still
        ? null
        : ORBITS.map((orbit) => (
            <motion.span
              key={orbit.radius}
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: orbit.duration, repeat: Infinity, ease: "linear" }}
            >
              <span
                className="absolute top-1/2 left-1/2 rounded-full bg-accent"
                style={{
                  width: orbit.size,
                  height: orbit.size,
                  transform: `translate(-50%, -50%) translateX(${orbit.radius}px)`,
                }}
              />
            </motion.span>
          ))}

      <motion.span
        className="grid size-14 place-items-center rounded-full bg-accent text-accent-ink shadow-[0_10px_30px_-12px_var(--accent)]"
        initial={still ? false : { scale: 0.6, opacity: 0 }}
        animate={still ? {} : { scale: [1, 1.06, 1], opacity: 1 }}
        transition={
          still ? {} : { scale: { duration: 2.8, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.4 } }
        }
      >
        <LuSparkles className="size-6" />
      </motion.span>
    </div>
  );
}
