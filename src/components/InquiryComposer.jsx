import { useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, Paperclip } from "lucide-react";
import { useLanguage } from "../i18n.jsx";
import { galleryEmail } from "../data/contact.js";
import { prepareInquiryEmail } from "../lib/inquiry.js";
import "./inquiry-composer.css";

export default function InquiryComposer({ artwork }) {
  const { language, t } = useLanguage();
  const [name, setName] = useState("");
  const [drafts, setDrafts] = useState({});
  const [subjects, setSubjects] = useState({});
  const [feedback, setFeedback] = useState(null);
  const messageInput = useRef(null);
  const subjectInput = useRef(null);
  const defaultMessage = artwork
    ? t(
      `Bonjour Cut Off Gallery,\n\nCette photographie de ${artwork.artist} a retenu mon attention. J’aimerais en savoir plus sur les éditions disponibles, les formats, l’encadrement et les tarifs.\n\nMerci,`,
      `Hello Cut Off Gallery,\n\nThis photograph of ${artwork.artist} caught my eye. I’d love to know more about the available editions, print sizes, framing options, and pricing.\n\nThank you,`,
    )
    : t(
      "Bonjour Cut Off Gallery,\n\nJ’aimerais en savoir plus sur votre collection et échanger avec vous pour trouver une photographie pour mon intérieur.\n\nMerci,",
      "Hello Cut Off Gallery,\n\nI’d love to learn more about your collection and speak with you about finding a photograph for my space.\n\nThank you,",
    );
  const message = drafts[language] ?? defaultMessage;
  const subject = subjects[language] ?? (artwork
    ? t(`À propos de ${artwork.artist} — ${artwork.year}`, `About ${artwork.artist} — ${artwork.year}`)
    : t("Une photographie pour ma collection", "A photograph for my collection"));
  const email = prepareInquiryEmail({ recipient: galleryEmail, subject, message, name, artwork, language });

  function openEmail(event) {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setFeedback("empty");
      (!subject.trim() ? subjectInput : messageInput).current?.focus();
      return;
    }
    window.location.href = email.href;
    setFeedback("opened");
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(`${t("À", "To")} : ${galleryEmail}\n${t("Objet", "Subject")} : ${subject}\n\n${email.body}`);
      setFeedback("copied");
    } catch {
      setFeedback("copy-error");
      messageInput.current?.focus();
      messageInput.current?.select();
    }
  }

  return (
    <div className="inquiry-composer">
      <div className="composer-wordmark" aria-hidden="true">CUT/OFF <span>{t("Correspondance", "Correspondence")}</span></div>
      <div className="composer-layout">
        <form className="composer-form" onSubmit={openEmail}>
          <div className="composer-addresses">
            <label className="composer-address-row">
              <span>{t("De", "From")}</span>
              <input
                data-autofocus
                name="name"
                autoComplete="name"
                aria-label={t("Votre nom (facultatif)", "Your name (optional)")}
                placeholder={t("Votre nom", "Your name")}
                value={name}
                maxLength={100}
                onChange={(event) => { setName(event.target.value); setFeedback(null); }}
              />
            </label>
            <div className="composer-address-row">
              <span>{t("À", "To")}</span>
              <div className="composer-recipient"><strong>Cut Off Gallery</strong><span>{galleryEmail}</span></div>
            </div>
            <label className="composer-address-row composer-subject-row">
              <span>{t("Objet", "Subject")}</span>
              <input
                ref={subjectInput}
                name="subject"
                value={subject}
                maxLength={160}
                required
                onChange={(event) => { setSubjects((previous) => ({ ...previous, [language]: event.target.value })); setFeedback(null); }}
              />
            </label>
          </div>
          <textarea
            ref={messageInput}
            className="composer-message"
            name="message"
            aria-label={t("Votre message à la galerie", "Your message to the gallery")}
            value={message}
            required
            maxLength={2000}
            rows={9}
            onChange={(event) => { setDrafts((previous) => ({ ...previous, [language]: event.target.value })); setFeedback(null); }}
          />
          <div className="composer-footer">
            <button type="submit" className="composer-send">
              <span>{t("Ouvrir l’e-mail", "Open email draft")}</span><ArrowUpRight size={25} strokeWidth={1.4} aria-hidden="true" />
            </button>
            <button type="button" className="composer-copy" onClick={copyMessage}>
              {feedback === "copied" ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              {feedback === "copied" ? t("Copié", "Copied") : t("Copier le message", "Copy message")}
            </button>
          </div>
          <p className="composer-feedback" role="status" aria-live="polite">
            {feedback === "opened" && t("Vérifiez et envoyez le brouillon depuis votre messagerie. Rien ne s’ouvre ? Copiez le message et écrivez-nous à l’adresse ci-dessus.", "Review and send the draft in your email app. Nothing opened? Copy the message and email us at the address above.")}
            {feedback === "copied" && t("Le message et les références de l’œuvre ont été copiés.", "The message and artwork details have been copied.")}
            {feedback === "empty" && t("Ajoutez un objet et un message avant de continuer.", "Add a subject and message before continuing.")}
            {feedback === "copy-error" && t("Sélectionnez le texte pour le copier manuellement.", "Select the text to copy it manually.")}
          </p>
        </form>
        {artwork ? (
          <aside className="composer-artwork" aria-label={t("L’œuvre qui vous intéresse", "The work you’re asking about")}>
            <figure className="composer-print">
              <span className="composer-paperclip" aria-hidden="true"><Paperclip size={44} strokeWidth={1.1} /></span>
              <img src={artwork.image} alt={artwork.title} />
              <figcaption>
                <strong>{artwork.artist}</strong>
                <span>{artwork.photographer} · {artwork.year}</span>
              </figcaption>
            </figure>
            <p className="composer-artwork-note">{artwork.title}<br />{t(`Édition limitée à ${artwork.editionSize} tirages`, `Limited edition of ${artwork.editionSize} prints`)}</p>
          </aside>
        ) : (
          <aside className="composer-no-artwork"><span>{t("Une image.", "One photograph.")}</span><span>{t("Une rencontre.", "A connection.")}</span><p>{t("Trouvons la vôtre.", "Let’s find yours.")}</p></aside>
        )}
      </div>
    </div>
  );
}
