import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
// Older releases saved dark automatically; give the new landing its light
// default once, then preserve every subsequent choice on this versioned key.
const preferenceKey = "cutoff-gallery-theme-v2";

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content", theme === "light" ? "#ffffff" : "#101214",
  );
}

// Set the saved palette before mounting, including on direct profile links.
export function initializeTheme() {
  let theme = "light";
  try {
    if (localStorage.getItem(preferenceKey) === "dark") theme = "dark";
  } catch {
    // Browsers with storage disabled still keep the choice during this visit.
  }
  applyTheme(theme);
  return theme;
}

export function ThemeProvider({ children, initialTheme = "light" }) {
  const [theme, setTheme] = useState(initialTheme);
  const toggleTheme = useCallback(() => {
    setTheme((current) => current === "dark" ? "light" : "dark");
  }, []);

  useLayoutEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(preferenceKey, theme);
    } catch {
      // Persistence is optional; theme switching itself is always available.
    }
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
