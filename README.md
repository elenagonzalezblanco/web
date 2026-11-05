# web
Personal website of Elena González-Blanco García — https://www.elenagonzalezblanco.com

## Talks, media, awards and publications
Talks, press coverage, awards and publications are stored in `data/events.json` and rendered into `index.html` by:

```bash
python3 tools/build_events.py
```

The script fills four generated blocks in `index.html` (between `<!-- NAME:START -->` and `<!-- NAME:END -->`):

- `EVENTS` — Conferences & Talks: featured video carousel, industry filters and talks by year (`type: talk`).
- `MEDIA` — Media: press clippings, interviews, podcasts and TV (`type: media`).
- `AWARDS` — Awards & Recognition (`type: award`).
- `PUBS` — books, chapters and articles shown above the research papers (`type: publication`).

To add an item, append an entry to `data/events.json` (bilingual `en`/`es` texts, `date` as `YYYY`, `YYYY-MM` or `YYYY-MM-DD`, `type` = `talk`, `media`, `publication` or `award`). Optional fields:

- `image`: image name without extension. Plain names live in `assets/media/events/`; names with a folder such as `press/elmundo-2026` or `pubs/cervantes-2025` live in `assets/media/<folder>/`. Provide `name.jpg` (≈1200–1600 px) and `name-sm.jpg` (≈760 px).
- `video`: `{"id": "<YouTube id>", "start": seconds}`; the thumbnail goes in `assets/media/yt/<id>.jpg` and `<id>-sm.jpg`. Video cards are shown larger and get a "Watch on YouTube" link.
- `industries` (talks): list of industry keys used by the filters — `financial`, `insurance`, `hr`, `retail`, `industry`, `legal`, `tech`, `startups`, `boards`, `language`, `education`, `women`, `general` (labels in `INDUSTRIES` in `tools/build_events.py`).
- `featured: true` (talks with a video) to show it in the "Featured talks on video" carousel.
- `highlight: true`: for talks, a selected talk from the CV (★ badge and its own filter); for publications, listed first.
- `spotlight: true` (talks): shown first in the carousel; the other featured talks follow from newest to oldest.
- `focus`: CSS `object-position` for the image crop, e.g. `"85% 35%"`.

Education logos are in `assets/img/logos/`, company logos for the experience section in `assets/img/companies/`; research project logos are in `assets/img/projects/` (the Projects section is edited directly in `index.html`).
