"use client";

/**
 * Collects styled-components CSS on the server and injects it into the HTML stream
 * so the first paint matches client hydration (no FOUC).
 * @see https://nextjs.org/docs/app/building-your-application/css-in-js#styled-components
 */
import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

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
    return <>{children}</>;
  }

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}
