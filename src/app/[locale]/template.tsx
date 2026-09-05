"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Soft fade between localized routes — no wait/exit blocking (avoids freezes).
 */
export default function LocaleTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div style={{ minHeight: "100%" }}>{children}</div>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{ minHeight: "100%" }}
    >
      {children}
    </motion.div>
  );
}
