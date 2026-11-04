import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // Each fresh visit begins in French; navigation keeps the current choice.
  const [language, setLanguage] = useState("fr");
  const t = useCallback((fr, en) => language === "fr" ? fr : en, [language]);
  useEffect(() => {
    document.documentElement.lang = language;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t(
      "Des photographies rares. Des musiciens d’exception. Explorez Cut Off Gallery et découvrez des tirages photographiques en édition limitée à 30 exemplaires.",
      "Rare photographs. Extraordinary musicians. Explore the Cut Off Gallery exhibition and discover photographic editions limited to 30.",
    ));
  }, [language, t]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("LanguageProvider is required.");
  return value;
}
