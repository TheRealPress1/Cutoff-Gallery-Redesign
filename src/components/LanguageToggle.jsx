import { useLanguage } from "../i18n.jsx";
import "./language-toggle.css";

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div className="language-toggle" role="group" aria-label={t("Langue du site", "Site language")}>
      <button type="button" lang="fr" aria-label="Français" aria-pressed={language === "fr"} onClick={() => setLanguage("fr")}>FR</button>
      <button type="button" lang="en" aria-label="English" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
    </div>
  );
}
