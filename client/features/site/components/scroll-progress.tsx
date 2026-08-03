"use client";

import { motion, useScroll } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: scrollYProgress }}
      className="pointer-events-none fixed top-0 left-0 z-70 h-0.5 w-full origin-left bg-accent"
    />
  );
}
