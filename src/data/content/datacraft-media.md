# DataCraft media sources

The project is maintained in `portfolio-master.xlsx` as project 7. Its copy follows the package README and the commercial listing rather than the older trailer planning documents.

- Demo: [Datacraft Video V2](https://youtu.be/zdBUlh_PtRc) plays through the YouTube embed configured in PROJECTS. The player starts when the visitor selects the play button on the supplied video poster.
- Idle preview: `public/assets/projects/datacraft-demo-v2.mp4` is a silent gameplay clip from the supplied V2 recording, registered as `datacraft-video` in ASSETS. The media pipeline generates the 640 × 360, 18 fps, 4.2-second preview. The accompanying `datacraft-demo-v2.poster.webp` is the video cover used in the project detail and demo thumbnail.
- Gallery cover: the author's supplied `DataCraft-Marketing-1950x1300.png`, from the Unity Asset Store marketing media dated 2026-10-22. Its WebP export replaces `cover.webp`; the workbook's `datacraft-cover` asset reference stays the same. Gallery cards use cover sizing to fill the media area without letterboxing, with the image anchored at the upper left to keep the brand visible on narrow screens.
- Eight screenshots: `itch-release-20261023/03-Galeria/02-Visual-authoring.png` through `09-Flexible-workspace.png`, in the same order as the prepared commercial gallery.
- Symbol: the original `DataCraft-symbol.svg` from the polished art direction's branding sources, copied without redrawing it.
- Web images: WebP exports at up to 1920 pixels wide, preserving aspect ratios. The detail viewer uses `object-fit: contain`; full-size links open the web exports.
- Store icons: itch.io and Unity SVG paths from the site's existing Simple Icons dependency. The DataCraft project links to its [Unity Asset Store listing](https://assetstore.unity.com/packages/tools/datacraft-visual-json-tools-7396611).

All project-specific text is editable in the master workbook: PROJECTS holds the title, subtitle, problem/solution, card badge, store links and media references; PROJECT_STACK holds the technologies; PROJECT_ARCH holds workflow titles and steps; ASSETS holds paths, image captions and alternative text. Workflow groups are shown as tabs, preserving every step without stacking all the groups vertically. Shared UI labels and layout styles live in the React components and CSS.

To update store availability, edit `PROJECTS.assetStoreLink` and `assetStoreComingSoon`, then run `npm run content:sync`.
