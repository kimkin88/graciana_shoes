"use client";

import { Slot } from "@radix-ui/react-slot";
import styled from "styled-components";

const Root = styled.article`
  display: grid;
  min-width: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const Media = styled.div`
  position: relative;
  background: color-mix(in srgb, ${({ theme }) => theme.colors.text} 5%, ${({ theme }) => theme.colors.surface});
  overflow: hidden;
`;

const Body = styled.div`
  padding: 16px;
`;

type CardProps = React.ComponentPropsWithoutRef<"article"> & {
  asChild?: boolean;
  $plain?: boolean;
};

const PlainRoot = styled.article`
  display: grid;
  height: 100%;
  min-width: 0;
  grid-template-rows: auto 1fr;
  background: transparent;
  overflow: hidden;
  border: 0;
`;

/** Radix Slot-based card. Use `$plain` for borderless product tiles. */
export function Card({ asChild, $plain, ...props }: CardProps) {
  if (asChild) return <Slot {...props} />;
  const Comp = $plain ? PlainRoot : Root;
  return <Comp {...props} />;
}

export const CardMedia = Media;
export const CardBody = Body;
