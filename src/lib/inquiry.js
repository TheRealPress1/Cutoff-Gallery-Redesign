export function prepareInquiryEmail({ recipient, subject, message, name, artwork, language }) {
  const french = language === "fr";
  const signature = name.trim();
  const reference = artwork
    ? `\n\n—\n${french ? "Œuvre" : "Artwork"} : ${artwork.title}, ${artwork.year}\n${french ? "Photographe" : "Photographer"} : ${artwork.photographer}\n${artwork.originalUrl}`
    : "";
  const body = `${message.trim()}${signature ? `\n${signature}` : ""}${reference}`;
  return {
    body,
    href: `mailto:${recipient}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(body)}`,
  };
}
