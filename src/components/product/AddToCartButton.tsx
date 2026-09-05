"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";

type Props = {
  productId: string;
  disabled?: boolean;
  label: string;
  outLabel: string;
  addedLabel?: string;
  quantityLabel?: string;
  max?: number;
};

export function AddToCartButton({
  productId,
  disabled,
  label,
  outLabel,
  addedLabel = "✓",
  quantityLabel,
  max = 10,
}: Props) {
  const { addToCart } = useCart();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {!disabled ? (
        <label style={{ display: "grid", gap: 6, maxWidth: 140 }}>
          <span style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {quantityLabel ?? "Qty"}
          </span>
          <input
            type="number"
            min={1}
            max={Math.max(1, max)}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(max, Number(e.target.value) || 1)))}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid var(--page-border, #ddd)",
              background: "transparent",
              color: "inherit",
            }}
          />
        </label>
      ) : null}
      <Button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          addToCart(productId, qty);
          setAdded(true);
          toast({ title: addedLabel === "✓" ? label : addedLabel });
          window.setTimeout(() => setAdded(false), 1200);
        }}
        style={{ minHeight: 48 }}
      >
        {disabled ? outLabel : added ? addedLabel : label}
      </Button>
    </div>
  );
}
