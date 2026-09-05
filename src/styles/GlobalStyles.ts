import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  html {
    height: 100%;
    --header-h: 72px;
    overflow: hidden;
  }

  @media (min-width: 900px) {
    html {
      --header-h: 156px;
    }
  }

  @media (min-width: 1024px) {
    html {
      --header-h: 168px;
    }
  }

  body {
    height: 100%;
    min-height: 100%;
    margin: 0;
    overflow: hidden;
    font-family: ${({ theme }) => theme.font.sans};
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    transition:
      background-color 0.55s cubic-bezier(0.22, 1, 0.36, 1),
      color 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    --muted-price: ${({ theme }) => theme.colors.textMuted};
    --promo-bg: ${({ theme }) => theme.colors.text};
    --promo-text: ${({ theme }) => theme.colors.background};
    --page-heading: ${({ theme }) => theme.colors.text};
    --page-text: ${({ theme }) => theme.colors.text};
    --page-text-muted: ${({ theme }) => theme.colors.textMuted};
    --footer-bg: #0a0a0a;
    --footer-border: rgb(246 243 238 / 12%);
    --footer-text: #f6f3ee;
    --footer-muted: rgb(246 243 238 / 68%);
    --footer-heading: #ffffff;
    --link-hover: ${({ theme }) => theme.colors.textMuted};
    letter-spacing: 0.01em;
  }

  * {
    box-sizing: border-box;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  img,
  video {
    max-width: 100%;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: ${({ theme }) => theme.font.display};
    letter-spacing: 0.02em;
    line-height: 1.08;
    font-weight: 500;
    color: var(--page-heading);
  }

  p,
  li {
    color: var(--page-text);
    line-height: 1.65;
  }

  small {
    color: var(--page-text-muted);
  }

  ::selection {
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.background};
  }

  @keyframes graciana-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
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

  @media (min-width: 900px) {
    html {
      --page-shell-pad-right: max(clamp(14px, 4vw, 40px), 72px);
    }
    .home-rest {
      padding-right: max(clamp(16px, 4vw, 40px), 72px);
    }
  }

  .home-first {
    height: calc(100dvh - var(--header-h));
    display: grid;
    grid-template-rows: 1fr auto;
    overflow: hidden;
    background: #111;
  }

  .home-hero-fill {
    display: grid;
    grid-template-columns: 1fr;
    gap: 4px;
    min-height: 0;
    height: 100%;
  }

  .home-hero-fill > :nth-child(n + 2) {
    display: none;
  }

  @media (min-width: 760px) {
    .home-hero-fill {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .home-hero-fill > :nth-child(2) {
      display: block;
    }
    .home-hero-fill > :nth-child(n + 3) {
      display: none;
    }
  }

  @media (min-width: 1100px) {
    .home-hero-fill {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .home-hero-fill > :nth-child(n) {
      display: block;
    }
  }

  .home-hero-panel.home-tile {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    aspect-ratio: auto;
  }

  .home-hrow {
    display: flex;
    gap: 6px;
  }

  .home-hero-strip {
    gap: 4px;
  }

  .home-rest {
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    padding: 8px clamp(16px, 4vw, 40px) 0;
  }

  .home-section {
    padding: 28px 0 12px;
  }

  .home-section-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 12px 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .home-section-head h2,
  .home-section-title {
    margin: 0;
    font-size: clamp(1.55rem, 6vw, 3.6rem);
    line-height: 0.95;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    flex: 1 1 auto;
    min-width: 0;
  }

  .home-section-head a {
    position: relative;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    font-size: 0.78rem;
    white-space: nowrap;
    padding-bottom: 8px;
    color: ${({ theme }) => theme.colors.textMuted};
    transition: color 0.2s ease;
  }

  .home-section-head a::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 4px;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .home-section-head a:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  .home-section-head a:hover::after {
    transform: scaleX(1);
  }

  @media (prefers-reduced-motion: reduce) {
    .home-section-head a,
    .home-section-head a::after {
      transition: none;
    }
  }

  .home-cat-tile.home-tile {
    flex: 0 0 min(38vw, 240px);
    width: min(38vw, 240px);
    aspect-ratio: 3 / 4;
  }

  .home-tile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 180px), 1fr));
    gap: 6px;
  }

  .home-look-tile.home-tile {
    width: 100%;
    aspect-ratio: 3 / 4;
  }

  .home-hero img,
  .home-hero-panel img,
  .home-hero-panel video {
    width: 100%;
    height: 100%;
    max-width: none;
    object-fit: cover;
    object-position: center bottom;
    display: block;
  }

  .home-hero-cta {
    position: absolute;
    left: 16px;
    bottom: 16px;
    color: #fff;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-size: 0.72rem;
    border: 1px solid #fff;
    padding: 10px 16px;
    z-index: 2;
  }

  .home-marquee {
    overflow: hidden;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding: 10px 0;
    background: ${({ theme }) => theme.colors.background};
    transition: background-color 0.55s ease, border-color 0.55s ease;
    flex-shrink: 0;
  }

  .home-marquee-track {
    display: flex;
    width: max-content;
    animation: graciana-marquee 32s linear infinite;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 0.7rem;
  }

  .home-marquee-track span {
    padding: 0 28px;
    white-space: nowrap;
  }

  .home-video-banner {
    display: block;
    position: relative;
    width: 100%;
    height: min(72vh, 760px);
    overflow: hidden;
    background: #111;
  }

  .home-video-banner img,
  .home-video-banner video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    object-fit: cover;
    object-position: center bottom;
    display: block;
  }

  .home-bleed {
    padding: 8px;
  }

  .home-tile {
    position: relative;
    display: block;
    min-width: 0;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    background: #111;
    color: #fff;
  }

  .home-tile-wide {
    aspect-ratio: 16 / 7;
  }

  .home-tile img,
  .home-tile video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  .home-tile video {
    opacity: 1;
  }

  .home-tile-label {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    padding: 36px 12px 14px;
    background: linear-gradient(180deg, transparent 0%, rgb(0 0 0 / 82%) 72%);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-size: clamp(0.95rem, 1.6vw, 1.2rem);
    font-weight: 700;
    color: #fff;
    text-shadow: 0 1px 2px rgb(0 0 0 / 40%);
  }

  .home-news {
    width: 100%;
    margin: 20px 0 0;
    padding: 28px clamp(16px, 4vw, 40px);
    background: #111111;
    color: #f6f3ee;
    text-align: center;
    display: grid;
    gap: 12px;
    justify-items: center;
    border-top: 1px solid rgb(246 243 238 / 10%);
    border-bottom: 1px solid rgb(246 243 238 / 8%);
    box-sizing: border-box;
  }

  .home-news h2 {
    margin: 0;
    color: #f6f3ee;
    font-size: clamp(1.25rem, 2.6vw, 1.75rem);
    max-width: 28ch;
    line-height: 1.25;
  }

  .home-news a {
    border: 1px solid #f6f3ee;
    padding: 10px 18px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    font-size: 0.68rem;
    color: #f6f3ee;
    background: transparent;
    transition: background 0.2s ease, color 0.2s ease, transform 0.18s ease;
  }

  .home-news a:hover {
    background: #f6f3ee;
    color: #111;
    transform: translateY(-1px);
  }

  @media (prefers-reduced-motion: reduce) {
    .home-news a {
      transition: background 0.2s ease, color 0.2s ease;
    }
    .home-news a:hover {
      transform: none;
    }
  }

  @media (max-width: 760px) {
    .home-first {
      height: auto;
      min-height: calc(100dvh - var(--header-h));
      max-height: none;
    }
    .home-hero-fill {
      min-height: min(68dvh, 520px);
    }
    .home-cat-tile.home-tile {
      flex: 0 0 58vw;
      width: 58vw;
    }
    .home-video-banner {
      height: min(56vh, 520px);
    }
    .home-tile-wide {
      aspect-ratio: 16 / 10;
    }
    .home-tile-label {
      font-size: 0.72rem;
      padding: 24px 8px 10px;
      letter-spacing: 0.08em;
    }
    .home-section {
      padding: 22px 0 8px;
    }
    .home-rest {
      padding: 8px 14px 0;
    }
    .home-section-head a {
      font-size: 0.7rem;
      letter-spacing: 0.12em;
    }
  }

  @media (min-width: 761px) and (max-width: 1099px) {
    .home-hero-fill {
      min-height: min(62dvh, 640px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .home-marquee-track {
      animation: none;
    }
  }
`;
