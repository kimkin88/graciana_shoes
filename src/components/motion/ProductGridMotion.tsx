"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Locale } from "@/i18n/config";
import type { ProductRow } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";

type Props = {
  products: ProductRow[];
  locale: Locale;
  /** `minmax` column width in px */
  minColumnPx?: number;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.045, delayChildren: 0.02 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/** Staggered grid entrance + light hover lift on product tiles. */
export function ProductGridMotion({
  products,
  locale,
  minColumnPx = 220,
}: Props) {
  const reduceMotion = useReducedMotion();

  const gridStyle = {
    display: "grid" as const,
    gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnPx}px, 1fr))`,
    gap: 16,
  };

  if (reduceMotion) {
    return (
      <div style={gridStyle}>
        {products.map((p) => (
          <div key={p.id} style={{ height: "100%" }}>
            <ProductCard product={p} locale={locale} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={gridStyle}
    >
      {products.map((p) => (
        <motion.div
          key={p.id}
          variants={item}
          layout
          whileHover={{ y: -3, transition: { duration: 0.16, ease: "easeOut" } }}
          style={{ height: "100%" }}
        >
          <ProductCard product={p} locale={locale} />
        </motion.div>
      ))}
    </motion.div>
  );
}
