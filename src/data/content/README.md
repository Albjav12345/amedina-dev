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

Asset modes:

- `existing_public`: keep an asset already inside `public/`
- `import_local`: copy a local file into `public/`
- `external_url`: point directly to a public URL

