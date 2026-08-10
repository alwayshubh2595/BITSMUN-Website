// Theme handling. Dark is the default: with no stored preference the site
// renders dark, regardless of the OS setting. A visitor's explicit choice is
// remembered in localStorage and wins from then on.
//
// The initial value is also applied by an inline script in index.html, before
// first paint, so the page never flashes the wrong theme.

export const THEME_KEY = "bitsmun:theme";
export const DARK = "dark";
export const LIGHT = "light";

export const getStoredTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === LIGHT || stored === DARK ? stored : null;
  } catch {
    // Storage can throw in private browsing.
    return null;
  }
};

export const getInitialTheme = () => getStoredTheme() ?? DARK;

export const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === LIGHT) {
    root.setAttribute("data-theme", LIGHT);
  } else {
    // Dark is the token default on :root, so it needs no attribute.
    root.removeAttribute("data-theme");
  }
  // Keep the browser chrome (mobile address bar) in step with the page.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === LIGHT ? "#f6f8fb" : "#0e1018");
};

export const storeTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* no-op */
  }
};
