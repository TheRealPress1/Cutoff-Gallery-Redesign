import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import PhotographerCredit from "./PhotographerCredit.jsx";
import { useLanguage } from "../i18n.jsx";
import "./gallery-inspection.css";

export default function GalleryInspection({
  artwork,
  approaching,
  onBack,
  onExplore,
  onInquire,
  onMove,
  onPhotographer,
}) {
  const { t } = useLanguage();
  const heading = useRef(null);
  const panel = useRef(null);
  useEffect(() => {
    if (!approaching) {
      panel.current?.scrollTo({ top: 0 });
      heading.current?.focus({ preventScroll: true });
    }
  }, [artwork.id, approaching]);

  return (
    <div
      className={`gallery-inspection ${approaching ? "is-arriving" : "has-arrived"}`}
    >
      <button className="inspection-back" onClick={onBack}>
        <ArrowLeft size={16} /> {t("Retour à la galerie", "Back to the room")}
      </button>
      <aside
        ref={panel}
        className="inspection-panel"
        aria-labelledby="inspection-title"
        aria-hidden={approaching}
        inert={approaching}
      >
        <h2 id="inspection-title" ref={heading} tabIndex={-1}>
          {artwork.artist}
        </h2>
        <p className="inspection-work-title">{artwork.title}</p>
        <p className="inspection-location">
          {artwork.location}, {artwork.year}
        </p>
        <PhotographerCredit name={artwork.photographer} onOpen={onPhotographer} />
        <p className="inspection-description">{artwork.description}</p>
        <dl className="inspection-specs">
          <div>
            <dt>{t("Édition", "Edition")}</dt>
            <dd>{artwork.editionSize} {t("tirages", "prints")}</dd>
          </div>
          <div>
            <dt>{t("Technique", "Medium")}</dt>
            <dd>{artwork.medium}</dd>
          </div>
          <div>
            <dt>{t("Formats", "Print sizes")}</dt>
            <dd>{artwork.formats.join(" / ")}</dd>
          </div>
        </dl>
        <button className="inspection-explore" onClick={onExplore}>
          {t("Voir le tirage", "Explore the print")} <ArrowUpRight size={22} strokeWidth={1.4} />
        </button>
        <button
          className="inspection-inquire"
          onClick={() => onInquire(artwork)}
        >
          {t("Se renseigner sur ce tirage", "Inquire about this work")} <ArrowUpRight size={13} />
        </button>
      </aside>
      <nav
        className="inspection-navigation"
        aria-label={t("Explorer les photographies de la galerie", "Explore photographs in the room")}
      >
        <button
          onClick={() => onMove(-1)}
          aria-label={t("Œuvre précédente dans la galerie", "Previous work in the room")}
        >
          <ArrowLeft size={17} />
        </button>
        <button onClick={() => onMove(1)} aria-label={t("Œuvre suivante dans la galerie", "Next work in the room")}>
          <ArrowRight size={17} />
        </button>
      </nav>
    </div>
  );
}
