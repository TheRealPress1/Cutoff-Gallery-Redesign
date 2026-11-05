import { Moon, Sun } from "lucide-react";
import { useLanguage } from "../i18n.jsx";
import "./theme-toggle.css";

export default function ThemeToggle({ theme = "dark", onToggle }) {
  const { t } = useLanguage();
  const light = theme === "light";
  const action = light
    ? t("Voir les photographies sur fond sombre", "View photographs against dark walls")
    : t("Voir les photographies sur fond crème", "View photographs against cream walls");

  return (
    <button className={`theme-toggle${light ? " is-light" : ""}`} type="button" onClick={onToggle} aria-label={action} aria-pressed={light} title={action}>
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
