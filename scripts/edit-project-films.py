"""Rebuild portfolio films from the delivered, flattened recordings.

Run with py -3 scripts/edit-project-films.py [slug ...]. Requires Pillow,
ffmpeg and ffprobe. Originals are read-only. Staging files, measurements and
review frames live in tmp/project-film-edit; finished assets are versioned.
Licensed background clips and their provenance live in state/project-film-backgrounds.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'public/assets/projects'
OUT = SOURCE / 'refined'
WORK = ROOT / 'tmp/project-film-edit'
FONT = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 13)
VERSION = 'studio-v4'
BACKGROUND_BLUR_SIGMA = 12
# Coordinates refer to the original flattened recordings, not browser mocks.
EDITS = {
    'zero-touch-ai': dict(start=.35, end=23.1, poster=22.0,
        windows=[dict(crop=[100,90,1188,588], box=[160,136,960,476], label='ZeroTouch AI', light=True)]),
    'padel-booking': dict(start=1.8, end=19.6, poster=3.5, version='studio-v6', backgroundZoom=0.28,
        windows=[dict(crop=[122,98,406,886], box=[178,104,252,550], phone=True),
                 dict(crop=[862,240,640,616], box=[512,122,570,548], label='Padel / Web', light=True)]),
    'twitch-live': dict(start=.15, end=16.2, poster=12.4,
        windows=[dict(crop=[672,80,572,916], box=[468,112,344,550], label='Fortnite Stream Finder')]),
    'usb-extraction': dict(start=.25, end=9.75, poster=.95,
        windows=[dict(crop=[0,0,1280,720], box=[128,104,1024,576], label='USB Backup Agent / PowerShell', grade=True)]),
    'remote-pc-bridge': dict(start=.15, end=6.9, poster=.4,
        windows=[dict(crop=[392,56,816,504], box=[190,96,900,556], label='Remote PC Bridge')]),
}

# Centre the complete shell, including its title bar / phone bezel. Keep the
# capture dimensions and horizontal arrangement exactly as in the prior edit.
for spec in EDITS.values():
    for window in spec['windows']:
        top, bottom = (10, 9) if window.get('phone') else (28, 1)
        window['box'][1] = (720 - window['box'][3] + top - bottom + 1) // 2


def run(args):
    result = subprocess.run([str(a) for a in args], capture_output=True, text=True, encoding='utf-8', errors='replace')
    if result.returncode:
        raise RuntimeError(result.stderr[-9000:])
    return result


def stage(slug, spec):
    # Transparent window shell; the background blur is applied below this layer.
    im = Image.new('RGBA', (1280,720), (0,0,0,0))
    for idx,w in enumerate(spec['windows']):
        x,y,width,height=w['box']
        phone=w.get('phone',False)
        top=10 if phone else 28
        pad=9 if phone else 1
        bounds=(x-pad,y-top,x+width+pad,y+height+pad)
        radius=28 if phone else 13
        shadow=Image.new('RGBA',im.size)
        d=ImageDraw.Draw(shadow)
        d.rounded_rectangle((bounds[0]-6,bounds[1]+15,bounds[2]+6,bounds[3]+19),radius+6,fill=(0,0,0,95))
        im=Image.alpha_composite(im,shadow.filter(ImageFilter.GaussianBlur(12)))
        d=ImageDraw.Draw(im)
        light=w.get('light',False)
        fill=(232,231,232,255) if light else (17,25,33,255)
        d.rounded_rectangle(bounds,radius,fill=fill,outline=(255,255,255,70),width=1)
        if not phone:
            for dot, color in enumerate(((255,95,87,255), (254,188,46,255), (40,200,64,255))):
                indicator=Image.new('RGBA',(36,36),(0,0,0,0))
                ImageDraw.Draw(indicator).ellipse((0,0,35,35),fill=color)
                indicator=indicator.resize((9,9),Image.Resampling.LANCZOS)
                im.alpha_composite(indicator,(x+14+dot*15,y-19))
            title=w.get('label','')
            tw=d.textlength(title,font=FONT)
            d.text((x+(width-tw)/2,y-24),title,font=FONT,fill=(79,84,92,255) if light else (180,193,204,255))
        mask=Image.new('L',(width,height),0)
        md=ImageDraw.Draw(mask)
        md.rounded_rectangle((0,-12,width-1,height-1),10 if not phone else 17,fill=255)
        if phone:
            md.rounded_rectangle((0,0,width-1,height-1),19,fill=255)
        mask.save(WORK/f'{slug}-mask-{idx}.png')
    im.save(WORK/f'{slug}-stage.png')


def edit(slug, spec):
    stage(slug,spec)
    version=spec.get('version',VERSION)
    output=OUT/f'{slug}-{version}.mp4'
    if output.exists():
        raise FileExistsError(f'Refusing to overwrite {output}; bump VERSION or move the previous export for a revision.')
    source=SOURCE/f'{slug}.mp4'
    length=spec['end']-spec['start']
    remote=slug=='remote-pc-bridge'
    # Replace the baked-in half-second ghosting with a clean hardware cut.
    if remote:
        length += 11.05-7.95
    args=['ffmpeg','-hide_banner','-v','warning','-n','-threads','4',
          '-t',str(11.1 if remote else spec['end']+.1),'-i',source,
          '-loop','1','-framerate','30','-t',str(length),'-i',WORK/f'{slug}-stage.png']
    for i in range(len(spec['windows'])):
        args += ['-loop','1','-framerate','30','-t',str(length),'-i',WORK/f'{slug}-mask-{i}.png']
    background=ROOT/'state/project-film-backgrounds'/f'{slug}.mp4'
    if not background.exists():
        raise FileNotFoundError(f'Prepare background footage first: {background}')
    background_index=2+len(spec['windows'])
    args += ['-t',str(length),'-i',background]
    graph=[]
    graph.append(f'[0:v]trim=start={spec["start"]}:end={spec["end"]},setpts=PTS-STARTPTS,fps=30,setsar=1,split={len(spec["windows"])}'+''.join(f'[src{i}]' for i in range(len(spec['windows']))) if len(spec['windows'])>1 else f'[0:v]trim=start={spec["start"]}:end={spec["end"]},setpts=PTS-STARTPTS,fps=30,setsar=1[src0]')
    background_motion=''
    if spec.get('backgroundZoom'):
        # One output frame per input frame: a progressive centred push-in on the
        # moving background. Supersampling avoids visible crop steps. Window
        # shells and application captures are composited after this transform.
        last_frame=max(1,round(length*30)-1)
        background_motion=(f"scale=2560:1440:flags=lanczos,zoompan=z='1+{spec['backgroundZoom']}*min(on/{last_frame},1)'"
                           ":x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1280x720:fps=30,")
    graph += [f'[{background_index}:v]setpts=PTS-STARTPTS,{background_motion}gblur=sigma={BACKGROUND_BLUR_SIGMA}:steps=2,format=rgba[scene]',
              '[1:v]format=rgba[shell]',
              '[scene][shell]overlay=0:0:shortest=1[backgroundstage]']
    if remote:
        graph.append('[backgroundstage]split=2[base][hardwarebackground]')
    else:
        graph.append('[backgroundstage]null[base]')
    previous='base'
    for i,w in enumerate(spec['windows']):
        cx,cy,cw,ch=w['crop'];x,y,width,height=w['box']
        if w.get('grade'):
            # Recover crisp glyphs from the flattened USB film, rejecting the
            # low-frequency blurred photograph baked behind the scrolling code.
            # RGB subtraction retains the original syntax colours and wording.
            graph += [f'[src{i}]crop={cw}:{ch}:{cx}:{cy},scale={width}:{height}:flags=lanczos,format=rgb24,split=3[pixels{i}][hard{i}][soft{i}]',
                      f'[soft{i}]gblur=sigma=5[low{i}]',
                      f'[hard{i}][low{i}]blend=all_mode=subtract,format=gray,lut=y=\'clip((val-4)*24,0,255)\'[inkmask{i}]',
                      f'[{i+2}:v]format=gray[rounded{i}]',
                      f'[inkmask{i}][rounded{i}]blend=all_mode=multiply[mask{i}]']
        else:
            graph += [f'[src{i}]crop={cw}:{ch}:{cx}:{cy},scale={width}:{height}:flags=lanczos,unsharp=3:3:0.25:3:3:0,format=rgba[pixels{i}]',
                      f'[{i+2}:v]format=gray[mask{i}]']
        graph += [f'[pixels{i}][mask{i}]alphamerge=shortest=1[window{i}]',
                  f'[{previous}][window{i}]overlay={x}:{y}:shortest=1[composite{i}]']
        previous=f'composite{i}'
    if remote:
        # Hardware footage is already in the flattened source; crop away its old border.
        graph += ['[0:v]trim=start=7.95:end=11.05,setpts=PTS-STARTPTS,fps=30,setsar=1,crop=1052:650:114:36,scale=900:556:flags=lanczos[hardware]',
                  '[hardwarebackground]trim=start=6.75:end=9.85,setpts=PTS-STARTPTS[hardwarebase]',
                  '[hardwarebase][hardware]overlay=190:96:shortest=1[hardwarestage]',
                  f'[{previous}]format=yuv420p[appstage]',
                  '[hardwarestage]format=yuv420p[hardwarefinal]',
                  '[appstage][hardwarefinal]concat=n=2:v=1:a=0[edited]',
                  f'[0:a]atrim=start={spec["start"]}:end={spec["end"]},asetpts=PTS-STARTPTS,afade=t=out:st={spec["end"]-spec["start"]-.012}:d=0.012[a0]',
                  '[0:a]atrim=start=7.95:end=11.05,asetpts=PTS-STARTPTS,afade=t=in:d=0.012[a1]',
                  '[a0][a1]concat=n=2:v=0:a=1[audioedit]']
        previous='edited'
        audio='[audioedit]'
    else:
        graph += [f'[0:a]atrim=start={spec["start"]}:end={spec["end"]},asetpts=PTS-STARTPTS[audioedit]']
        audio='[audioedit]'
    graph += [f'[{previous}]format=yuv420p[v]',f'{audio}afade=t=in:d=0.18,afade=t=out:st={length-.35}:d=0.35[a]']
    graphtext=';\n'.join(graph)
    (WORK/f'{slug}-filter.txt').write_text(graphtext,encoding='utf-8')
    # Measure this exact edit before applying a conservative music level.
    audio_graph=';'.join(g for g in graph if g.startswith('[0:a]') or g.startswith('[a0]') or g.startswith('[audioedit]'))
    # A separate audio pass keeps graphics processing out of loudness analysis.
    audio_args=['ffmpeg','-hide_banner','-v','info','-i',source,'-filter_complex',audio_graph+';[a]loudnorm=I=-20:TP=-2:LRA=11:print_format=json[measured]','-map','[measured]','-f','null','-']
    measured=run(audio_args)
    report=json.loads(re.search(r'\{\s*"input_i".*?\}',measured.stderr,re.S).group())
    (WORK/f'{slug}-loudness.json').write_text(json.dumps(report,indent=2))
    norm=(f'loudnorm=I=-20:TP=-2:LRA=11:measured_I={report["input_i"]}:measured_TP={report["input_tp"]}:'
          f'measured_LRA={report["input_lra"]}:measured_thresh={report["input_thresh"]}:offset={report["target_offset"]}:linear=true')
    if report['input_i'] != '-inf':
        graph[-1]=graph[-1].replace('[a]',f',{norm}[a]')
    args += ['-filter_complex_threads','2','-filter_complex',';'.join(graph),'-map','[v]','-map','[a]',
             '-t',length,'-c:v','libx264','-threads','4','-preset','medium','-crf','18',
             '-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-ar','48000','-movflags','+faststart',output]
    print(f'Rendering {slug}: {length:.2f}s',flush=True)
    run(args)
    run(['ffmpeg','-v','error','-xerror','-i',output,'-f','null','-'])
    poster=OUT/f'{slug}-{version}.webp'
    run(['ffmpeg','-v','error','-n','-ss',spec['poster'],'-i',output,'-frames:v','1','-c:v','libwebp','-quality','92',poster])
    print(f'Validated {slug}: {output.stat().st_size/1024/1024:.2f} MB',flush=True)


if __name__=='__main__':
    OUT.mkdir(parents=True,exist_ok=True)
    WORK.mkdir(parents=True,exist_ok=True)
    for slug in sys.argv[1:] or EDITS:
        edit(slug,EDITS[slug])
