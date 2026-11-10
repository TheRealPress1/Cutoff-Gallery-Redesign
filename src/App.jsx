import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import GalleryInspection from "./components/GalleryInspection.jsx";
import PrintViewer from "./components/PrintViewer.jsx";
import PhotographerCredit from "./components/PhotographerCredit.jsx";
import PhotographerProfile from "./components/PhotographerProfile.jsx";
import AppearanceControls from "./components/AppearanceControls.jsx";
import AboutPage from "./components/AboutPage.jsx";
import HomePage from "./components/HomePage.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
import { useLanguage } from "./i18n.jsx";
import { useTheme } from "./theme.jsx";
import { artworks } from "./data/artworks.js";
import InquiryComposer from "./components/InquiryComposer.jsx";
import { photographers } from "./data/photographers.js";
import { localizeArtwork, localizePhotographer } from "./data/translations.js";
import "./museum-theme.css";

const GalleryScene = lazy(() => import("./components/GalleryScene.jsx"));

const readMainRoute = () => {
  if (window.location.hash === "#/about") return "about";
  if (window.location.hash === "#/collection") return "collection";
  if (window.location.hash === "#/gallery") return "gallery";
  return "home";
};

const readPhotographerRoute = () => {
  const prefix = "#/photographers/";
  const id = window.location.hash.startsWith(prefix) ? window.location.hash.slice(prefix.length) : null;
  return Object.hasOwn(photographers, id) ? id : null;
};

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
        <div className="modal-language"><AppearanceControls /></div>
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

export default function App() {
  const { language, t } = useLanguage();
  const { theme: museumTheme } = useTheme();
  const localizedArtworks = useMemo(() => artworks.map((artwork) => localizeArtwork(artwork, language)), [language]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewedIndex, setViewedIndex] = useState(0);
  const [navigationId, setNavigationId] = useState(0);
  const [view, setView] = useState(readMainRoute);
  const currentView = useRef(view);
  currentView.current = view;
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [detailZoom, setDetailZoom] = useState(false);
  const [detailAvailable, setDetailAvailable] = useState(true);
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
      : view === "about"
        ? "About — Cut Off Gallery"
        : view === "collection"
          ? t("La collection — Cut Off Gallery", "The collection — Cut Off Gallery")
          : view === "gallery"
            ? t("La galerie — Cut Off Gallery", "The gallery — Cut Off Gallery")
            : "Cut Off Gallery";
  }, [photographerId, view, t]);
  const cancelApproach = useCallback(() => {
    clearTimeout(approachTimer.current);
    approachTimer.current = null;
    setApproaching(false);
    setDetailZoom(false);
  }, []);
  useEffect(() => () => clearTimeout(approachTimer.current), []);
  const showMainView = useCallback((nextView) => {
    cancelApproach();
    if (nextView === "gallery" && currentView.current !== "gallery") setReady(false);
    currentView.current = nextView;
    setView(nextView);
    setModal(null);
    setFocused(false);
    setInspecting(false);
    setImmersive(false);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
  }, [cancelApproach]);
  const navigateToView = useCallback((nextView, replace = false) => {
    const hash = nextView === "home" ? "" : `#/${nextView}`;
    const alreadyHere = window.location.hash === hash
      || (nextView === "home" && window.location.hash === "#/");
    if (!alreadyHere) {
      window.history[replace ? "replaceState" : "pushState"](
        { ...window.history.state, cutoffProfile: false },
        "",
        window.location.pathname + window.location.search + hash,
      );
    }
    profileRoute.current = null;
    setPhotographerId(null);
    showMainView(nextView);
  }, [showMainView]);
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
      } else {
        const nextView = readMainRoute();
        // A profile returns to its existing viewing context. Main-page history
        // changes instead reset the room and open the requested page at the top.
        if (nextView !== currentView.current) showMainView(nextView);
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
  }, [showMainView]);
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
      navigateToView("home", true);
    }
  }, [navigateToView]);
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
  const openWork = useCallback(
    (index, inGallery = false) => {
      cancelApproach();
      setActiveIndex(index);
      setViewedIndex(index);
      setNavigationId((id) => id + 1);
      // Replace the profile entry rather than going Back asynchronously: a
      // pending history event must not restore Collection over this artwork.
      if (inGallery) navigateToView("gallery", true);
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
    [view, reducedMotion, cancelApproach, navigateToView],
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
      if (
        view !== "gallery" || e.defaultPrevented || modal || photographer ||
        e.altKey || e.ctrlKey || e.metaKey || e.shiftKey ||
        e.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)
      ) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        navigate(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigate(-1);
      }
      if (view === "gallery" && e.key === "ArrowUp") {
        e.preventDefault();
        if (!inspecting && !e.repeat) openWork(viewedIndex);
        else if (inspecting && detailAvailable && !approaching && !e.repeat) setDetailZoom(true);
      }
      if (view === "gallery" && e.key === "ArrowDown") {
        e.preventDefault();
        if (!e.repeat) {
          if (detailZoom) setDetailZoom(false);
          else if (inspecting || focused) leaveInspection();
        }
      }
      if (e.key === "Escape") {
        if (e.repeat) return;
        if (detailZoom) setDetailZoom(false);
        else if (inspecting) leaveInspection();
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
    detailZoom,
    detailAvailable,
    approaching,
    focused,
    view,
    viewedIndex,
    openWork,
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
  return (
    <>
    <div
      className={`site-shell ${view === "gallery" ? "museum-mode" : view === "about" ? "about-mode" : view === "collection" ? "collection-mode" : "home-mode"} ${immersive ? "immersive-mode" : ""} ${approaching ? "approaching-artwork" : ""} ${inspecting ? "inspecting-artwork" : ""}`}
      data-theme={museumTheme}
      inert={Boolean(photographer)}
      aria-hidden={photographer ? true : undefined}
    >
      <SiteHeader
        view={view}
        onNavigate={navigateToView}
        onInquire={() => inquire(null)}
        immersive={immersive}
      />
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
        {view === "home" ? (
          <HomePage
            artworks={localizedArtworks}
            onOpenArtwork={openWork}
            onAbout={() => navigateToView("about")}
            onInquire={() => inquire(null)}
            onGallery={() => navigateToView("gallery")}
            reducedMotion={reducedMotion}
          />
        ) : view === "gallery" ? (
          <section
            className="exhibition"
            aria-label={t("Exposition photographique interactive", "Interactive photography exhibition")}
          >
            <div className="gallery-viewport">
              <Suspense fallback={null}>
                <GalleryScene
                  artworks={artworks}
                  activeIndex={activeIndex}
                  navigationId={navigationId}
                  onViewChange={setViewedIndex}
                  onSelect={openWork}
                  onNavigate={navigate}
                  onBackgroundClick={() => detailZoom ? setDetailZoom(false) : leaveInspection()}
                  onReady={(supportsDetail = true) => {
                    setReady(true);
                    setDetailAvailable(supportsDetail);
                    if (!supportsDetail) setDetailZoom(false);
                  }}
                  focused={focused}
                  inspecting={inspecting}
                  approaching={approaching}
                  detailZoom={detailZoom}
                  onDetailZoomChange={setDetailZoom}
                  reducedMotion={reducedMotion}
                  theme={museumTheme}
                />
              </Suspense>
              {inspecting && (
                <GalleryInspection
                  artwork={selected}
                  approaching={approaching}
                  detailZoom={detailZoom}
                  onBack={leaveInspection}
                  onExplore={() => setModal("artwork")}
                  onInquire={inquire}
                  onPhotographer={openPhotographer}
                  onMove={navigate}
                  immersive={immersive}
                  onToggleImmersive={() => setImmersive((expanded) => !expanded)}
                />
              )}
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
                    className="icon-button gallery-fullscreen"
                    onClick={() => setImmersive((expanded) => !expanded)}
                    aria-pressed={immersive}
                    aria-label={immersive ? t("Quitter le mode immersif", "Exit immersive view") : t("Passer en mode immersif", "Enter immersive view")}
                  >
                    {immersive ? <Minimize2 size={17} aria-hidden="true" /> : <Maximize2 size={17} aria-hidden="true" />}
                  </button>
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
        ) : view === "collection" ? (
          <section className="collection" aria-label={t("Toutes les photographies", "All photographs")}>
            <div className="collection-heading">
              <span className="eyebrow">
                {t("ŒUVRES CHOISIES", "SELECTED WORKS")}
              </span>
              <button
                className="text-button"
                onClick={() => navigateToView("gallery")}
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
        ) : (
          <AboutPage
            onInquire={inquire}
            onCollection={() => navigateToView("collection")}
            onGallery={() => navigateToView("gallery")}
          />
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
    </div>
    {photographer && (
      <PhotographerProfile
        photographer={photographer}
        artworks={localizedArtworks}
        onBack={closePhotographer}
        onSelectArtwork={(artwork) => {
          profileReturn.current = { focusInspection: true };
          openWork(artworks.findIndex((work) => work.id === artwork.id), true);
        }}
      />
    )}
    </>
  );
}
