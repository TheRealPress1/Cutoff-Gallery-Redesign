import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Instagram from "./InstagramIcon.jsx";
import { useLanguage } from "../i18n.jsx";
import "./home-page.css";

const collectionOrder = [0, 2, 3, 5, 1, 4];
const slideOrder = [0, 2, null, 1, 4];

export default function HomePage({ artworks, onOpenArtwork, onAbout, onInquire, onGallery, reducedMotion }) {
  const { t } = useLanguage();
  const [slide, setSlide] = useState(0);
  const [previousSlide, setPreviousSlide] = useState(null);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const changing = useRef(false);
  const transitionTimer = useRef(null);
  const slides = slideOrder.map((artworkIndex) => artworkIndex === null
    ? { image: "/home/justice.jpg", title: "Justice, Paris Paris, 2005 — Marco Dos Santos", artworkIndex }
    : { ...artworks[artworkIndex], artworkIndex });
  const moveSlide = useCallback((step) => {
    if (changing.current) return;
    setDirection(step);
    setPreviousSlide(reducedMotion ? null : slide);
    setSlide((slide + step + slideOrder.length) % slideOrder.length);
    if (!reducedMotion) {
      changing.current = true;
      transitionTimer.current = setTimeout(() => {
        changing.current = false;
        setPreviousSlide(null);
      }, 650);
    }
  }, [slide, reducedMotion]);

  useEffect(() => () => clearTimeout(transitionTimer.current), []);
  useEffect(() => {
    if (paused || hovered || focusWithin || reducedMotion) return;
    const timer = setInterval(() => {
      if (!document.hidden) moveSlide(1);
    }, 5500);
    return () => clearInterval(timer);
  }, [slide, paused, hovered, focusWithin, reducedMotion, moveSlide]);

  const touchStart = useRef(null);
  const suppressClickUntil = useRef(0);
  const marquee = t("PORTRAITS RARES D’ARTISTES", "RARE ARTIST PORTRAITS");
  const edition = t("ÉDITION LIMITÉE", "LIMITED EDITION");

  return (
    <div className="home-page">
      <h1 className="home-sr-only">Cut Off Gallery — {t("Photographies rares des scènes rap et électronique", "Rare photography from the rap and electronic music scenes")}</h1>
      <section
        className={`home-hero${direction < 0 ? " is-reversing" : ""}`}
        aria-roledescription={t("diaporama", "carousel")}
        aria-label={t("Photographies à la une", "Featured photographs")}
        tabIndex={0}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocusWithin(true)}
        onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false); }}
        onTouchStart={(event) => {
          suppressClickUntil.current = 0;
          touchStart.current = event.touches.length === 1
            ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
            : null;
        }}
        onTouchMove={(event) => {
          if (event.touches.length !== 1) touchStart.current = null;
        }}
        onTouchCancel={() => { touchStart.current = null; }}
        onTouchEnd={(event) => {
          if (!touchStart.current || !event.changedTouches[0]) return;
          const dx = event.changedTouches[0].clientX - touchStart.current.x;
          const dy = event.changedTouches[0].clientY - touchStart.current.y;
          touchStart.current = null;
          if (Math.abs(dx) > 10 || Math.abs(dy) > 10) suppressClickUntil.current = Date.now() + 700;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) moveSlide(dx < 0 ? 1 : -1);
        }}
        onClickCapture={(event) => {
          if (event.detail && Date.now() < suppressClickUntil.current) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            event.currentTarget.focus({ preventScroll: true });
            moveSlide(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        {slides.map((photo, index) => {
          const active = index === slide;
          const previous = index === previousSlide;
          return (
            <div
              key={photo.image}
              className={`home-slide${active ? " is-active" : ""}${previous ? " is-previous" : ""}${previousSlide !== null ? " is-moving" : ""}`}
              aria-hidden={!active}
              role="group"
              aria-roledescription={t("diapositive", "slide")}
              aria-label={`${index + 1} / ${slides.length}`}
            >
              {photo.artworkIndex !== null ? (
                <button
                  type="button"
                  tabIndex={active ? 0 : -1}
                  aria-label={t(`Découvrir ${photo.artist}`, `Discover ${photo.artist}`)}
                  onClick={() => { if (!changing.current) onOpenArtwork(photo.artworkIndex); }}
                >
                  <img src={photo.image} alt={photo.title} fetchPriority={index === 0 ? "high" : "low"} decoding="async" draggable="false" />
                </button>
              ) : <img src={photo.image} alt={photo.title} decoding="async" fetchPriority="low" draggable="false" />}
            </div>
          );
        })}
        <button className="home-slide-arrow home-slide-previous" type="button" onClick={() => moveSlide(-1)} aria-label={t("Photographie précédente", "Previous photograph")}><ChevronLeft size={24} strokeWidth={1.25} /></button>
        <button className="home-slide-arrow home-slide-next" type="button" onClick={() => moveSlide(1)} aria-label={t("Photographie suivante", "Next photograph")}><ChevronRight size={24} strokeWidth={1.25} /></button>
        {!reducedMotion && <button className="home-slide-pause" type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? t("Reprendre le diaporama", "Play slideshow") : t("Mettre le diaporama en pause", "Pause slideshow")}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>}
      </section>

      <div className="home-marquee" aria-label={`${marquee} — ${edition}`}>
        <div className="home-marquee-track" aria-hidden="true">
          {[0, 1].map((copy) => <div className="home-marquee-group" key={copy}>{[0, 1, 2].map((item) => <span className="home-marquee-phrase" key={item}>{marquee}<span>｜</span>{edition}<span>｜</span></span>)}</div>)}
        </div>
      </div>

      <section className="home-collection" aria-label={t("La collection", "The collection")}>
        {collectionOrder.map((index) => {
          const photo = artworks[index];
          return <button type="button" className="home-collection-item" onClick={() => onOpenArtwork(index)} key={photo.id}>
            <span className="home-collection-image"><img src={photo.image} alt={photo.title} width={photo.width} height={photo.height} loading="lazy" decoding="async" /></span>
            <span className="home-collection-caption">{photo.id === "mehdi-and-friends" ? "DJ Medhi and friend" : photo.title}, {photo.year}</span>
          </button>;
        })}
      </section>

      <section className="home-introduction" aria-label={t("À propos de Cut Off Gallery", "About Cut Off Gallery")}>
        <p>{t("Espace dédié à la photographie des scènes rap et électronique,", "A space dedicated to photography from the rap and electronic music scenes,")}<br />{t("CutOff Gallery digge dans les archives des auteurs-photographes pour dénicher des clichés rares et puissants, ceux qui méritent d’être figés sur papier pour leur valeur artistique et historique.", "CutOff Gallery digs through photographers’ archives to uncover rare and powerful images, those that deserve to be preserved on paper for their artistic and historical value.")}</p>
        <button type="button" onClick={onAbout}>{t("en savoir plus…", "find out more…")}</button>
      </section>

      <footer className="home-footer">
        <div className="home-footer-main">
          <div className="home-footer-identity">
            <p>Cut Off Gallery</p>
            <div className="home-footer-links">
              <button type="button" onClick={onInquire}>Contact</button>
              <button type="button" onClick={onGallery}>{t("Visiter la galerie", "Visit the gallery")}<ArrowUpRight size={15} strokeWidth={1.25} /></button>
              <a href="https://www.instagram.com/cutoff.gallery.art" target="_blank" rel="noreferrer" aria-label="Cut Off Gallery — Instagram"><Instagram size={23} strokeWidth={1.4} /></a>
            </div>
          </div>
          <div className="home-newsletter">
            <h2>{t("Newsletter — nos futures photos en avant-première", "Newsletter — a first look at our upcoming photographs")}</h2>
            <a href="https://cutoffgallery.art/#block-yui_3_17_2_1_1749551713236_1546" target="_blank" rel="noreferrer">{t("S’inscrire à la newsletter", "Subscribe to the newsletter")}<ArrowUpRight size={19} strokeWidth={1.25} /></a>
          </div>
        </div>
        <div className="home-footer-legal">
          <a href="https://cutoffgallery.art/conditions-generales" target="_blank" rel="noreferrer">{t("Conditions Générales", "Terms & Conditions")}</a>
          <a href="https://cutoffgallery.art/mentions-legales" target="_blank" rel="noreferrer">{t("Mentions Légales", "Legal Notice")}</a>
        </div>
      </footer>
    </div>
  );
}
