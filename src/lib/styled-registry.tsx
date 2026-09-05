"use client";

/**
 * Collects styled-components CSS on the server and injects it into the HTML stream
 * so the first paint matches client hydration (no FOUC).
 * @see https://nextjs.org/docs/app/building-your-application/css-in-js#styled-components
 */
import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import isPropValid from "@emotion/is-prop-valid";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

/**
 * Filter props that must not hit the DOM.
 * - `$…` transient props (styled-components convention)
 * - known non-DOM noise like `override`
 * - for native tags, only valid HTML attrs
 */
function shouldForwardProp(propName: string, target?: unknown) {
  if (propName.startsWith("$")) return false;
  if (propName === "override") return false;
  if (typeof target === "string") {
    return isPropValid(propName);
  }
  return true;
}

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    // Internal API: clears collected rules between streaming chunks / requests.
    const sheet = styledComponentsStyleSheet.instance as unknown as {
      clearTag?: () => void;
    };
    sheet.clearTag?.();
    return <>{styles}</>;
  });

  if (typeof window !== "undefined") {
    return <StyleSheetManager shouldForwardProp={shouldForwardProp}>{children}</StyleSheetManager>;
  }

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance} shouldForwardProp={shouldForwardProp}>
      {children}
    </StyleSheetManager>
  );
}
