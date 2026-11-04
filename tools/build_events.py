#!/usr/bin/env python3
"""Render data/events.json into the Speaking & Media section of index.html.

Usage: python3 tools/build_events.py

Each event in data/events.json may define:
  id, date (YYYY, YYYY-MM or YYYY-MM-DD), approx (show month only), type (talk|media|publication|award),
  role/title/sub/place/note as {"en": ..., "es": ...}, links [{href, label{en,es}}],
  image (file name in assets/media/events without extension; an "-sm" variant is used for cards),
  video {id, start} (YouTube) and featured (shown in the carousel).
"""
import html
import json
import os
import re
from collections import Counter, OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data', 'events.json')
INDEX = os.path.join(ROOT, 'index.html')
START, END = '<!-- EVENTS:START -->', '<!-- EVENTS:END -->'
OPEN_YEARS = 3

MONTHS = {
    'en': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    'es': ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'],
}


def esc(s):
    return html.escape(s, quote=True)


def bi(d, tag='span'):
    """Bilingual text: a single node when both languages match."""
    if d is None:
        return ''
    en, es = d.get('en', ''), d.get('es', '')
    if en == es:
        return esc(en)
    return f'<{tag} class="l-en" lang="en">{esc(en)}</{tag}><{tag} class="l-es" lang="es">{esc(es)}</{tag}>'


def fmt_date(date, approx, lang):
    parts = date.split('-')
    if len(parts) == 1:
        return parts[0]
    month = MONTHS[lang][int(parts[1]) - 1]
    if len(parts) == 2 or approx:
        return f'{month} {parts[0]}'
    return f'{int(parts[2])} {month} {parts[0]}'


def date_html(ev):
    en = fmt_date(ev['date'], ev.get('approx'), 'en')
    es = fmt_date(ev['date'], ev.get('approx'), 'es')
    return f'<time datetime="{esc(ev["date"])}">{bi({"en": en, "es": es})}</time>'


def media_attrs(ev):
    attrs = {}
    if ev.get('image'):
        attrs['data-full'] = f'assets/media/events/{ev["image"]}.jpg'
    elif ev.get('video'):
        attrs['data-full'] = f'assets/media/yt/{ev["video"]["id"]}.jpg'
    if ev.get('video'):
        attrs['data-video'] = ev['video']['id']
        if ev['video'].get('start'):
            attrs['data-start'] = str(ev['video']['start'])
    return attrs


def thumb(ev, size='sm'):
    suffix = '-sm' if size == 'sm' else ''
    if ev.get('image'):
        return f'assets/media/events/{ev["image"]}{suffix}.jpg'
    if ev.get('video'):
        return f'assets/media/yt/{ev["video"]["id"]}{suffix}.jpg'
    return None


def links_html(ev):
    out = []
    for link in ev.get('links', []):
        out.append(f'<a class="ev-link" href="{esc(link["href"])}" target="_blank" rel="noopener">'
                   f'{bi(link["label"])} <span aria-hidden="true">↗</span></a>')
    return ''.join(out)


def media_button(ev, size, cls):
    src = thumb(ev, size)
    if not src:
        return ''
    attrs = ' '.join(f'{k}="{esc(v)}"' for k, v in media_attrs(ev).items())
    is_video = 'video' in ev
    label_en = ('Play video: ' if is_video else 'Open photo: ') + ev['title']['en']
    label_es = ('Reproducir vídeo: ' if is_video else 'Abrir foto: ') + ev['title']['es']
    play = '<span class="play" aria-hidden="true"></span>' if is_video else ''
    return (f'<button type="button" class="{cls}" data-lightbox {attrs} aria-label="{esc(label_en)}" '
            f'data-label-en="{esc(label_en)}" data-label-es="{esc(label_es)}">'
            f'<img src="{src}" alt="" loading="lazy" decoding="async" />{play}</button>')


def card(ev):
    has_media = bool(ev.get('image') or ev.get('video'))
    classes = ['ev', f'ev--{ev["type"]}', 'has-media' if has_media else 'no-media']
    place = f'<p class="ev-place">{bi(ev["place"])}</p>' if ev.get('place') else ''
    sub = f'<p class="ev-sub">{bi(ev["sub"])}</p>' if ev.get('sub') else ''
    note = f'<p class="ev-note">{bi(ev["note"])}</p>' if ev.get('note') else ''
    links = links_html(ev)
    links = f'<div class="ev-links">{links}</div>' if links else ''
    return (f'<article class="{" ".join(classes)}" data-type="{ev["type"]}" data-video="{1 if ev.get("video") else 0}" '
            f'id="ev-{esc(ev["id"])}">{media_button(ev, "sm", "ev-media")}'
            f'<div class="ev-body"><div class="ev-meta">{date_html(ev)}<span class="ev-role">{bi(ev["role"])}</span></div>'
            f'<h4>{bi(ev["title"])}</h4>{sub}{place}{note}{links}</div></article>')


def row(ev):
    sub = f'<p class="ev-sub">{bi(ev["sub"])}</p>' if ev.get('sub') else ''
    place = f'<span class="ev-place">{bi(ev["place"])}</span>' if ev.get('place') else ''
    links = links_html(ev)
    links = f'<div class="ev-links">{links}</div>' if links else ''
    return (f'<li class="ev ev-row ev--{ev["type"]}" data-type="{ev["type"]}" data-video="0" id="ev-{esc(ev["id"])}">'
            f'<div class="ev-meta">{date_html(ev)}<span class="ev-role">{bi(ev["role"])}</span>{place}</div>'
            f'<div class="ev-row-main"><h4>{bi(ev["title"])}</h4>{sub}</div>{links}</li>')


def slide(ev):
    sub = f'<p>{bi(ev["sub"])}</p>' if ev.get('sub') else ''
    return (f'<article class="slide" data-type="{ev["type"]}">{media_button(ev, "lg", "slide-media")}'
            f'<div class="slide-caption"><div class="ev-meta">{date_html(ev)}<span class="ev-role">{bi(ev["role"])}</span></div>'
            f'<h3>{bi(ev["title"])}</h3>{sub}</div></article>')


def year_body(items):
    visual = [e for e in items if e.get('image') or e.get('video')]
    plain = [e for e in items if not (e.get('image') or e.get('video'))]
    out = ''
    if visual:
        out += f'<div class="ev-grid">{"".join(card(e) for e in visual)}</div>'
    if plain:
        out += f'<ul class="ev-list">{"".join(row(e) for e in plain)}</ul>'
    return out


def build(events):
    events = sorted(events, key=lambda e: e['date'], reverse=True)
    counts = Counter(e['type'] for e in events)
    videos = sum(1 for e in events if e.get('video'))
    years = sorted({e['date'][:4] for e in events})
    stats = [
        (counts['talk'], 'talks, keynotes &amp; panels', 'conferencias, keynotes y mesas'),
        (counts['media'], 'interviews &amp; media', 'entrevistas y medios'),
        (videos, 'videos', 'vídeos'),
        (counts['publication'] + counts['award'], 'publications &amp; awards', 'publicaciones y premios'),
    ]
    stats_html = ''.join(f'<li><b>{n}</b><span class="l-en">{en}</span><span class="l-es">{es}</span></li>' for n, en, es in stats)

    featured = [e for e in events if e.get('featured') and (e.get('image') or e.get('video'))]
    slides = ''.join(slide(e) for e in featured)

    by_year = OrderedDict()
    for e in events:
        by_year.setdefault(e['date'][:4], []).append(e)
    year_html = []
    for i, (year, items) in enumerate(by_year.items()):
        hidden = ' data-collapsed' if i >= OPEN_YEARS else ''
        year_html.append(
            f'<section class="ev-year"{hidden} data-year="{year}"><header class="ev-year-head"><h3>{year}</h3>'
            f'<span class="ev-count">{len(items)}</span></header>'
            f'<div class="ev-year-body">{year_body(items)}</div></section>')

    filters = [('all', 'All', 'Todo'), ('talk', 'Talks &amp; panels', 'Conferencias y mesas'), ('media', 'Media', 'Medios'),
               ('video', 'Videos', 'Vídeos'), ('publication', 'Publications', 'Publicaciones'), ('award', 'Awards', 'Premios')]
    filters_html = ''.join(
        f'<button class="filter{" active" if k == "all" else ""}" data-ev-filter="{k}" aria-pressed="{"true" if k == "all" else "false"}">'
        f'<span class="l-en">{en}</span><span class="l-es">{es}</span></button>' for k, en, es in filters)

    return f'''
      <ul class="ev-stats" data-reveal>{stats_html}<li><b>{years[0]}–{years[-1]}</b><span class="l-en">on stage</span><span class="l-es">en el escenario</span></li></ul>
    </div>

    <div class="carousel" data-carousel data-reveal>
      <div class="carousel-head wrap">
        <h3 class="mini-title"><span class="l-en">Featured</span><span class="l-es">Destacados</span></h3>
        <div class="carousel-nav">
          <button type="button" class="round-btn" data-carousel-prev aria-label="Previous">←</button>
          <button type="button" class="round-btn" data-carousel-next aria-label="Next">→</button>
        </div>
      </div>
      <div class="carousel-track" tabindex="0" aria-label="Featured talks">{slides}</div>
      <div class="carousel-progress wrap" aria-hidden="true"><span></span></div>
    </div>

    <div class="wrap">
      <div class="ev-toolbar" data-reveal>
        <h3 class="mini-title"><span class="l-en">All appearances</span><span class="l-es">Todas las intervenciones</span></h3>
        <div class="filters" role="group" aria-label="Filter">{filters_html}</div>
      </div>
      <div class="ev-years" id="evYears">{"".join(year_html)}</div>
      <div class="center-btns">
        <button type="button" class="btn btn-glass" id="evMore"><span class="l-en">Show earlier years</span><span class="l-es">Ver años anteriores</span></button>
      </div>
'''


def main():
    events = json.load(open(DATA, encoding='utf-8'))
    page = open(INDEX, encoding='utf-8').read()
    if START not in page or END not in page:
        raise SystemExit('Markers not found in index.html')
    block = build(events)
    page = re.sub(re.escape(START) + r'.*?' + re.escape(END), lambda m: START + block + '      ' + END, page, flags=re.S)
    open(INDEX, 'w', encoding='utf-8').write(page)
    print(f'{len(events)} events rendered')


if __name__ == '__main__':
    main()
