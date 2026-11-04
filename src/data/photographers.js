// Original profile copy, verified against the interviews and institutional
// biographies linked below. Portrait credit follows the publisher's metadata.
export const photographers = {
  "cyril-villemain": {
    id: "cyril-villemain",
    name: "Cyril Villemain",
    portrait: "/photographers/cyril-villemain.jpg",
    portraitAlt: "Cyril Villemain in a white shirt at Bahari",
    avatarScale: 1.45,
    avatarPosition: "55% 0%",
    headline: "In the booth, before the helmets.",
    intro:
      "Originally from Burgundy, Cyril Villemain began his photojournalism career in 1995. His interest in electronic music took him to Dijon’s L’An-Fer.",
    bio: [
      "In November 1996, he photographed Daft Punk for Le Bien Public. With a Nikon F4 and black-and-white film, he captured a few minutes of their DJ set.",
      "He later covered national and international news, working with publications and agencies including AFP, SIPA Press and The Guardian.",
    ],
    facts: [
      { label: "Roots", value: "Burgundy, France" },
      { label: "Practice", value: "Photojournalism" },
      { label: "Series", value: "L’An-Fer, Dijon · 1996" },
    ],
    sources: [
      {
        label: "Cut Off Gallery — biography & interview",
        url: "https://cutoffgallery.art/collection/daft-punk-lanfer-dijon-1996",
      },
    ],
  },
  "denis-rouvre": {
    id: "denis-rouvre",
    name: "Denis Rouvre",
    portrait: "/photographers/denis-rouvre.jpg",
    portraitAlt: "Black-and-white portrait of Denis Rouvre holding torn strips of his portrait",
    portraitCredit: "Portrait · World Press Photo",
    portraitSourceUrl: "https://www.worldpressphoto.org/denis-rouvre",
    avatarScale: 1,
    avatarPosition: "50% 15%",
    headline: "The presence of a face.",
    intro:
      "A French photographer specializing in portraiture, Denis Rouvre works across magazine commissions and personal series. His photographs have been published internationally and exhibited in France and abroad.",
    bio: [
      "Born in 1967, Rouvre has worked as a portrait photographer since 1992. He began photographing public figures for the magazine press, contributing to publications including Le Monde, Télérama and The New York Times Magazine.",
      "Alongside commissioned work, he develops personal projects around the figure of the contemporary hero. His photographs of survivors of Japan’s 2011 tsunami appeared in The New York Times Magazine in February 2012. His published books include Lamb, Low Tide and Unsung Heroes.",
      "His work received World Press Photo awards in 2010 for Lamb, in 2012 for a portrait of Toku Konno, and in 2013 for Sumo. He also received the Hasselblad Masters Portrait award in 2012.",
    ],
    facts: [
      { label: "Born", value: "1967" },
      { label: "Practice", value: "Portrait photography" },
      { label: "World Press Photo", value: "2010 · 2012 · 2013" },
    ],
    sources: [
      {
        label: "Denis Rouvre — official biography (PDF)",
        url: "https://rouvre.com/files/pdf_3_file_fr.pdf",
      },
      {
        label: "World Press Photo — photographer profile",
        url: "https://www.worldpressphoto.org/denis-rouvre",
      },
      {
        label: "World Photography Organisation — biography",
        url: "https://www.worldphoto.org/team-profile/denis-rouvre-france",
      },
    ],
  },
  "willy-vainqueur": {
    id: "willy-vainqueur",
    name: "Willy Vainqueur",
    portrait: "/photographers/willy-vainqueur.jpg",
    portraitAlt: "Willy Vainqueur seated with his camera",
    portraitCredit: "Portrait © Willy Vainqueur · The Red Bulletin",
    portraitSourceUrl:
      "https://www.redbull.com/fr-fr/theredbulletin/willy-vainqueur-portfolio",
    eyebrow: "BEHIND THE PHOTOGRAPH",
    headline: "Before hip-hop became history.",
    intro:
      "For more than four decades, Willy Vainqueur has photographed the people and cultural life of Seine-Saint-Denis. His images of early French hip-hop put you among the dancers, DJs and audiences who helped shape a movement.",
    bio: [
      "Originally from Guadeloupe, Vainqueur arrived in Aubervilliers in the mid-1970s and studied photography at Université Paris 13. The city became central to his work: a place to document everyday lives, cultural expression and the people behind them.",
      "At Fêtes et Forts in 1984 and 1985, his camera recorded young dancers and musicians gathering at the Fort d’Aubervilliers. These photographs preserve the gestures, faces and collective energy of hip-hop’s beginnings in France.",
      "His documentary practice reaches beyond music. Human encounters and the memory of places remain central to his work. His collaborations have also included Printemps de Bourges and Villes des Musiques du Monde.",
    ],
    facts: [
      { label: "Roots", value: "Guadeloupe · Aubervilliers" },
      { label: "Practice", value: "Documentary photography" },
      { label: "Key series", value: "Fêtes et Forts, 1984–1985" },
    ],
    sources: [
      {
        label: "The Red Bulletin — interview & portfolio",
        url: "https://www.redbull.com/fr-fr/theredbulletin/willy-vainqueur-portfolio",
      },
      {
        label: "Seine-Saint-Denis — the origins of French hip-hop",
        url: "https://seinesaintdenis.fr/actualite/culture-patrimoine/Une-expo-photo-qui-explore-les-origines-du-hip-hop-en-France/",
      },
      {
        label: "Aubervilliers Archives — photographer biography",
        url: "https://archives.aubervilliers.fr/Rencontre-autour-de-l-exposition-L",
      },
    ],
  },
};

export function getPhotographer(name) {
  return Object.values(photographers).find(
    (photographer) => photographer.name === name,
  );
}

export default photographers;
