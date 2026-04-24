"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/cart-context";

type Props = {
  productId: string;
  disabled?: boolean;
  label: string;
  outLabel: string;
};

export function AddToCartButton({
  productId,
  disabled,
  label,
  outLabel,
}: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        addToCart(productId, 1);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
    >
      {disabled ? outLabel : added ? "✓" : label}
    </Button>
  );
}
