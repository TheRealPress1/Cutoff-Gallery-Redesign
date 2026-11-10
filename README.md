# Cut Off Gallery — Sound. Still.

An interactive gallery concept built with React, Vite, and Three.js.

## Run

```sh
npm install
npm run dev
```

Open the printed preview address. If `localhost` resolves to another local server, use `http://127.0.0.1:5173`.

```sh
npm test
npm run build
npm run preview
```

The production site is static and is emitted to `dist/`.

## Client preview deployment

Live preview: https://cutoff-gallery-redesign.vercel.app

Vercel project: https://vercel.com/timetospammyline-7173s-projects/cutoff-gallery-redesign

The workspace is linked to this project through the gitignored `.vercel/` directory. The first deployment was published directly from this workspace; Git-based automatic deployments have not been configured. To publish the latest local changes at the same address:

```sh
vercel deploy --prod --scope timetospammyline-7173s-projects
```

`vercel.json` sets the Vite build and `dist` output. `.vercelignore` excludes local context, attachments, and generated files from uploads. No environment variables are needed.

## Experience

- French is the default on every fresh page load. The French/US flag control switches languages through a brief spinning globe animation, updating interface text, artwork descriptions, photographer biographies, print controls, accessibility labels, and inquiry templates without leaving the current view. Separate inquiry messages and subjects preserve edits in each language.
- A hexagonal 3D museum room with six framed photographs, individual spotlights, and smooth camera navigation. Dark mode retains the original stone floor and subtle radial seams. Light mode has natural oak floorboards, fine wood grain, and staggered joints. The moon/sun control animates between dark and warm cream surroundings with a soft chalk ceiling, while preserving the photographs’ lighting, colors, and camera position. Dark mode is the default for a first visit. The selected theme follows every screen: the collection, photographer profiles, print studio, About, and inquiry composer. It is remembered on refresh when browser storage is available. Theme and language controls sit on the right of each header or dialog; the expand/restore button brings the main navigation bar back when leaving immersive view.
- Click a photograph or its museum label to approach it in the room. Its physical frame stays in 3D on the left, with the story, photographer, edition, paper, and dimensions alongside it. On phones, the wall label sits below the work.
- Click a detail in the focused photograph to magnify it 2.5× inside the same frame. A magnifying-glass button appears at the photograph’s top-right on hover or keyboard focus, and stays visible on touchscreens. Drag to inspect the original image; the frame, wall, camera, and information panel stay fixed. The zoom-out icon, Escape, Down arrow, or a zoom-out gesture restores the whole photograph. Zoom and pan stay inside the image boundaries, with smooth reversible transitions and reduced-motion support.
- “Explore the print” opens a separate studio view with front, left, and right frame perspectives. The angled frame is a visualization, not additional product photography.
- Choose “A closer look” in the studio view, then drag the enlarged photograph to inspect its details. The focused image also supports arrow-key panning. Closing the studio returns to the same place in the room.
- On desktop, drag horizontally to turn freely through 360° around the room. Click any visible photograph from any angle to approach it. The wall label and navigation follow the work you are looking toward; arrows move to the adjacent photograph.
- The keyboard’s left/right arrows move between photographs; up approaches the currently viewed work, then magnifies its details. Down steps back through the same views to the room. These gallery shortcuts leave open dialogs and editable fields alone.
- On touchscreens, swipe left for the next photograph or right for the previous one. Each completed horizontal swipe snaps to one adjacent work, including while inspecting the full framed photograph; the camera stays still under your finger. After tapping to magnify, one-finger drags pan inside the photo instead. Vertical scrolling in the information panel remains native.
- Phone rendering uses native screen resolution up to 3×, bounded to four million drawing pixels. The source photographs stay unchanged; higher rendering resolution adds no image download weight.
- Pinch or scroll down over a photograph to approach it, then magnify a detail. Pinching out or scrolling up restores the whole photo first, then returns to the room. Each gesture advances one level. The artwork information panel keeps its normal scrolling.
- Two-finger horizontal trackpad scrolling moves to the previous or next photograph, using the same transition as the keyboard arrows. Each gesture advances once, including its momentum, and keeps the focused view open when inspecting a work.
- All five photographers’ portraits and credits open dedicated profiles: Willy Vainqueur, Denis Rouvre, Cyril Villemain, David Dahan, and Romain Bourven. Routes use `#/photographers/` followed by the photographer’s slug (for example, `david-dahan` or `romain-bourven`), with sourced text in French and English and their gallery work. Browser Back and the page’s back action restore the previous viewing context.
- “Step closer” and immersive view. The expand/restore button sits first in the artwork navigation controls, including on phones.
- Accessible collection grid, responsive artwork dialogs, and reduced motion support.
- About is a full editorial page at `#/about`, with the gallery’s original story, credited photography, the 30-print edition model, and a contact action. It shares the main navigation, animated underline, language, and theme controls. Main-page routes support direct links, refresh, and browser Back/Forward; the collection is at `#/collection`.
- A full-screen inquiry composer with editable message, subject, signature, and a clipped photograph of the selected work. It opens a prefilled draft in the visitor’s email app; the visitor reviews and sends it there. A copy action provides a fallback. No messages are sent automatically.
- WebGL fallback and rendering only when the scene changes.

## Content

The original Cut Off Gallery wordmark is sourced from the existing gallery site's header, stored in `public/brand/cutoff-gallery.png`, and displayed in white against the dark headers.

Actual gallery photographs and credits are in `src/data/artworks.js`; assets are hosted locally in `public/artworks/`. Each record links to its original gallery entry. Photography remains the property of its respective rights holders.

Photographer profiles, biographical sources, and portrait credits are in `src/data/photographers.js`, with French copy in `src/data/translations.js`. Willy Vainqueur’s portrait is the photograph credited to him in The Red Bulletin interview linked on his profile. Denis Rouvre’s portrait is the black-and-white collage from his World Press Photo profile; that page does not identify its creator, so its caption identifies the source without assigning copyright. Cyril Villemain, David Dahan, and Romain Bourven’s portraits were selected and supplied by the user; no unverified photographer credits are assigned. David’s selected cover image was subsequently replaced with the identical 1440 × 1440 version published on [Apple Music](https://music.apple.com/us/song/775146417), replacing the 480 × 480 upload. David’s profile focuses on his Phoenix photograph because the original gallery entry has no usable biography. Assets are in `public/photographers/`, with individual avatar crops.

The concept follows the requested **30 prints per edition** model. The existing gallery lists different edition sizes by work (10–25, plus artist proofs); those are retained as `sourceEdition` and `artistProofs`. Confirm the edition model before production. The Kendrick product's visible heading says 2015 while its URL and listing say 2014; the concept follows the product heading.

Pricing and remaining stock are deliberately not invented. Availability, shipping, and acquisition are handled by the existing gallery contact channel.

The temporary inquiry inbox, supplied by the user, is configured in `src/data/contact.js`. The email draft includes the selected work’s title, photographer, year, and original gallery link. The on-screen photograph is visual context; `mailto:` cannot attach an image automatically. No email service, backend, or API key is required for this flow.
