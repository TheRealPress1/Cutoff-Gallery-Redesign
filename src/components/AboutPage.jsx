import { useEffect, useRef } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { useLanguage } from "../i18n.jsx";
import { artworks } from "../data/artworks.js";
import { localizeArtwork } from "../data/translations.js";
import "./about-page.css";

export default function AboutPage({ onInquire, onCollection, onGallery }) {
  const { language, t } = useLanguage();
  const heading = useRef(null);
  const photograph = localizeArtwork(artworks[0], language);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  return (
    <article className="about-page" aria-labelledby="about-title">
      <section className="about-hero">
        <div className="about-hero-copy">
          <p className="about-eyebrow"><span aria-hidden="true" />About — Cut Off Gallery</p>
          <h1 id="about-title" ref={heading} tabIndex={-1}>
            <span>{t("Un autre regard", "A different view")}</span>
            <span>{t("sur la musique.", "of music.")}</span>
          </h1>
          <p className="about-introduction">
            {t(
              "CutOff Gallery est un espace dédié à la photographie rare de la scène rap et électronique.",
              "CutOff Gallery is a space dedicated to rare photographs from the rap and electronic music scenes.",
            )}
          </p>
          <button className="about-story-link" onClick={() => {
            const section = document.getElementById("about-approach");
            section?.focus({ preventScroll: true });
            section?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
          }}>
            <span className="about-arrow-circle"><ArrowDown size={17} strokeWidth={1.4} aria-hidden="true" /></span>
            {t("Notre regard", "Our perspective")}
          </button>
        </div>
        <figure className="about-hero-photograph">
          <img src={photograph.image} alt={photograph.title} width={photograph.width} height={photograph.height} fetchPriority="high" decoding="async" />
          <figcaption>
            <span><strong>{photograph.artist}, {photograph.year}</strong><span>{photograph.location}</span></span>
            <span className="about-photo-credit">{photograph.photographer}</span>
          </figcaption>
        </figure>
      </section>

      <section className="about-approach about-section" id="about-approach" tabIndex={-1} aria-labelledby="about-approach-title">
        <div className="about-section-label"><span>01</span>{t("La démarche", "The approach")}</div>
        <div className="about-approach-content">
          <h2 id="about-approach-title">{t("Entre studio de création", "Part creative studio,")}<br />{t("et galerie photo.", "part photography gallery.")}</h2>
          <p className="about-lead">
            {t(
              "CutOff “digge” dans les archives des photographes pour dénicher des clichés rares et puissants, ceux qui méritent d’être figés sur papier pour leur valeur artistique et historique.",
              "CutOff “digs” through photographers’ archives to uncover rare and powerful images, those that deserve to be preserved on paper for their artistic and historical value.",
            )}
          </p>
          <div className="about-story-columns">
            <p>{t(
              "Chaque tirage proposé naît d’une collaboration entre la galerie et le photographe. Les œuvres sélectionnées se doivent de capturer un instant authentique de création où la spontanéité prime sur la mise en scène.",
              "Every print we offer is born of a collaboration between the gallery and the photographer. The selected works must capture an authentic moment of creation, where spontaneity takes precedence over staging.",
            )}</p>
            <p>{t(
              "Notre approche artistique s’inspire du processus créatif du studio de musique : nourrie par l’intuition et la liberté, guidée par l’exigence et la précision, sans aucun compromis sur les détails.",
              "Our artistic approach draws inspiration from the creative process of the music studio: driven by intuition and freedom, guided by exacting standards and precision, without compromising on any detail.",
            )}</p>
          </div>
        </div>
      </section>

      <section className="about-editions about-section" aria-labelledby="about-editions-title">
        <div className="about-section-label"><span>02</span>{t("Les éditions", "The editions")}</div>
        <div className="about-edition-content">
          <div className="about-edition-number" aria-hidden="true">30<span>{t("exemplaires", "prints")}</span></div>
          <div className="about-edition-copy">
            <h2 id="about-editions-title">{t("Un instant.\nUne édition limitée.", "One moment.\nA limited edition.")}</h2>
            <p>{t(
              "Chaque photographie est proposée en édition limitée à 30 exemplaires. Une rencontre entre un regard, une histoire et votre collection.",
              "Each photograph is offered in a limited edition of 30 prints. A meeting of a perspective, a story, and your collection.",
            )}</p>
            <button className="about-text-link" onClick={onCollection}>{t("Découvrir la collection", "Explore the collection")}<ArrowUpRight size={20} strokeWidth={1.4} aria-hidden="true" /></button>
          </div>
        </div>
      </section>

      <footer className="about-footer">
        <div className="about-contact">
          <div><p className="about-eyebrow">{t("Une œuvre, une question, une envie", "A photograph, a question, an idea")}</p><h2>{t("Parlons photographie.", "Let’s talk photography.")}</h2></div>
          <button className="about-contact-button" onClick={() => onInquire(null)}>{t("Nous contacter", "Contact us")}<ArrowUpRight size={23} strokeWidth={1.4} aria-hidden="true" /></button>
        </div>
        <div className="about-colophon"><span>Cut Off Gallery</span><button onClick={onGallery}>{t("Entrer dans la galerie", "Enter the gallery")}<ArrowRight size={16} strokeWidth={1.4} aria-hidden="true" /></button></div>
      </footer>
    </article>
  );
}
