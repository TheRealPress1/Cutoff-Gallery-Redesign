import { useEffect, useId, useRef, useState } from "react";
import { Globe2 } from "lucide-react";
import { useLanguage } from "../i18n.jsx";
import "./language-toggle.css";

function Flag({ language }) {
  if (language === "fr") {
    return (
      <svg className="language-toggle-flag" viewBox="0 0 30 20" aria-hidden="true">
        <path fill="#002395" d="M0 0h10v20H0z" />
        <path fill="#fff" d="M10 0h10v20H10z" />
        <path fill="#ed2939" d="M20 0h10v20H20z" />
      </svg>
    );
  }

  return (
    <svg className="language-toggle-flag" viewBox="0 0 38 20" aria-hidden="true">
      <path fill="#fff" d="M0 0h38v20H0z" />
      {Array.from({ length: 7 }, (_, row) => (
        <rect key={`stripe-${row}`} x="0" y={row * 40 / 13} width="38" height={20 / 13} fill="#b22234" />
      ))}
      <path fill="#3c3b6e" d="M0 0h15.2v10.77H0z" />
      {Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: row % 2 ? 5 : 6 }, (_, column) => {
          const x = (column + (row % 2 ? 1 : 0.5)) * 15.2 / 6;
          const y = (row + 1) * 10.77 / 10;
          return <path key={`star-${row}-${column}`} fill="#fff" d="M0-.6 .14-.19 .57-.19 .22.07 .35.48 0 .23-.35.48-.22.07-.57-.19-.14-.19Z" transform={`translate(${x} ${y})`} />;
        }),
      )}
    </svg>
  );
}

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  const [transition, setTransition] = useState(null);
  const timer = useRef(null);
  const sequence = useRef(0);
  const descriptionId = useId();

  useEffect(() => () => clearTimeout(timer.current), []);

  const toggle = () => {
    clearTimeout(timer.current);
    const nextLanguage = language === "fr" ? "en" : "fr";
    setLanguage(nextLanguage);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTransition(null);
      return;
    }
    setTransition({ id: ++sequence.current, from: language, to: nextLanguage });
    timer.current = setTimeout(() => setTransition(null), 600);
  };
  const action = t("Passer en anglais", "Switch to French");

  return (
    <div className="language-toggle">
      <button type="button" onClick={toggle} aria-label={action} aria-describedby={descriptionId} title={action}>
        <span key={transition?.id ?? "rest"} className={`language-toggle-stage${transition ? " is-switching" : ""}`} aria-hidden="true">
          {transition ? (
            <>
              <span className="language-toggle-outgoing"><Flag language={transition.from} /></span>
              <span className="language-toggle-globe"><Globe2 size={23} strokeWidth={1.35} /></span>
              <span className="language-toggle-incoming"><Flag language={transition.to} /></span>
            </>
          ) : <Flag language={language} />}
        </span>
      </button>
      <span className="language-toggle-description" id={descriptionId}>
        {t("Langue actuelle : français", "Current language: English")}
      </span>
    </div>
  );
}
