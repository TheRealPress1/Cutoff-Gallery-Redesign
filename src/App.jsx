import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  X,
  Maximize2,
  Minimize2,
  MoveUpRight,
  ScanLine,
} from "lucide-react";
import GalleryScene from "./components/GalleryScene.jsx";
import GalleryLogo from "./components/GalleryLogo.jsx";
import GalleryInspection from "./components/GalleryInspection.jsx";
import PrintViewer from "./components/PrintViewer.jsx";
import PhotographerCredit from "./components/PhotographerCredit.jsx";
import PhotographerProfile from "./components/PhotographerProfile.jsx";
import LanguageToggle from "./components/LanguageToggle.jsx";
import { useLanguage } from "./i18n.jsx";
import { artworks } from "./data/artworks.js";
import InquiryComposer from "./components/InquiryComposer.jsx";
import { photographers } from "./data/photographers.js";
import { localizeArtwork, localizePhotographer } from "./data/translations.js";

const readPhotographerRoute = () => {
  const prefix = "#/photographers/";
  const id = window.location.hash.startsWith(prefix) ? window.location.hash.slice(prefix.length) : null;
  return Object.hasOwn(photographers, id) ? id : null;
};

function Brand({ onClick }) {
  const { t } = useLanguage();
  return (
    <button
      className="brand"
      onClick={onClick}
      aria-label={t("Accueil Cut Off Gallery", "Cut Off Gallery home")}
    >
      <GalleryLogo />
    </button>
  );
}

function Modal({ children, onClose, className = "", label, fullScreen = false }) {
  const { t } = useLanguage();
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const scroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = setTimeout(
      () => (ref.current?.querySelector("[data-autofocus]") ?? ref.current?.querySelector("button, a, input, textarea"))?.focus(),
      0,
    );
    const handler = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const elements = [
          ...ref.current.querySelectorAll(
            'button, a[href], input, textarea, [tabindex="0"]',
          ),
        ].filter((el) => !el.disabled);
        if (!elements.length) return;
        if (e.shiftKey && document.activeElement === elements[0]) {
          e.preventDefault();
          elements.at(-1).focus();
        } else if (!e.shiftKey && document.activeElement === elements.at(-1)) {
          e.preventDefault();
          elements[0].focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      clearTimeout(frame);
      document.body.style.overflow = scroll;
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className={`modal-backdrop ${fullScreen ? "composer-backdrop" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        className={`modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <button
          className="icon-button modal-close"
          onClick={onClose}
          aria-label={t("Fermer la fenêtre", "Close dialog")}
        >
          {fullScreen ? <ArrowLeft size={21} /> : <X size={22} />}
        </button>
        <div className="modal-language"><LanguageToggle /></div>
        {children}
      </section>
    </div>
  );
}

function ArtworkDetail({ artwork, onClose, onInquire, onPhotographer }) {
  const { t } = useLanguage();
  return (
    <Modal onClose={onClose} className="artwork-modal" label={artwork.title}>
      <PrintViewer artwork={artwork} />
      <div className="detail-copy">
        <h2>{artwork.artist}</h2>
        <p className="detail-title">{artwork.title}</p>
        <p className="detail-location">
          {artwork.location}, {artwork.year}
        </p>
        <PhotographerCredit name={artwork.photographer} onOpen={onPhotographer} />
        <p className="detail-description">{artwork.description}</p>
        <dl className="detail-specs">
          <div>
            <dt>{t("Édition", "Edition")}</dt>
            <dd>{t("Limitée à 30 exemplaires", "Limited to 30")}</dd>
          </div>
          <div>
            <dt>{t("Technique", "Medium")}</dt>
            <dd>{artwork.medium}</dd>
          </div>
          <div>
            <dt>{t("Formats", "Print sizes")}</dt>
            <dd>{artwork.formats.join(" / ")}</dd>
          </div>
          <div>
            <dt>{t("Disponibilité et encadrement", "Availability & framing")}</dt>
            <dd>{t("Sur demande", "On inquiry")}</dd>
          </div>
        </dl>
        <button className="dark-button" onClick={() => onInquire(artwork)}>
          {t("Se renseigner sur cette œuvre", "Inquire about this work")} <ArrowUpRight size={19} />
        </button>
        <p className="detail-footnote">
          {t("Une rencontre, puis un fragment de l’histoire de la musique.", "A conversation, then a piece of music history.")}
        </p>
        <a
          className="source-link"
          href={artwork.originalUrl}
          target="_blank"
          rel="noreferrer"
        >
          {t("Voir la fiche originale", "View the original gallery entry")} <ArrowUpRight size={12} />
        </a>
      </div>
    </Modal>
  );
}

function Inquiry({ artwork, onClose }) {
  const { t } = useLanguage();
  return (
    <Modal onClose={onClose} fullScreen className="inquiry-modal" label={t("Écrire à Cut Off Gallery", "Write to Cut Off Gallery")}>
      <InquiryComposer artwork={artwork} />
    </Modal>
  );
}

function About({ onClose, onInquire }) {
  const { language, t } = useLanguage();
  const storyArtwork = localizeArtwork(artworks[0], language);
  return (
    <Modal onClose={onClose} className="story-modal" label={t("À propos de CutOff Gallery", "About CutOff Gallery")}>
      <div className="story-image">
        <img src={storyArtwork.image} alt={storyArtwork.title} />
      </div>
      <div className="story-copy">
        <h2>
          {t("À propos de CutOff Gallery", "About CutOff Gallery")}
        </h2>
        <p className="story-intro">
          <strong>CutOff Gallery</strong>{" "}
          {t("est un espace dédié à la photographie rare de la scène rap et électronique.", "is a space dedicated to rare photographs from the rap and electronic music scenes.")}
        </p>
        <p>
          {t("Entre studio de création et galerie photo, CutOff “digge” dans les archives des photographes pour dénicher des clichés rares et puissants, ceux qui méritent d’être figés sur papier pour leur valeur artistique et historique.", "Part creative studio, part photography gallery, CutOff “digs” through photographers’ archives to uncover rare and powerful images, those that deserve to be preserved on paper for their artistic and historical value.")}
        </p>
        <p>
          {t("Chaque tirage proposé naît d’une collaboration entre la galerie et le photographe. Les œuvres sélectionnées se doivent de capturer un instant authentique de création où la spontanéité prime sur la mise en scène.", "Every print we offer is born of a collaboration between the gallery and the photographer. The selected works must capture an authentic moment of creation, where spontaneity takes precedence over staging.")}
        </p>
        <p>
          {t("Notre approche artistique s’inspire du processus créatif du studio de musique : nourrie par l’intuition et liberté, guidée par l’exigence et la précision, sans aucun compromis sur les détails.", "Our artistic approach draws inspiration from the creative process of the music studio: driven by intuition and freedom, guided by exacting standards and precision, without compromising on any detail.")}
        </p>
        <button className="dark-button" onClick={() => onInquire(null)}>
          {t("Nous contacter", "Contact us")} <ArrowUpRight size={18} />
        </button>
      </div>
    </Modal>
  );
}

export default function App() {
  const { language, t } = useLanguage();
  const localizedArtworks = useMemo(() => artworks.map((artwork) => localizeArtwork(artwork, language)), [language]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewedIndex, setViewedIndex] = useState(0);
  const [navigationId, setNavigationId] = useState(0);
  const [view, setView] = useState("gallery");
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [approaching, setApproaching] = useState(false);
  const approachTimer = useRef(null);
  const museumLabel = useRef(null);
  const [modal, setModal] = useState(null);
  const [photographerId, setPhotographerId] = useState(readPhotographerRoute);
  const photographer = localizePhotographer(photographers[photographerId], language);
  const profileRoute = useRef(photographerId);
  const currentModal = useRef(modal);
  currentModal.current = modal;
  const profileReturn = useRef(null);
  const profileWasOpen = useRef(false);
  const [inquiryArtwork, setInquiryArtwork] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const selected = localizedArtworks[activeIndex];
  const viewed = localizedArtworks[viewedIndex];
  useEffect(() => {
    document.title = photographerId
      ? `${photographers[photographerId].name} — Cut Off Gallery`
      : t("Cut Off Gallery — Le son. L’instant.", "Cut Off Gallery — Sound. Still.");
  }, [photographerId, t]);
  const cancelApproach = useCallback(() => {
    clearTimeout(approachTimer.current);
    approachTimer.current = null;
    setApproaching(false);
  }, []);
  useEffect(() => () => clearTimeout(approachTimer.current), []);
  const closeModal = useCallback(() => {
    setModal(null);
    cancelApproach();
  }, [cancelApproach]);
  useEffect(() => {
    const syncRoute = () => {
      const id = readPhotographerRoute();
      if (id) {
        if (!profileRoute.current) {
          profileReturn.current = { modal: currentModal.current, element: document.activeElement };
        }
        setModal(null);
      }
      profileRoute.current = id;
      setPhotographerId(id);
    };
    window.addEventListener("popstate", syncRoute);
    window.addEventListener("hashchange", syncRoute);
    return () => {
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener("hashchange", syncRoute);
    };
  }, []);
  const openPhotographer = useCallback((profile) => {
    profileReturn.current = { modal, element: document.activeElement };
    cancelApproach();
    setModal(null);
    window.history.pushState({ ...window.history.state, cutoffProfile: true }, "", `#/photographers/${profile.id}`);
    profileRoute.current = profile.id;
    setPhotographerId(profile.id);
  }, [modal, cancelApproach]);
  const closePhotographer = useCallback(() => {
    if (window.history.state?.cutoffProfile) window.history.back();
    else {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
      profileRoute.current = null;
      setPhotographerId(null);
    }
  }, []);
  useEffect(() => {
    if (photographerId) {
      profileWasOpen.current = true;
      const overflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const escape = (event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        closePhotographer();
      };
      document.addEventListener("keydown", escape);
      return () => {
        document.body.style.overflow = overflow;
        document.removeEventListener("keydown", escape);
      };
    }
    if (!profileWasOpen.current) return;
    profileWasOpen.current = false;
    const previous = profileReturn.current;
    if (previous?.modal) setModal(previous.modal);
    else requestAnimationFrame(() => {
      const target = previous?.focusInspection
        ? document.getElementById("inspection-title")
        : previous?.element?.isConnected ? previous.element : museumLabel.current;
      target?.focus({ preventScroll: true });
    });
  }, [photographerId, closePhotographer]);
  const leaveInspection = useCallback(() => {
    cancelApproach();
    setInspecting(false);
    setFocused(false);
    requestAnimationFrame(() =>
      museumLabel.current?.focus({ preventScroll: true }),
    );
  }, [cancelApproach]);
  const move = useCallback(
    (direction) => {
      cancelApproach();
      const index = (viewedIndex + direction + artworks.length) % artworks.length;
      setActiveIndex(index);
      setViewedIndex(index);
      setNavigationId((id) => id + 1);
      setFocused(false);
      setInspecting(false);
    },
    [cancelApproach, viewedIndex],
  );
  const select = useCallback(
    (index) => {
      cancelApproach();
      setActiveIndex(index);
      setViewedIndex(index);
      setNavigationId((id) => id + 1);
      setFocused(false);
      setInspecting(false);
    },
    [cancelApproach],
  );
  const openWork = useCallback(
    (index, inGallery = false) => {
      cancelApproach();
      setActiveIndex(index);
      setViewedIndex(index);
      setNavigationId((id) => id + 1);
      if (inGallery) setView("gallery");
      if (view !== "gallery" && !inGallery) {
        setModal("artwork");
        return;
      }
      setFocused(true);
      setInspecting(true);
      if (reducedMotion) return;
      setApproaching(true);
      approachTimer.current = setTimeout(() => {
        setApproaching(false);
        approachTimer.current = null;
      }, 1150);
    },
    [view, reducedMotion, cancelApproach],
  );
  const navigate = useCallback(
    (direction) => {
      if (inspecting)
        openWork((activeIndex + direction + artworks.length) % artworks.length);
      else move(direction);
    },
    [inspecting, activeIndex, openWork, move],
  );
  const inquire = useCallback(
    (artwork) => {
      cancelApproach();
      setInquiryArtwork(artwork ? artworks.find((work) => work.id === artwork.id) : null);
      setModal("inquiry");
    },
    [cancelApproach],
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReducedMotion(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const handler = (e) => {
      if (modal || photographer || ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        navigate(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigate(-1);
      }
      if (e.key === "Escape") {
        if (inspecting) leaveInspection();
        else {
          cancelApproach();
          setImmersive(false);
          setFocused(false);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    modal,
    photographer,
    navigate,
    cancelApproach,
    inspecting,
    leaveInspection,
  ]);
  useEffect(() => {
    if (!immersive) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, [immersive]);
  const goHome = () => {
    setView("gallery");
    setImmersive(false);
    select(0);
  };
  return (
    <>
    <div
      className={`site-shell ${view === "gallery" ? "museum-mode" : "collection-mode"} ${immersive ? "immersive-mode" : ""} ${approaching ? "approaching-artwork" : ""} ${inspecting ? "inspecting-artwork" : ""}`}
      inert={Boolean(photographer)}
      aria-hidden={photographer ? true : undefined}
    >
      <header className="site-header" inert={immersive} aria-hidden={immersive || undefined}>
        <Brand onClick={goHome} />
        <nav aria-label={t("Navigation principale", "Main navigation")}>
          <button
            className={view === "gallery" ? "nav-link active" : "nav-link"}
            onClick={() => {
              cancelApproach();
              setView("gallery");
              setFocused(false);
              setInspecting(false);
            }}
          >
            {t("La galerie", "The gallery")}
          </button>
          <button
            className={view === "collection" ? "nav-link active" : "nav-link"}
            onClick={() => {
              cancelApproach();
              setView("collection");
              setFocused(false);
              setInspecting(false);
            }}
          >
            {t("La collection", "The collection")}
          </button>
          <button
            className="nav-link"
            onClick={() => {
              cancelApproach();
              setModal("about");
            }}
          >
            About
          </button>
        </nav>
        <LanguageToggle />
      </header>
      <main>
        {view === "collection" && (
          <section className="intro collection-intro" aria-label={t("Présentation", "Introduction")}>
            <div>
              <h1>
                {t("La collection", "The collection")}<span className="title-dot">.</span>
              </h1>
            </div>
            <p className="collection-intro-note">
              {t("Un autre regard sur la musique.", "A different side of music.")}
            </p>
          </section>
        )}
        {view === "gallery" ? (
          <section
            className="exhibition"
            aria-label={t("Exposition photographique interactive", "Interactive photography exhibition")}
          >
            <div className="gallery-viewport">
              <GalleryScene
                artworks={artworks}
                activeIndex={activeIndex}
                navigationId={navigationId}
                onViewChange={setViewedIndex}
                onSelect={openWork}
                onNavigate={navigate}
                onBackgroundClick={leaveInspection}
                onReady={() => setReady(true)}
                focused={focused}
                inspecting={inspecting}
                reducedMotion={reducedMotion}
              />
              {inspecting && (
                <GalleryInspection
                  artwork={selected}
                  approaching={approaching}
                  onBack={leaveInspection}
                  onExplore={() => setModal("artwork")}
                  onInquire={inquire}
                  onPhotographer={openPhotographer}
                  onMove={navigate}
                  immersive={immersive}
                  onToggleImmersive={() => setImmersive((expanded) => !expanded)}
                />
              )}
              <div className="gallery-topbar">
                <div className="exhibition-title">
                  <h1>
                    {t("Le son", "Sound")}<span>.</span> {t("L’instant", "Still")}<span>.</span>
                  </h1>
                </div>
              </div>
              <button
                className="icon-button gallery-expand"
                onClick={() => setImmersive((expanded) => !expanded)}
                aria-pressed={immersive}
                aria-label={
                  immersive ? t("Quitter le mode immersif", "Exit immersive view") : t("Passer en mode immersif", "Enter immersive view")
                }
              >
                {immersive ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              {!ready && (
                <div className="gallery-loading">
                  <span className="loading-circle" />
                  <span>{t("Ouverture de la galerie", "Opening the gallery")}</span>
                </div>
              )}
              <div className="gallery-bottom-overlay">
                <button
                  ref={museumLabel}
                  className="museum-label"
                  onClick={() => openWork(viewedIndex)}
                  aria-label={t(`Découvrir ${viewed.title}`, `Discover ${viewed.title}`)}
                >
                  <span className="museum-label-rule" />
                  <span className="museum-label-copy">
                    <strong>
                      {viewed.artist}
                      <span>, {viewed.year}</span>
                    </strong>
                    <span>{viewed.photographer}</span>
                  </span>
                </button>
                <p className="museum-hint">
                  {t("Faites glisser pour explorer à 360°", "Drag to explore 360°")}<span>·</span>{t("Choisissez une photographie", "Select a photograph")}
                </p>
                <div className="museum-controls">
                  <button
                    className={`perspective-button ${focused ? "is-active" : ""}`}
                    onClick={() => openWork(viewedIndex)}
                    aria-label={focused ? t("Reculer", "Step back") : t("S’approcher", "Step closer")}
                    aria-pressed={focused}
                  >
                    <ScanLine size={17} />
                  </button>
                  <span className="museum-control-divider" />
                  <button
                    className="icon-button"
                    onClick={() => move(-1)}
                    aria-label={t("Photographie précédente", "Previous photograph")}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => move(1)}
                    aria-label={t("Photographie suivante", "Next photograph")}
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="collection" aria-label={t("Toutes les photographies", "All photographs")}>
            <div className="collection-heading">
              <span className="eyebrow">
                {t("ŒUVRES CHOISIES", "SELECTED WORKS")}
              </span>
              <button
                className="text-button"
                onClick={() => setView("gallery")}
              >
                {t("Retour à la galerie", "Back to the gallery")} <MoveUpRight size={15} />
              </button>
            </div>
            <div className="collection-grid">
              {localizedArtworks.map((art, i) => (
                <button
                  className="collection-card"
                  key={art.id}
                  onClick={() => openWork(i)}
                >
                  <div className="collection-image">
                    <img src={art.image} alt={art.title} loading="lazy" />
                    <span className="collection-view">
                      {t("Découvrir l’œuvre", "Discover the piece")} <ArrowUpRight size={16} />
                    </span>
                  </div>
                  <div className="collection-caption">
                    <div>
                      <h2>
                        {art.artist}
                        <span>, {art.year}</span>
                      </h2>
                      <p>{art.photographer}</p>
                    </div>
                    <ArrowUpRight size={18} />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
      {modal === "artwork" && (
        <ArtworkDetail
          artwork={selected}
          onClose={closeModal}
          onInquire={inquire}
          onPhotographer={openPhotographer}
        />
      )}
      {modal === "inquiry" && (
        <Inquiry artwork={localizeArtwork(inquiryArtwork, language)} onClose={closeModal} />
      )}
      {modal === "about" && <About onClose={closeModal} onInquire={inquire} />}
    </div>
    {photographer && (
      <PhotographerProfile
        photographer={photographer}
        artworks={localizedArtworks}
        onBack={closePhotographer}
        onSelectArtwork={(artwork) => {
          profileReturn.current = { focusInspection: true };
          closePhotographer();
          openWork(artworks.findIndex((work) => work.id === artwork.id), true);
        }}
      />
    )}
    </>
  );
}
