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
  }

  * {
    box-sizing: border-box;
  }

  a {
    color: inherit;
    text-decoration: none;
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
