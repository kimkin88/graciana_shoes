"use client";

import { motion, useReducedMotion } from "framer-motion";
import styled from "styled-components";
import type { Locale } from "@/i18n/config";
import type { ProductRow } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";

const gridCss = `
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 10px;
  width: 100%;
  @media (min-width: 900px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 26px 18px;
  }
  @media (min-width: 1100px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 28px 20px;
  }
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 32px 24px;
  }
`;

const Grid = styled.div`
  ${gridCss}
`;

const MotionGrid = styled(motion.div)`
  ${gridCss}
`;

const Cell = styled.div`
  min-width: 0;
`;

const MotionCell = styled(motion.div)`
  min-width: 0;
`;

type CardDict = {
  addToCart: string;
  outOfStock: string;
  sale?: string;
  newIn?: string;
  addedToCart?: string;
  favorite?: string;
  unfavorite?: string;
  inCart?: string;
};

type Props = {
  products: ProductRow[];
  locale: Locale;
  loud?: boolean;
  cardDict?: CardDict;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.03 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function ProductGridMotion({ products, locale, loud, cardDict }: Props) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <Grid>
        {products.map((p) => (
          <Cell key={p.id}>
            <ProductCard product={p} locale={locale} loud={loud} dict={cardDict} />
          </Cell>
        ))}
      </Grid>
    );
  }

  return (
    <MotionGrid variants={container} initial="hidden" animate="show">
      {products.map((p) => (
        <MotionCell key={p.id} variants={item}>
          <ProductCard product={p} locale={locale} loud={loud} dict={cardDict} />
        </MotionCell>
      ))}
    </MotionGrid>
  );
}
