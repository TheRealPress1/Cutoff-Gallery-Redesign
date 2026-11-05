import { Moon, Sun } from "lucide-react";
import { useLanguage } from "../i18n.jsx";
import { useTheme } from "../theme.jsx";
import "./theme-toggle.css";

export default function ThemeToggle() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const light = theme === "light";
  const action = light
    ? t("Passer en mode sombre", "Switch to dark mode")
    : t("Passer en mode clair", "Switch to light mode");

  return (
    <button className={`theme-toggle${light ? " is-light" : ""}`} type="button" onClick={toggleTheme} aria-label={action} aria-pressed={light} title={action}>
      <span className="theme-toggle-sky" aria-hidden="true">
        <span className={`theme-toggle-icon theme-toggle-moon${!light ? " is-current" : ""}`}>
          <Moon size={21} strokeWidth={1.45} />
        </span>
        <span className={`theme-toggle-icon theme-toggle-sun${light ? " is-current" : ""}`}>
          <Sun size={21} strokeWidth={1.45} />
        </span>
        <span className="theme-toggle-horizon" />
      </span>
    </button>
  );
}
