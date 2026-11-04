const artworkFrench = {
  "daft-punk": {
    title: "Daft Punk — Aux platines à L’An-Fer",
    description:
      "Avant les casques, avant Homework. Cyril Villemain photographie Thomas Bangalter et Guy-Manuel de Homem-Christo aux platines de L’An-Fer, au cours d’une nuit de novembre 1996.",
  },
  "kendrick-lamar": {
    title: "Kendrick Lamar — Los Angeles",
    location: "Los Angeles, États-Unis",
    description:
      "Denis Rouvre entre dans l’univers de Kendrick Lamar lors de la séance réalisée à Los Angeles pour To Pimp a Butterfly. Une photographie portée par l’énergie de l’artiste, de ses amis et d’un lieu où tout semble possible.",
  },
  "mehdi-and-friends": {
    title: "Mehdi, Pedro, Thomas et leurs amis",
    artist: "DJ Mehdi et ses amis",
    description:
      "Une nuit électrique au Social Club. Romain Bourven saisit DJ Mehdi et la bande d’Ed Banger dans un moment spontané derrière les platines, où l’amitié et la musique occupent tout le cadre.",
  },
  "daft-punk-untitled": {
    title: "Sans titre — Daft Punk à L’An-Fer",
    description:
      "Un autre regard sur une nuit remarquable à L’An-Fer. Avec un Nikon F4 et une pellicule noir et blanc, Cyril Villemain saisit un instant sans artifice, avant que l’image de Daft Punk ne devienne indissociable de leurs casques.",
  },
  "dee-nasty": {
    title: "Dee Nasty — Aubervilliers",
    description:
      "Au festival Fêtes et Forts, Willy Vainqueur photographie Dee Nasty aux platines. Un témoignage rare des débuts du hip-hop français, saisi au Fort d’Aubervilliers.",
  },
  phoenix: {
    title: "Phoenix — Aix-les-Bains",
    description:
      "David Dahan photographie Phoenix à Musilac, à Aix-les-Bains. Un instant de concert de 2023, conservé dans un tirage d’art et édité en collaboration avec le photographe.",
  },
};

const mediumFrench = {
  "Silver gelatin print on Ilford Baryta Warmtone":
    "Tirage gélatino-argentique sur papier Ilford Baryta Warmtone",
  "Pigment print on Hahnemühle Fine Art Baryta 315 gsm":
    "Tirage pigmentaire sur papier Hahnemühle Fine Art Baryta 315 g/m²",
  "Fine art print on Hahnemühle cotton paper 308 gsm":
    "Tirage d’art sur papier coton Hahnemühle 308 g/m²",
};

const formatFrench = {
  "Larger formats on request": "Grands formats sur demande",
  "Dimensions on request": "Dimensions sur demande",
};

const photographerFrench = {
  "cyril-villemain": {
    portraitAlt: "Cyril Villemain en chemise blanche chez Bahari",
    headline: "Dans la cabine, avant les casques.",
    intro:
      "Originaire de Bourgogne, Cyril Villemain commence le photojournalisme en 1995. Son intérêt pour la musique électronique le conduit aux soirées de L’An-Fer, à Dijon.",
    bio: [
      "En novembre 1996, il photographie Daft Punk pour Le Bien Public. Avec un Nikon F4 et du film noir et blanc, il saisit quelques minutes de leur set.",
      "Il couvre ensuite l’actualité nationale et internationale, travaillant notamment avec l’AFP, SIPA Press et The Guardian.",
    ],
    facts: [
      { label: "Origines", value: "Bourgogne, France" },
      { label: "Pratique", value: "Photojournalisme" },
      { label: "Série", value: "L’An-Fer, Dijon · 1996" },
    ],
    sourceLabels: ["Cut Off Gallery — biographie et entretien"],
  },
  "denis-rouvre": {
    portraitAlt: "Portrait en noir et blanc de Denis Rouvre tenant des bandes déchirées de son portrait",
    headline: "La présence d’un visage.",
    intro:
      "Photographe français spécialisé dans le portrait, Denis Rouvre partage son travail entre commandes pour la presse et séries personnelles. Ses photographies sont publiées à l’international et exposées en France comme à l’étranger.",
    bio: [
      "Né en 1967, Denis Rouvre pratique le portrait depuis 1992. Il commence par photographier des personnalités pour la presse magazine et collabore notamment avec Le Monde, Télérama et The New York Times Magazine.",
      "Parallèlement aux commandes, il développe des projets personnels autour de la figure du héros contemporain. Ses photographies de survivants du tsunami japonais de 2011 paraissent dans The New York Times Magazine en février 2012. Il a notamment publié Lamb, Low Tide et Unsung Heroes.",
      "Son travail est récompensé par World Press Photo en 2010 pour Lamb, en 2012 pour un portrait de Toku Konno et en 2013 pour Sumo. Il reçoit également le prix Hasselblad Masters Portrait en 2012.",
    ],
    facts: [
      { label: "Né en", value: "1967" },
      { label: "Pratique", value: "Photographie de portrait" },
      { label: "World Press Photo", value: "2010 · 2012 · 2013" },
    ],
    sourceLabels: [
      "Denis Rouvre — biographie officielle (PDF)",
      "World Press Photo — le photographe",
      "World Photography Organisation — biographie",
    ],
  },
  "willy-vainqueur": {
    portraitAlt: "Willy Vainqueur assis, son appareil photo à la main",
    portraitCredit: "Portrait © Willy Vainqueur · The Red Bulletin",
    headline: "Avant que le hip-hop entre dans l’histoire.",
    intro:
      "Depuis plus de quarante ans, Willy Vainqueur photographie les habitants et la vie culturelle de la Seine-Saint-Denis. Ses images des débuts du hip-hop français nous placent au milieu des danseurs, des DJ et du public qui ont contribué à façonner ce mouvement.",
    bio: [
      "Originaire de Guadeloupe, Willy Vainqueur arrive à Aubervilliers au milieu des années 1970 et étudie la photographie à l’université Paris 13. La ville devient un territoire essentiel de son travail : il y documente le quotidien, les expressions culturelles et les personnes qui les font vivre.",
      "Lors de Fêtes et Forts, en 1984 et 1985, son appareil saisit les jeunes danseurs et musiciens réunis au Fort d’Aubervilliers. Ces photographies conservent les gestes, les visages et l’énergie collective des débuts du hip-hop en France.",
      "Sa pratique documentaire dépasse le cadre de la musique. Les rencontres humaines et la mémoire des lieux restent au cœur de son travail. Il a également collaboré avec le Printemps de Bourges et Villes des Musiques du Monde.",
    ],
    facts: [
      { label: "Ancrages", value: "Guadeloupe · Aubervilliers" },
      { label: "Pratique", value: "Photographie documentaire" },
      { label: "Série emblématique", value: "Fêtes et Forts, 1984–1985" },
    ],
    sourceLabels: [
      "The Red Bulletin — entretien et portfolio",
      "Seine-Saint-Denis — les origines du hip-hop français",
      "Archives d’Aubervilliers — biographie du photographe",
    ],
  },
};

const artworkCache = new WeakMap();
const photographerCache = new WeakMap();

export function localizeArtwork(artwork, language) {
  if (!artwork || language !== "fr") return artwork;
  if (artworkCache.has(artwork)) return artworkCache.get(artwork);
  const translation = artworkFrench[artwork.id];
  if (!translation) return artwork;
  const localized = {
    ...artwork,
    ...translation,
    medium: mediumFrench[artwork.medium] ?? artwork.medium,
    formats: artwork.formats.map((format) => formatFrench[format] ?? format),
  };
  artworkCache.set(artwork, localized);
  return localized;
}

export function localizePhotographer(photographer, language) {
  if (!photographer || language !== "fr") return photographer;
  if (photographerCache.has(photographer)) return photographerCache.get(photographer);
  const translation = photographerFrench[photographer.id];
  if (!translation) return photographer;
  const { sourceLabels, ...copy } = translation;
  const localized = {
    ...photographer,
    ...copy,
    sources: photographer.sources.map((source, index) => ({
      ...source,
      label: sourceLabels[index] ?? source.label,
    })),
  };
  photographerCache.set(photographer, localized);
  return localized;
}
