import { useLanguage } from "../i18n.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import LanguageToggle from "./LanguageToggle.jsx";

export default function AppearanceControls({ className = "" }) {
  const { t } = useLanguage();
  return (
    <div className={`appearance-controls ${className}`.trim()} role="group" aria-label={t("Ambiance et langue", "Appearance and language")}>
      <ThemeToggle />
      <LanguageToggle />
    </div>
  );
}
