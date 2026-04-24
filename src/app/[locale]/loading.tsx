"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function Loading() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <p style={{ color: "inherit", padding: "24px 0" }}>
        …
      </p>
    );
  }

  return (
    <motion.p
      style={{ color: "inherit", padding: "24px 0" }}
      animate={{ opacity: [0.35, 1, 0.35] }}
      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
    >
      …
    </motion.p>
  );
}
