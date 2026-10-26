// Presentation edits of the existing recordings. Matching the original source
// makes a new video selected in the workbook take precedence automatically.
const editedFilms = new Map([
  ['zero-touch-ai', 4.0],
  ['padel-booking', 0.4, 'studio-v6'],
  ['twitch-live', 0.0],
  ['usb-extraction', 0.0],
  ['remote-pc-bridge', 0.0],
].map(([slug, previewStart, version = 'studio-v4']) => [
  `/assets/projects/${slug}.mp4`,
  {
    videoSource: `/assets/projects/refined/${slug}-${version}.mp4`,
    thumbnail: `/assets/projects/refined/${slug}-${version}.webp`,
    previewStart,
    editedPresentation: true,
  },
]));

export function withProjectFilmEdit(project) {
  const edit = editedFilms.get(project.videoSource);
  return edit ? { ...project, ...edit } : project;
}
