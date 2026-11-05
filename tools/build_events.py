#!/usr/bin/env python3
"""Render data/events.json into index.html.

Usage: python3 tools/build_events.py

Generated blocks (between HTML comment markers in index.html):
  EVENTS  talks: featured video carousel, industry filters and talks by year
  MEDIA   press, interviews, podcasts and TV
  AWARDS  awards and recognitions
  PUBS    books, chapters and articles (highlights above the research papers)

Each event in data/events.json may define:
  id, date (YYYY, YYYY-MM or YYYY-MM-DD), approx (show month only), type (talk|media|publication|award),
  role/title/sub/place/note as {"en": ..., "es": ...}, links [{href, label{en,es}}],
  image (file name without extension, in assets/media/events or a sub-folder such as "press/x"; an "-sm" variant is used for cards),
  video {id, start} (YouTube), featured (talks with video shown in the carousel), focus (CSS object-position for the image),
  industries (talks: keys of INDUSTRIES below) and highlight (talks: selected talks from the CV, shown first in the
  carousel with a badge and their own filter; publications: listed first).
"""
import html
import json
import os
import re
from collections import Counter, OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data', 'events.json')
INDEX = os.path.join(ROOT, 'index.html')
OPEN_YEARS = 3

MONTHS = {
    'en': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    'es': ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'],
}

INDUSTRIES = OrderedDict([
    ('financial', ('Financial services', 'Servicios financieros')),
    ('insurance', ('Insurance', 'Seguros')),
    ('hr', ('HR & talent', 'RR. HH. y talento')),
    ('retail', ('Retail & consumer', 'Retail y consumo')),
    ('industry', ('Industry & transport', 'Industria y transporte')),
    ('legal', ('Legal', 'Legal')),
    ('tech', ('Technology', 'Tecnología')),
    ('startups', ('Startups & VC', 'Startups y capital riesgo')),
    ('boards', ('Boards & governance', 'Consejos y gobierno corporativo')),
    ('language', ('Language & culture', 'Lengua y cultura')),
    ('education', ('Education & research', 'Educación e investigación')),
    ('women', ('Women in leadership', 'Mujeres y liderazgo')),
    ('general', ('General', 'General')),
])


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


def bi_raw(en, es):
    return f'<span class="l-en">{en}</span><span class="l-es">{es}</span>'


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


def image_path(ev, suffix=''):
    name = ev['image']
    folder = 'assets/media/' if '/' in name else 'assets/media/events/'
    return f'{folder}{name}{suffix}.jpg'


def media_attrs(ev):
    attrs = {}
    if ev.get('image'):
        attrs['data-full'] = image_path(ev)
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
        return image_path(ev, suffix)
    if ev.get('video'):
        return f'assets/media/yt/{ev["video"]["id"]}{suffix}.jpg'
    return None


def youtube_url(ev):
    v = ev['video']
    t = f'&t={v["start"]}s' if v.get('start') else ''
    return f'https://www.youtube.com/watch?v={v["id"]}{t}'


def links_html(ev, with_video=True):
    out = []
    if with_video and ev.get('video'):
        out.append(f'<a class="ev-link ev-link-yt" href="{esc(youtube_url(ev))}" target="_blank" rel="noopener">'
                   f'{bi_raw("Watch on YouTube", "Ver en YouTube")} <span aria-hidden="true">↗</span></a>')
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
    label_en = ('Play video: ' if is_video else 'Open image: ') + ev['title']['en']
    label_es = ('Reproducir vídeo: ' if is_video else 'Abrir imagen: ') + ev['title']['es']
    play = '<span class="play" aria-hidden="true"></span>' if is_video else ''
    focus = f' style="object-position: {esc(ev["focus"])}"' if ev.get('focus') and ev.get('image') else ''
    return (f'<button type="button" class="{cls}" data-lightbox {attrs} aria-label="{esc(label_en)}" '
            f'data-label-en="{esc(label_en)}" data-label-es="{esc(label_es)}">'
            f'<img src="{src}" alt="" loading="lazy" decoding="async"{focus} />{play}</button>')


def tags_html(ev):
    keys = ev.get('industries') or []
    if not keys:
        return ''
    items = ''.join(f'<li><button type="button" class="ev-tag" data-tag="{k}">{bi_raw(*INDUSTRIES[k])}</button></li>' for k in keys)
    return f'<ul class="ev-tags" aria-label="Industries">{items}</ul>'


def details(ev, inline_place=False):
    sub = f'<p class="ev-sub">{bi(ev["sub"])}</p>' if ev.get('sub') else ''
    place = ''
    if ev.get('place') and not inline_place:
        place = f'<p class="ev-place">{bi(ev["place"])}</p>'
    note = f'<p class="ev-note">{bi(ev["note"])}</p>' if ev.get('note') else ''
    return sub + place + note


def star(ev):
    if ev['type'] != 'talk' or not ev.get('highlight'):
        return ''
    return f'<span class="ev-star">★ {bi_raw("Selected talk", "Charla destacada")}</span>'


def card(ev):
    is_video = bool(ev.get('video'))
    classes = ['ev', f'ev--{ev["type"]}', 'has-media']
    if is_video:
        classes.append('ev--video')
    if ev.get('highlight'):
        classes.append('ev--star')
    links = links_html(ev)
    links = f'<div class="ev-links">{links}</div>' if links else ''
    tags = ' '.join(ev.get('industries') or [])
    return (f'<article class="{" ".join(classes)}" data-type="{ev["type"]}" data-video="{1 if is_video else 0}" '
            f'data-tags="{tags}" data-star="{1 if ev.get("highlight") else 0}" id="ev-{esc(ev["id"])}">{media_button(ev, "sm", "ev-media")}'
            f'<div class="ev-body"><div class="ev-meta">{date_html(ev)}<span class="ev-role">{bi(ev["role"])}</span>{star(ev)}</div>'
            f'<h4>{bi(ev["title"])}</h4>{details(ev)}{tags_html(ev)}{links}</div></article>')


def row(ev):
    place = f'<span class="ev-place">{bi(ev["place"])}</span>' if ev.get('place') else ''
    sub = f'<p class="ev-sub">{bi(ev["sub"])}</p>' if ev.get('sub') else ''
    links = links_html(ev)
    links = f'<div class="ev-links">{links}</div>' if links else ''
    tags = ' '.join(ev.get('industries') or [])
    star_cls = ' ev--star' if ev.get('highlight') else ''
    return (f'<li class="ev ev-row ev--{ev["type"]}{star_cls}" data-type="{ev["type"]}" data-video="0" data-tags="{tags}" data-star="{1 if ev.get("highlight") else 0}" id="ev-{esc(ev["id"])}">'
            f'<div class="ev-meta">{date_html(ev)}<span class="ev-role">{bi(ev["role"])}</span>{star(ev)}{place}</div>'
            f'<div class="ev-row-main"><h4>{bi(ev["title"])}</h4>{sub}</div>{tags_html(ev)}{links}</li>')


def slide(ev):
    sub = f'<p>{bi(ev["sub"])}</p>' if ev.get('sub') else ''
    attrs = ' '.join(f'{k}="{esc(v)}"' for k, v in media_attrs(ev).items())
    actions = (f'<div class="slide-actions">'
               f'<button type="button" class="btn btn-accent btn-sm" data-lightbox {attrs}>'
               f'<span aria-hidden="true">▶</span> {bi_raw("Watch video", "Ver vídeo")}</button>'
               f'<a class="btn btn-glass btn-sm" href="{esc(youtube_url(ev))}" target="_blank" rel="noopener">YouTube <span aria-hidden="true">↗</span></a>'
               f'</div>')
    return (f'<article class="slide{" slide--star" if ev.get("highlight") else ""}" data-type="{ev["type"]}">{media_button(ev, "lg", "slide-media")}'
            f'<div class="slide-caption"><div class="ev-meta">{date_html(ev)}<span class="ev-role">{bi(ev["role"])}</span>{star(ev)}</div>'
            f'<h3>{bi(ev["title"])}</h3>{sub}{actions}</div></article>')


def visual_split(items):
    visual = [e for e in items if e.get('image') or e.get('video')]
    plain = [e for e in items if not (e.get('image') or e.get('video'))]
    return visual, plain


def year_body(items):
    visual, plain = visual_split(items)
    out = ''
    if visual:
        out += f'<div class="ev-grid">{"".join(card(e) for e in visual)}</div>'
    if plain:
        out += f'<ul class="ev-list">{"".join(row(e) for e in plain)}</ul>'
    return out


def build_talks(events):
    talks = [e for e in events if e['type'] == 'talk']
    videos = [e for e in talks if e.get('video')]
    years = sorted({e['date'][:4] for e in talks})
    tag_counts = Counter(k for e in talks for k in e.get('industries') or [])
    stats = [
        (len(talks), 'talks, keynotes &amp; panels', 'conferencias, keynotes y mesas'),
        (len(videos), 'talks on video', 'charlas en vídeo'),
        (len(tag_counts), 'industries', 'sectores'),
    ]
    stats_html = ''.join(f'<li><b>{n}</b>{bi_raw(en, es)}</li>' for n, en, es in stats)
    stats_html += f'<li><b>{years[0]}–{years[-1]}</b>{bi_raw("on stage", "en el escenario")}</li>'

    featured = [e for e in talks if e.get('featured') and e.get('video')]
    featured.sort(key=lambda e: not e.get('highlight'))
    slides = ''.join(slide(e) for e in featured)

    by_year = OrderedDict()
    for e in talks:
        by_year.setdefault(e['date'][:4], []).append(e)
    year_html = []
    for i, (year, items) in enumerate(by_year.items()):
        hidden = ' data-collapsed' if i >= OPEN_YEARS else ''
        year_html.append(
            f'<section class="ev-year"{hidden} data-year="{year}"><header class="ev-year-head"><h3>{year}</h3>'
            f'<span class="ev-count">{len(items)}</span></header>'
            f'<div class="ev-year-body">{year_body(items)}</div></section>')

    stars = [e for e in talks if e.get('highlight')]
    filters = [('all', 'All', 'Todas', len(talks)), ('star', 'Selected', 'Destacadas', len(stars)), ('video', 'With video', 'Con vídeo', len(videos))]
    for key, (en, es) in sorted(INDUSTRIES.items(), key=lambda kv: (kv[0] == 'general', -tag_counts[kv[0]])):
        if tag_counts[key]:
            filters.append((key, en, es, tag_counts[key]))
    filters_html = ''.join(
        f'<button class="filter{" active" if k == "all" else ""}{" filter-video" if k == "video" else ""}{" filter-star" if k == "star" else ""}" data-ev-filter="{k}" '
        f'aria-pressed="{"true" if k == "all" else "false"}">{bi_raw(esc(en), esc(es))}<span class="filter-n">{n}</span></button>'
        for k, en, es, n in filters)

    return f'''
      <ul class="ev-stats ev-stats-4" data-reveal>{stats_html}</ul>
    </div>

    <div class="carousel" data-carousel data-reveal>
      <div class="carousel-head wrap">
        <h3 class="mini-title">{bi_raw("Featured talks on video", "Charlas destacadas en vídeo")}</h3>
        <div class="carousel-nav">
          <button type="button" class="round-btn" data-carousel-prev aria-label="Previous">←</button>
          <button type="button" class="round-btn" data-carousel-next aria-label="Next">→</button>
        </div>
      </div>
      <div class="carousel-track" tabindex="0" aria-label="Featured talks">{slides}</div>
      <div class="carousel-progress wrap" aria-hidden="true"><span></span></div>
    </div>

    <div class="wrap">
      <div class="ev-toolbar" id="evToolbar" data-reveal>
        <h3 class="mini-title">{bi_raw("All talks by industry", "Todas las charlas por sector")}</h3>
        <div class="filters filters-ind" role="group" aria-label="Filter by industry">{filters_html}</div>
      </div>
      <div class="ev-years" id="evYears">{"".join(year_html)}</div>
      <div class="center-btns">
        <button type="button" class="btn btn-glass" id="evMore">{bi_raw("Show earlier years", "Ver años anteriores")}</button>
      </div>
'''


def media_card(ev):
    is_video = bool(ev.get('video'))
    classes = ['mcard', f'mcard--{ev["type"]}']
    if is_video:
        classes.append('mcard--video')
    elif ev.get('image', '').startswith('press/'):
        classes.append('mcard--clip')
    links = links_html(ev)
    links = f'<div class="ev-links">{links}</div>' if links else ''
    return (f'<article class="{" ".join(classes)}" id="ev-{esc(ev["id"])}">{media_button(ev, "sm", "mcard-media")}'
            f'<div class="mcard-body"><div class="ev-meta">{date_html(ev)}<span class="ev-role">{bi(ev["role"])}</span></div>'
            f'<h4>{bi(ev["title"])}</h4>{details(ev)}{links}</div></article>')


def plain_row(ev):
    place = f'<span class="ev-place">{bi(ev["place"])}</span>' if ev.get('place') else ''
    sub = f'<p class="ev-sub">{bi(ev["sub"])}</p>' if ev.get('sub') else ''
    links = links_html(ev)
    links = f'<div class="ev-links">{links}</div>' if links else ''
    return (f'<li class="prow prow--{ev["type"]}" id="ev-{esc(ev["id"])}">'
            f'<div class="ev-meta">{date_html(ev)}<span class="ev-role">{bi(ev["role"])}</span>{place}</div>'
            f'<h4>{bi(ev["title"])}</h4>{sub}{links}</li>')


def build_media(events):
    items = [e for e in events if e['type'] == 'media']
    visual, plain = visual_split(items)
    out = f'<div class="mgrid" data-reveal>{"".join(media_card(e) for e in visual)}</div>'
    if plain:
        out += (f'<h3 class="mini-title mini-title-sep">{bi_raw("More interviews and mentions", "Más entrevistas y menciones")}</h3>'
                f'<ul class="plist" data-reveal>{"".join(plain_row(e) for e in plain)}</ul>')
    return '\n      ' + out + '\n      '


def award_card(ev):
    links = links_html(ev)
    links = f'<div class="ev-links">{links}</div>' if links else ''
    return (f'<article class="acard" id="ev-{esc(ev["id"])}">{media_button(ev, "sm", "acard-media")}'
            f'<div class="acard-body"><div class="ev-meta">{date_html(ev)}<span class="ev-role">{bi(ev["role"])}</span></div>'
            f'<h4>{bi(ev["title"])}</h4>{details(ev)}{links}</div></article>')


def build_awards(events):
    items = [e for e in events if e['type'] == 'award']
    visual, plain = visual_split(items)
    out = f'<div class="agrid" data-reveal>{"".join(award_card(e) for e in visual)}</div>'
    if plain:
        out += f'<ul class="plist plist-awards" data-reveal>{"".join(plain_row(e) for e in plain)}</ul>'
    return '\n      ' + out + '\n      '


def pub_feature(ev):
    if ev.get('image'):
        cover = (f'<button type="button" class="pfeat-cover" data-lightbox data-full="{image_path(ev)}" '
                 f'aria-label="{esc("Open image: " + ev["title"]["en"])}" data-label-en="{esc("Open image: " + ev["title"]["en"])}" '
                 f'data-label-es="{esc("Abrir imagen: " + ev["title"]["es"])}"><img src="{image_path(ev, "-sm")}" alt="" loading="lazy" decoding="async" /></button>')
    else:
        cover = f'<div class="pfeat-cover pfeat-cover--type" aria-hidden="true"><span>{bi(ev["role"])}</span></div>'
    links = links_html(ev)
    links = f'<div class="ev-links">{links}</div>' if links else ''
    return (f'<article class="pfeat{" pfeat--hl" if ev.get("highlight") else ""}" id="ev-{esc(ev["id"])}">{cover}'
            f'<div class="pfeat-body"><div class="ev-meta">{date_html(ev)}<span class="ev-role">{bi(ev["role"])}</span></div>'
            f'<h4>{bi(ev["title"])}</h4>{details(ev)}{links}</div></article>')


def build_pubs(events):
    items = [e for e in events if e['type'] == 'publication']
    items.sort(key=lambda e: (not e.get('highlight'), [-int(x) for x in re.findall(r'\d+', e['date'])]))
    return f'\n      <div class="pfeat-grid" data-reveal>{"".join(pub_feature(e) for e in items)}</div>\n      '


def replace_block(page, name, block, indent='      '):
    start, end = f'<!-- {name}:START -->', f'<!-- {name}:END -->'
    if start not in page or end not in page:
        raise SystemExit(f'Markers for {name} not found in index.html')
    return re.sub(re.escape(start) + r'.*?' + re.escape(end), lambda m: start + block + indent + end, page, flags=re.S)


def main():
    events = json.load(open(DATA, encoding='utf-8'))
    events = sorted(events, key=lambda e: e['date'], reverse=True)
    page = open(INDEX, encoding='utf-8').read()
    page = replace_block(page, 'EVENTS', build_talks(events))
    page = replace_block(page, 'MEDIA', build_media(events), indent='')
    page = replace_block(page, 'AWARDS', build_awards(events), indent='')
    page = replace_block(page, 'PUBS', build_pubs(events), indent='')
    open(INDEX, 'w', encoding='utf-8').write(page)
    print(f'{len(events)} items rendered:', dict(Counter(e['type'] for e in events)))


if __name__ == '__main__':
    main()
