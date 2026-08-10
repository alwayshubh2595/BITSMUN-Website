import React, { useEffect, useState } from "react";
import styles from "../styles/ThemeToggle.module.scss";
import { DARK, LIGHT, getInitialTheme, applyTheme, storeTheme } from "../utils/theme.js";

const ThemeToggle = ({ className = "" }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = () => {
    const next = theme === DARK ? LIGHT : DARK;
    setTheme(next);
    storeTheme(next);
  };

  const goingToLight = theme === DARK;

  return (
    <button
      type="button"
      onClick={toggle}
      className={`${styles.toggle} ${className}`}
      // The control is icon-only, so it needs an accessible name, and the name
      // should describe the action rather than the current state.
      aria-label={goingToLight ? "Switch to light theme" : "Switch to dark theme"}
      title={goingToLight ? "Switch to light theme" : "Switch to dark theme"}
    >
      <i
        className={goingToLight ? "fa-solid fa-sun" : "fa-solid fa-moon"}
        aria-hidden="true"
      ></i>
    </button>
  );
};

export default ThemeToggle;
