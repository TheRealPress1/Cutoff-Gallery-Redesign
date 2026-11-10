import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe2, Menu, X } from "lucide-react";
import Instagram from "./InstagramIcon.jsx";
import { useLanguage } from "../i18n.jsx";
import GalleryLogo from "./GalleryLogo.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import "./site-header.css";

export default function SiteHeader({ view, onNavigate, onInquire, immersive = false }) {
  const { language, setLanguage, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const languageRef = useRef(null);
  const languageButtonRef = useRef(null);
  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const indicatorReadyRef = useRef(false);
  const current = view === "home" ? "collection" : view;

  useEffect(() => {
    setMenuOpen(false);
    setLanguageOpen(false);
  }, [view, immersive]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!languageRef.current?.contains(event.target)) setLanguageOpen(false);
      if (!headerRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (languageOpen) {
        event.preventDefault();
        setLanguageOpen(false);
        languageButtonRef.current?.focus();
      } else if (menuOpen) {
        event.preventDefault();
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [languageOpen, menuOpen]);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    let frame;
    const update = () => {
      const active = nav.querySelector('[aria-current="page"]');
      if (!active || !nav.offsetWidth) {
        indicator.style.visibility = "hidden";
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      if (!indicatorReadyRef.current) indicator.style.transition = "none";
      indicator.style.width = `${activeRect.width}px`;
      indicator.style.transform = `translate3d(${activeRect.left - navRect.left}px, ${activeRect.bottom - navRect.top - 5}px, 0)`;
      indicator.style.visibility = "visible";
      if (!indicatorReadyRef.current) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          indicator.style.removeProperty("transition");
          indicatorReadyRef.current = true;
        });
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    nav.querySelectorAll("a, button").forEach((item) => observer.observe(item));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [current, language, menuOpen]);

  const navigate = (event, nextView) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setMenuOpen(false);
    setLanguageOpen(false);
    onNavigate(nextView);
  };

  return (
    <header ref={headerRef} className={`site-header original-header${menuOpen ? " is-menu-open" : ""}`} inert={immersive} aria-hidden={immersive || undefined}>
      <div className="original-header-inner">
        <a className="original-brand" href="#/" onClick={(event) => navigate(event, "home")} aria-label={t("Cut Off Gallery — Accueil", "Cut Off Gallery — Home")}>
          <GalleryLogo />
        </a>
        <button ref={menuButtonRef} className="original-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="original-header-panel" aria-label={menuOpen ? t("Fermer le menu", "Close menu") : t("Ouvrir le menu", "Open menu")} onClick={() => { setMenuOpen(!menuOpen); setLanguageOpen(false); }}>
          {menuOpen ? <X size={25} strokeWidth={1.4} /> : <Menu size={25} strokeWidth={1.4} />}
        </button>
        <div className="original-header-panel" id="original-header-panel">
          <nav ref={navRef} className="original-navigation" aria-label={t("Navigation principale", "Main navigation")}>
            <span ref={indicatorRef} className="original-nav-indicator" aria-hidden="true" />
            <a className="original-nav-link" href="#/collection" aria-current={current === "collection" ? "page" : undefined} onClick={(event) => navigate(event, "collection")}>Collection</a>
            <a className="original-nav-link" href="#/gallery" aria-current={current === "gallery" ? "page" : undefined} onClick={(event) => navigate(event, "gallery")}>{t("Galerie", "Gallery")}</a>
            <a className="original-nav-link" href="#/about" aria-current={current === "about" ? "page" : undefined} onClick={(event) => navigate(event, "about")}>About</a>
            <button className="original-nav-link" type="button" onClick={() => { setMenuOpen(false); setLanguageOpen(false); onInquire(); }}>Contact</button>
          </nav>
          <div className="original-header-actions">
            <a className="original-social-link" href="https://www.instagram.com/cutoff.gallery.art" target="_blank" rel="noopener noreferrer" aria-label={t("Cut Off Gallery sur Instagram (nouvel onglet)", "Cut Off Gallery on Instagram (new tab)")}>
              <Instagram size={21} strokeWidth={1.65} />
            </a>
            <ThemeToggle />
            <div ref={languageRef} className="original-language">
              <button ref={languageButtonRef} type="button" className="original-language-toggle" aria-expanded={languageOpen} aria-controls="original-language-options" aria-label={t("Choisir la langue. Français sélectionné", "Choose language. English selected")} onClick={() => setLanguageOpen(!languageOpen)}>
                <Globe2 size={20} strokeWidth={1.35} aria-hidden="true" />
                <span>{language === "fr" ? "Français" : "English"}</span>
                <ChevronDown size={13} strokeWidth={1.5} className="original-language-chevron" aria-hidden="true" />
              </button>
              {languageOpen && (
                <div className="original-language-options" id="original-language-options" role="group" aria-label={t("Langue du site", "Site language")}>
                  {[["fr", "Français"], ["en", "English"]].map(([code, label]) => (
                    <button key={code} type="button" lang={code} aria-pressed={language === code} onClick={() => { setLanguage(code); setLanguageOpen(false); languageButtonRef.current?.focus(); }}>
                      <span>{label}</span>{language === code && <Check size={15} strokeWidth={1.5} aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
