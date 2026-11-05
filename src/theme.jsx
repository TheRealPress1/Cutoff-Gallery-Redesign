import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const preferenceKey = "cutoff-gallery-theme";

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content", theme === "light" ? "#eee9df" : "#101214",
  );
}

// Set the saved palette before mounting, including on direct profile links.
export function initializeTheme() {
  let theme = "dark";
  try {
    if (localStorage.getItem(preferenceKey) === "light") theme = "light";
  } catch {
    // Browsers with storage disabled still keep the choice during this visit.
  }
  applyTheme(theme);
  return theme;
}

export function ThemeProvider({ children, initialTheme = "dark" }) {
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
