import { ArrowUpRight } from "lucide-react";
import { getPhotographer } from "../data/photographers.js";
import { useLanguage } from "../i18n.jsx";
import "./photographer-credit.css";

export default function PhotographerCredit({ name, onOpen }) {
  const { t } = useLanguage();
  const photographer = getPhotographer(name);
  const copy = (
    <>
      {photographer && (
        <span className="photographer-credit-avatar">
          <img
            className="photographer-credit-portrait"
            src={photographer.portrait}
            alt=""
            style={{
              "--portrait-scale": photographer.avatarScale ?? 1.9,
              objectPosition: photographer.avatarPosition ?? "50% 50%",
            }}
          />
        </span>
      )}
      <span className="photographer-credit-copy">
        <strong>{name}</strong>
        {photographer && <span className="photographer-credit-link">{t("Découvrir le photographe", "Meet the photographer")} <ArrowUpRight size={13} /></span>}
      </span>
    </>
  );

  if (!photographer) return <div className="photographer-credit">{copy}</div>;
  return (
    <a
      className="photographer-credit has-profile"
      href={`#/photographers/${photographer.id}`}
      aria-label={t(`Découvrir ${name}, photographe`, `Meet ${name}, photographer`)}
      onClick={(event) => {
        if (!onOpen || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        onOpen(photographer);
      }}
    >
      {copy}
    </a>
  );
}
