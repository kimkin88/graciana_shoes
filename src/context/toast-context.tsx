"use client";

import * as Toast from "@radix-ui/react-toast";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components";

export type ToastInput = {
  title: string;
  description?: string;
  variant?: "default" | "error";
};

type ToastItem = ToastInput & { id: number };

const ToastRoot = styled(Toast.Root)<{ $error?: boolean }>`
  position: relative;
  background: ${({ theme, $error }) =>
    $error ? "#fef2f2" : theme.colors.surface};
  border: 1px solid
    ${({ theme, $error }) => ($error ? "#fecaca" : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.space.md};
`;

const ToastTitle = styled(Toast.Title)`
  font-weight: 600;
  font-size: 0.95rem;
  margin: 0 0 4px;
`;

const ToastDescription = styled(Toast.Description)`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ToastClose = styled(Toast.Close)`
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Viewport = styled(Toast.Viewport)`
  position: fixed;
  bottom: ${({ theme }) => theme.space.lg};
  right: ${({ theme }) => theme.space.lg};
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};
  width: min(360px, calc(100vw - 32px));
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ToastCtx = createContext<(t: ToastInput) => void>(() => {});

/** Radix toasts + imperative `useToast()` for cart/checkout errors. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const push = useCallback((t: ToastInput) => {
    const id = ++seq.current;
    setItems((prev) => [...prev, { id, ...t }]);
  }, []);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <Toast.Provider duration={5000} swipeDirection="right">
      <ToastCtx.Provider value={value}>{children}</ToastCtx.Provider>
      {items.map((t) => (
        <ToastRoot
          key={t.id}
          $error={t.variant === "error"}
          defaultOpen
          onOpenChange={(open) => {
            if (!open) remove(t.id);
          }}
        >
          <ToastTitle>{t.title}</ToastTitle>
          {t.description ? (
            <ToastDescription>{t.description}</ToastDescription>
          ) : null}
          <ToastClose aria-label="Close">×</ToastClose>
        </ToastRoot>
      ))}
      <Viewport />
    </Toast.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
