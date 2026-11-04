import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../i18n.jsx';
import LanguageToggle from './LanguageToggle.jsx';
import GalleryLogo from './GalleryLogo.jsx';
import './photographer-profile.css';

const normalizedName = (value) => String(value || '').normalize('NFKC').trim().toLocaleLowerCase();

export default function PhotographerProfile({ photographer, artworks = [], onBack, onSelectArtwork }) {
  const { t } = useLanguage();
  const page = useRef(null);
  const heading = useRef(null);

  useEffect(() => {
    page.current?.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
  }, [photographer?.id, photographer?.name]);

  if (!photographer) return null;

  const name = photographer.name || t('Le photographe', 'The photographer');
  const words = name.trim().split(/\s+/);
  const firstLine = words.length > 1 ? words.slice(0, -1).join(' ') : '';
  const lastLine = words.at(-1);
  const bio = Array.isArray(photographer.bio) ? photographer.bio.filter(Boolean) : [];
  const facts = Array.isArray(photographer.facts) ? photographer.facts.filter((fact) => fact?.label && fact?.value) : [];
  const sources = Array.isArray(photographer.sources) ? photographer.sources.filter((source) => source?.url && source?.label) : [];
  const works = artworks.filter((artwork) =>
    (photographer.id && artwork.photographerId === photographer.id)
    || normalizedName(artwork.photographer) === normalizedName(name),
  );

  return (
    <div ref={page} className="photographer-profile" aria-labelledby="photographer-profile-title">
      <header className="photographer-profile-header">
        <button type="button" className="photographer-profile-brand" onClick={onBack} aria-label={t('Cut Off Gallery — retour à la galerie', 'Cut Off Gallery — return to the gallery')}>
          <GalleryLogo />
        </button>
        <span className="photographer-profile-context">{t('Les photographes', 'The photographers')}</span>
        <div className="photographer-profile-header-actions">
          <button type="button" className="photographer-profile-back" onClick={onBack} aria-label={t('Retour à la galerie', 'Back to gallery')}>
            <ArrowLeft size={15} strokeWidth={1.5} aria-hidden="true" />
            <span>{t('Retour à la galerie', 'Back to gallery')}</span>
          </button>
          <LanguageToggle />
        </div>
      </header>

      <main className="photographer-profile-main">
        <div className="photographer-profile-hero">
          <figure className="photographer-profile-portrait">
            <div className="photographer-profile-portrait-image">
              {photographer.portrait ? (
                <img src={photographer.portrait} alt={photographer.portraitAlt || t(`Portrait de ${name}`, `Portrait of ${name}`)} decoding="async" />
              ) : (
                <span className="photographer-profile-initials" aria-hidden="true">
                  {words.map((word) => word[0]).slice(0, 2).join('')}
                </span>
              )}
            </div>
            {(photographer.portraitCredit || photographer.portraitSourceUrl) && (
              <figcaption className="photographer-profile-portrait-caption">
                {photographer.portraitCredit && <span>{photographer.portraitCredit}</span>}
                {photographer.portraitSourceUrl && (
                  <a href={photographer.portraitSourceUrl} target="_blank" rel="noreferrer">
                    {t('Source du portrait', 'Portrait source')} <ArrowUpRight size={11} aria-hidden="true" />
                  </a>
                )}
              </figcaption>
            )}
          </figure>

          <header className="photographer-profile-introduction">
            <h1 ref={heading} id="photographer-profile-title" tabIndex={-1}>
              {firstLine && <span>{firstLine}</span>}
              <span>{lastLine}</span>
            </h1>
            {photographer.headline && <p className="photographer-profile-headline">{photographer.headline}</p>}
            {photographer.intro && <p className="photographer-profile-intro">{photographer.intro}</p>}
          </header>

          {(bio.length > 0 || facts.length > 0) && (
            <section className="photographer-profile-story" aria-label={t(`À propos de ${name}`, `About ${name}`)}>
              {bio.length > 0 && <div className="photographer-profile-biography">
                {bio.map((paragraph, index) => <p key={`${photographer.id || name}-bio-${index}`}>{paragraph}</p>)}
              </div>}
              {facts.length > 0 && <dl className="photographer-profile-facts">
                {facts.map((fact, index) => <div key={`${fact.label}-${index}`}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>)}
              </dl>}
            </section>
          )}
        </div>

        {works.length > 0 && (
          <section className="photographer-profile-works" aria-labelledby="photographer-profile-works-title">
            <div className="photographer-profile-section-heading">
              <span className="photographer-profile-section-label">{t('Les photographies', 'The photographs')}</span>
              <h2 id="photographer-profile-works-title">{t('Œuvres à la galerie', 'Works in the gallery')}</h2>
            </div>
            <div className="photographer-profile-work-list">
              {works.map((artwork) => (
                <button
                  key={artwork.id || artwork.title}
                  type="button"
                  className="photographer-profile-work"
                  onClick={() => onSelectArtwork?.(artwork)}
                  aria-label={t(`Voir ${artwork.title}${artwork.year ? `, ${artwork.year}` : ''}`, `View ${artwork.title}${artwork.year ? `, ${artwork.year}` : ''}`)}
                >
                  <span className="photographer-profile-work-image">
                    <img src={artwork.image} alt="" loading="lazy" decoding="async" />
                  </span>
                  <span className="photographer-profile-work-copy">
                    {(artwork.location || artwork.year) && <span className="photographer-profile-work-place">
                      {[artwork.location, artwork.year].filter(Boolean).join(' · ')}
                    </span>}
                    <span className="photographer-profile-work-artist">{artwork.artist || artwork.title}</span>
                    {artwork.title && artwork.title !== artwork.artist && <span className="photographer-profile-work-title">{artwork.title}</span>}
                    {artwork.medium && <span className="photographer-profile-work-medium">{artwork.medium}</span>}
                    <span className="photographer-profile-work-link">{t('Voir la photographie', 'View photograph')} <ArrowUpRight size={19} strokeWidth={1.4} aria-hidden="true" /></span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="photographer-profile-footer">
        <button type="button" className="photographer-profile-back" onClick={onBack}>
          <ArrowLeft size={15} strokeWidth={1.5} aria-hidden="true" /> {t('Retour à la galerie', 'Back to gallery')}
        </button>
        {sources.length > 0 && <div className="photographer-profile-sources" aria-label={t('Sources biographiques', 'Biography sources')}>
          <span>{t('Pour aller plus loin', 'Further reading')}</span>
          {sources.map((source, index) => <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer">
            {source.label} <ArrowUpRight size={11} aria-hidden="true" />
          </a>)}
        </div>}
      </footer>
    </div>
  );
}
