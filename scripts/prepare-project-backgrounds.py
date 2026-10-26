"""Prepare licensed Pexels footage for the portfolio film compositor.

Downloaded originals stay in tmp/project-film-edit/stock. The small, silent
working clips and their provenance are kept in state/project-film-backgrounds.
"""
from pathlib import Path
import hashlib
import json
import subprocess

ROOT=Path(__file__).resolve().parent.parent
STOCK=ROOT/'tmp/project-film-edit/stock'
OUT=ROOT/'state/project-film-backgrounds'
CLIPS={
 'zero-touch-ai': (3255275,'office2.mp4','People in a meeting','fauxels','people-in-a-meeting', 'eq=saturation=0.65:brightness=-0.07,colorbalance=rs=0.025:bs=-0.025'),
 'padel-booking': (33444758,'pexels-33444758.mp4','Aerial View of Exciting Padel Match','UsaOne Ell','aerial-view-of-exciting-padel-match', 'hue=h=-28,eq=saturation=0.62:brightness=-0.09,colorbalance=bs=-0.025'),
 'twitch-live': (33230268,'pexels-33230268.mp4','Dynamic Coding Workspace with RGB Lighting','Jakub Zerdzicki','dynamic-coding-workspace-with-rgb-lighting','colorchannelmixer=rr=0.15:rg=0.25:rb=0.6:gr=0.45:gg=0.45:gb=0.1:br=0.55:bg=0.15:bb=0.3,eq=saturation=0.72:brightness=0.025'),
 'usb-extraction': (5474330,'pexels-5474330.mp4','Person Inserting Flash Drive on the Laptop','cottonbro studio','person-inserting-flash-drive-on-the-laptop','eq=saturation=0.5:brightness=-0.20,colorbalance=gs=0.025:bs=0.02'),
 'remote-pc-bridge': (31203651,'pexels-31203651.mp4','Modern Desktop Setup with Dual Screens and Purple Tone','digeam','modern-desktop-setup-with-dual-screens-and-purple-tone','eq=saturation=0.70:brightness=-0.10'),
}

OUT.mkdir(parents=True,exist_ok=True)
manifest={}
for slug,(id,filename,title,author,urlslug,grade) in CLIPS.items():
 source=STOCK/filename;target=OUT/f'{slug}.mp4'
 if not source.exists():raise FileNotFoundError(source)
 if not target.exists():
  # A slow forward/reverse cycle prevents a visible jump when the background loops.
  graph=(f'[0:v]fps=30,scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,'
         f'{grade},gblur=sigma=1.5,split=2[f][r];[f]setpts=1.25*(PTS-STARTPTS)[forward];'
         '[r]reverse,setpts=1.25*(PTS-STARTPTS)[backward];[forward][backward]concat=n=2:v=1:a=0[v]')
  subprocess.run(['ffmpeg','-v','error','-n','-i',str(source),'-filter_complex_threads','2',
                  '-filter_complex',graph,'-map','[v]','-an','-r','30','-c:v','libx264',
                  '-threads','4','-crf','23','-preset','medium','-pix_fmt','yuv420p',
                  '-movflags','+faststart',str(target)],check=True)
 metadata=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(source)]))
 manifest[slug]={'title':title,'creator':author,'source':f'https://www.pexels.com/video/{urlslug}-{id}/',
                 'download':f'https://www.pexels.com/download/video/{id}/','license':'https://www.pexels.com/license/',
                 'downloaded':'2026-10-26','sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
                 'sourceDimensions':[metadata['streams'][0]['width'],metadata['streams'][0]['height']],
                 'workingClip':target.name,'treatment':grade+',gblur=sigma=1.5; playback 0.8x; mirrored temporal loop'}
 print(f'{slug}: {target.stat().st_size/1048576:.2f} MB',flush=True)
(OUT/'sources.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
