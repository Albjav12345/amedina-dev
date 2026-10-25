# DataCraft media sources

The project is maintained in `portfolio-master.xlsx` as project 7. Its copy follows the package README and the commercial listing rather than the older trailer planning documents.

- Demo: the YouTube video already embedded in the [public itch.io listing](https://albjav12345.itch.io/datacraft), `Uqpto9OyuA0`. A local copy of that same published video is stored at `public/assets/projects/datacraft-demo.mp4` and registered as `datacraft-video` in ASSETS. No archived workprint has been substituted for the published demo.
- Playback: `demoType=video` uses the native player. The existing media pipeline generates a silent 640 × 360, 18 fps, 4.2-second idle preview and a separate detail video up to 1280 pixels wide. The source MP4 is pruned from the production build; only the derived videos are served. The original YouTube embed URL remains in the workbook for reference or switching players later.
- Gallery cover: the author's supplied `DataCraft-Marketing-1950x1300.png`, from the Unity Asset Store marketing media dated 2026-10-22. Its WebP export replaces `cover.webp`; the workbook's `datacraft-cover` asset reference stays the same. Gallery cards use cover sizing to fill the media area without letterboxing, with the image anchored at the upper left to keep the brand visible on narrow screens.
- Eight screenshots: `itch-release-20261023/03-Galeria/02-Visual-authoring.png` through `09-Flexible-workspace.png`, in the same order as the prepared commercial gallery.
- Symbol: the original `DataCraft-symbol.svg` from the polished art direction's branding sources, copied without redrawing it.
- Web images: WebP exports at up to 1920 pixels wide, preserving aspect ratios. The detail viewer uses `object-fit: contain`; full-size links open the web exports.
- Store icons: itch.io and Unity SVG paths from the site's existing Simple Icons dependency. Unity Asset Store is marked “Coming soon” until its public product URL is available.

All project-specific text is editable in the master workbook: PROJECTS holds the title, subtitle, problem/solution, card badge, store links and media references; PROJECT_STACK holds the technologies; PROJECT_ARCH holds workflow titles and steps; ASSETS holds paths, image captions and alternative text. Workflow groups are shown as tabs, preserving every step without stacking all the groups vertically. Shared UI labels and layout styles live in the React components and CSS.

To activate the Unity listing later, fill `PROJECTS.assetStoreLink` and turn off `assetStoreComingSoon`, then run `npm run content:sync`.
