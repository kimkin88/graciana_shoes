import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  width?: "narrow" | "default" | "wide" | "full";
  pad?: boolean;
};

const MAX = {
  narrow: 720,
  default: 1240,
  wide: 1440,
  full: undefined,
} as const;

export function PageShell({ children, width = "default", pad = true }: Props) {
  return (
    <div
      className="page-shell"
      style={{
        width: "100%",
        maxWidth: MAX[width],
        margin: "0 auto",
        paddingTop: pad ? 28 : 0,
        paddingBottom: pad ? 72 : 0,
        paddingLeft: pad ? "clamp(14px, 4vw, 40px)" : 0,
        paddingRight: pad ? "var(--page-shell-pad-right, clamp(14px, 4vw, 40px))" : 0,
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}
