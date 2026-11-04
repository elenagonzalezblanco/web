# web
Personal website of Elena González-Blanco García — https://www.elenagonzalezblanco.com

## Speaking & media section
Talks, interviews, publications and awards are stored in `data/events.json` and rendered into `index.html` by:

```bash
python3 tools/build_events.py
```

To add an event, append an entry to `data/events.json` (bilingual `en`/`es` texts, `date` as `YYYY`, `YYYY-MM` or `YYYY-MM-DD`, `type` = `talk`, `media`, `publication` or `award`). Optional fields:

- `image`: photo name in `assets/media/events/` (provide `name.jpg` ≈1600 px and `name-sm.jpg` ≈760 px).
- `video`: `{"id": "<YouTube id>", "start": seconds}`; the thumbnail goes in `assets/media/yt/<id>.jpg` and `<id>-sm.jpg`.
- `featured: true` to show it in the carousel.
