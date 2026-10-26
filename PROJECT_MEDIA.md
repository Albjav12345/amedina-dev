# Project film presentation

Five flattened recordings have a separate presentation edit in
`public/assets/projects/refined/`. The original videos and covers are preserved.
DataCraft and Unity Interface Systems keep their original media and presentation.

`scripts/edit-project-films.py` composites defocused stock footage and window shells, crops
the real interfaces from the recordings, and exports 1280 × 720 H.264/AAC films
and matching WebP covers. No interfaces, text or features are invented. Music is
the audio already embedded in each supplied recording, measured individually
and adjusted to approximately -20 LUFS, with short fades. Remote PC Bridge keeps
the hardware shot, replacing the baked transition with a clean cut and short
audio ramps. The USB edit recovers the original scrolling glyphs and syntax
colours with RGB high-pass subtraction, suppressing its baked blurred photo.
Its words and scroll movement are taken from the recording.

The complete window shells are centred vertically, including the title bars
and phone bezels. Their sizes and horizontal arrangement are preserved. Title
bars use red, yellow and green traffic-light controls. A 12px Gaussian blur is
applied to the background footage alone; the interfaces remain sharp. The footage
still fills the gallery and detail player without side extensions.

Padel alone adds a centred 100% → 128% zoom to the moving background over
the demo. The windows are composited afterwards, preserving their sizes and
positions; background defocus and the existing soundtrack are preserved.

Background footage is in `state/project-film-backgrounds`. Every original URL,
creator, source hash and treatment is recorded in `sources.json`. These five
working clips are silent and are not copied into the production site. They are
Pexels clips used under the [Pexels license](https://www.pexels.com/license/):

- Inbox: [People in a meeting — fauxels](https://www.pexels.com/video/people-in-a-meeting-3255275/)
- Padel: [Aerial View of Exciting Padel Match — UsaOne Ell](https://www.pexels.com/video/aerial-view-of-exciting-padel-match-33444758/)
- Twitch: [Dynamic Coding Workspace with RGB Lighting — Jakub Zerdzicki](https://www.pexels.com/video/dynamic-coding-workspace-with-rgb-lighting-33230268/)
- USB: [Person Inserting Flash Drive on the Laptop — cottonbro studio](https://www.pexels.com/video/person-inserting-flash-drive-on-the-laptop-5474330/)
- Remote PC: [Modern Desktop Setup with Dual Screens and Purple Tone — digeam](https://www.pexels.com/video/modern-desktop-setup-with-dual-screens-and-purple-tone-31203651/)

`scripts/prepare-project-backgrounds.py` prepares the downloaded sources from
`tmp/project-film-edit/stock`. It applies a 1.5px Gaussian softening at 1280px,
restrained colour grading and a slow forward/reverse cycle for continuous motion.

Run on Windows with Pillow, FFmpeg and FFprobe installed:

```powershell
py -3 scripts/edit-project-films.py
# Or one recording:
py -3 scripts/edit-project-films.py padel-booking
```

Exports refuse to overwrite an existing film. Move an old export out of the
destination for a local revision, or bump `VERSION` and the matching paths in
`scripts/lib/project-film-edits.mjs`. Temporary masks, filter graphs and audio
measurements stay in the ignored `tmp/project-film-edit` directory.

The media pipeline applies these edits only while the workbook still selects
the matching original video path. Selecting a different video in ASSETS takes
precedence. `npm run build` derives silent six-second 640px previews at 24 fps,
1280px detail encodes, and responsive wall covers. Refined masters are omitted
from the production build; their derived detail encodes are shipped instead.

Edited gallery media fills the card with `object-fit: cover` and aligns to the
top. There are no backdrop extensions or colour-filled side bands. The detail
player also fills its frame and aligns to the top. The internal window shells
are inset within the footage. Original projects keep their existing gallery treatment.
