# Portfolio Content Workbook

The source of truth for site content is:

- `src/data/content/portfolio-master.xlsx`

Main commands:

```bash
npm run content:init
npm run content:check
npm run content:sync
```

Quick workflow:

1. Edit workbook rows.
2. Run `npm run content:check` if you only want validation.
3. Run `npm run content:sync`.
4. Run `npm run dev` or `npm run build`.

Important:

- `content:init` is only for the first bootstrap. Once the workbook exists, keep editing the Excel file and use `content:sync`.

Project presentation:

- About copy stays in `PROFILE` and `ABOUT_BIO`. `PROFILE.featuredProjectId` selects the project shown under the bio, and `featuredProjectLabel` supplies its caption.

- `PROJECTS.gallerySize`: blank for a standard tile, `feature` for a large tile, `wide` for a landscape tile, or `half` for half a desktop row.
- `PROJECTS.cardLabel`: optional badge text on the gallery tile.
- `githubLink`, `itchLink`, and `assetStoreLink` are optional. Set `assetStoreComingSoon` to TRUE while a Unity listing is pending, then add its public URL when available.
- `galleryAssetIds` lists ASSETS ids in display order, separated by `|`. ASSETS.alt supplies the image descriptions and captions.
- For YouTube demos, choose `demoType=youtube` and put the privacy-enhanced embed URL in `demoEmbedUrl`. Local videos still use `videoAssetId`.
- `videoAssetId` points to the source video in ASSETS. The media pipeline derives a silent 640px gallery preview and a separate 1280px detail video; these generated files should not be edited by hand. Choose `demoType=video` to use the native detail player. A YouTube embed can also retain a local video asset for the idle preview.
- `PROJECT_ARCH.workflow` optionally groups steps into separate workflows. Keep the same group name on each related step; order controls their sequence.

Asset modes:

- `existing_public`: keep an asset already inside `public/` and edit `sourceValue` as the canonical public path
- `import_local`: copy a local file into `public/`
- `external_url`: point directly to a public URL

