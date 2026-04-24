import { createGlobalStyle } from "styled-components";

/**
 * App-wide resets and base typography. Keeps globals.css minimal (fonts only).
 */
export const GlobalStyles = createGlobalStyle`
  html {
    height: 100%;
  }

  body {
    min-height: 100%;
    margin: 0;
    font-family: ${({ theme }) => theme.font.sans};
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};
    -webkit-font-smoothing: antialiased;
    transition: background 0.25s ease, color 0.25s ease;
    --muted-price: ${({ theme }) => theme.colors.textMuted};
    --promo-bg: ${({ theme }) => theme.colors.text};
    --promo-text: ${({ theme }) => theme.colors.background};
    letter-spacing: 0.01em;
  }

  * {
    box-sizing: border-box;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: ${({ theme }) => theme.font.display};
    letter-spacing: 0.015em;
    line-height: 1.12;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.accent};
  }

  button {
    font-family: inherit;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;
