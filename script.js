/* ============================================================
   Elena González-Blanco García — Personal website
   Navigation, scroll reveal, filters and EN/ES translations
   ============================================================ */

'use strict';

document.documentElement.classList.add('js');

// ── Navigation ───────────────────────────────────────────
const navbar = document.getElementById('navbar');
const navLinks = document.getElementById('navLinks');
const navToggle = document.getElementById('navToggle');

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  updateActiveNavLink();
}
window.addEventListener('scroll', onScroll, { passive: true });

function setMenu(open) {
  navLinks.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  if (open) navbar.classList.add('scrolled');
  else onScroll();
}
navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

function updateActiveNavLink() {
  let current = '';
  document.querySelectorAll('main section[id]').forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
}

// ── Reveal on scroll ─────────────────────────────────────
const revealEls = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// ── Filters ──────────────────────────────────────────────
function setupFilter(buttonSelector, attr, itemSelector, matches) {
  const buttons = document.querySelectorAll(buttonSelector);
  const items = document.querySelectorAll(itemSelector);
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      const value = btn.getAttribute(attr);
      items.forEach(item => {
        item.classList.toggle('hidden', !(value === 'all' || matches(item, value)));
        if (!item.classList.contains('hidden')) item.classList.add('in');
      });
    });
  });
}
setupFilter('.filters-pub .filter', 'data-filter', '.pub', (el, v) => (el.dataset.cat || '').split(' ').includes(v));

// ── Speaking & media: filters, earlier years ─────────────
const evYears = [...document.querySelectorAll('.ev-year')];
const evMore = document.getElementById('evMore');
let evExpanded = false;
let evFilter = 'all';

function renderEvents() {
  evYears.forEach(year => {
    let visible = 0;
    year.querySelectorAll('.ev').forEach(card => {
      const show = evFilter === 'all' || (evFilter === 'video' ? card.dataset.video === '1' : card.dataset.type === evFilter);
      card.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    year.querySelectorAll('.ev-grid, .ev-list').forEach(group => {
      group.hidden = !group.querySelector('.ev:not(.hidden)');
    });
    const collapsed = year.hasAttribute('data-collapsed') && !evExpanded && evFilter === 'all';
    year.hidden = collapsed || visible === 0;
    const count = year.querySelector('.ev-count');
    if (count) count.textContent = visible;
  });
  if (evMore) evMore.parentElement.hidden = evExpanded || evFilter !== 'all' || !evYears.some(y => y.hasAttribute('data-collapsed'));
}

document.querySelectorAll('[data-ev-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    evFilter = btn.dataset.evFilter;
    document.querySelectorAll('[data-ev-filter]').forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    renderEvents();
  });
});
if (evMore) evMore.addEventListener('click', () => { evExpanded = true; renderEvents(); });
renderEvents();

// ── Carousel ─────────────────────────────────────────────
document.querySelectorAll('[data-carousel]').forEach(root => {
  const track = root.querySelector('.carousel-track');
  const prev = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  const bar = root.querySelector('.carousel-progress span');
  const step = () => {
    const slide = track.querySelector('.slide');
    return slide ? slide.getBoundingClientRect().width + 20 : track.clientWidth * 0.8;
  };
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= max - 4;
    if (bar) bar.style.width = `${Math.max(8, ((track.scrollLeft + track.clientWidth) / track.scrollWidth) * 100)}%`;
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
  });
  window.addEventListener('resize', update);
  update();
});

// ── Lightbox (photos and YouTube videos) ─────────────────
const lightbox = document.getElementById('lightbox');
const lbStage = lightbox.querySelector('.lb-stage');
const lbCaption = lightbox.querySelector('.lb-caption');
let lbReturnFocus = null;

function openLightbox(trigger) {
  const holder = trigger.closest('.ev, .slide');
  const title = holder ? holder.querySelector('h3, h4') : null;
  lbStage.innerHTML = '';
  if (trigger.dataset.video) {
    const start = trigger.dataset.start ? `&start=${encodeURIComponent(trigger.dataset.start)}` : '';
    const wrap = document.createElement('div');
    wrap.className = 'lb-video';
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(trigger.dataset.video)}?autoplay=1&rel=0${start}`;
    frame.title = title ? title.innerText : 'Video';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    wrap.appendChild(frame);
    lbStage.appendChild(wrap);
  } else {
    const img = document.createElement('img');
    img.src = trigger.dataset.full;
    img.alt = title ? title.innerText : '';
    lbStage.appendChild(img);
  }
  lbCaption.textContent = title ? title.innerText : '';
  lbReturnFocus = trigger;
  lightbox.hidden = false;
  document.body.classList.add('lb-open');
  lightbox.querySelector('.lb-close').focus();
}

function closeLightbox() {
  if (lightbox.hidden) return;
  lightbox.hidden = true;
  lbStage.innerHTML = '';
  document.body.classList.remove('lb-open');
  if (lbReturnFocus) lbReturnFocus.focus();
}

document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-lightbox]');
  if (trigger) { e.preventDefault(); openLightbox(trigger); }
});
lightbox.querySelector('.lb-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// ── Internationalisation (EN / ES) ───────────────────────
const translations = {
  en: {
    "education.title": "Education & Training",
    "education.phd.title": "PhD in Philology (Comparative Linguistics) — \"Doctor Europeus\" · Extraordinary Prize",
    "education.phd.detail": "— Universidad Complutense de Madrid. Completed with 2 years as Visiting Scholar at Harvard University.",
    "exp.ewi.title": "Board Member",
    "exp.ewi.date": "2020 — 2021",
    "social.huggingface": "Hugging Face — ClibrAIn open models",
    "nav.about": "About",
    "nav.experience": "Experience",
    "nav.speaking": "Speaking",
    "nav.publications": "Publications",
    "nav.projects": "Projects",
    "nav.contact": "Contact",
    "hero.eyebrow": "Head of Artificial Intelligence for Digital Natives at Microsoft EMEA · Cofounder at Clibrain · NLP, Insurtech, Fintech & Digital Innovation Expert · Board Member · PhD · Keynote Speaker",
    "hero.tagline": "AI executive, serial entrepreneur, and keynote speaker — turning <span class=\"highlight\">Artificial Intelligence</span> into business impact across <span class=\"highlight\">Europe's most ambitious companies</span>.",
    "hero.meta1": "Microsoft EMEA",
    "hero.meta2": "Serial Entrepreneur · 3× CEO",
    "hero.meta3": "Forbes Top 100 · Choiseul #1",
    "hero.btn1": "My Journey",
    "hero.btn2": "Book a Talk",
    "hero.stat1": "CEO & Founder",
    "hero.stat2": "Exit (Aon)",
    "hero.stat3": "ERC Grants",
    "about.label": "01 / About",
    "about.title": "AI. Business. Impact.<br /><em>At Scale.</em>",
    "about.bio": "<p>Elena González-Blanco is the Head of Artificial Intelligence &amp; Data for Digital Natives (Startups &amp; Unicorns) at Microsoft for EMEA. Previously, she was the Co-Founder and CEO of Clibrain, a generative AI startup specializing in the creation of large language models tailored to the Spanish-speaking community. She is also an Independent Board Member at Traxion, and formerly served as an Independent Board Member and Chair of the Audit Committee at LLYC, as a member of the Advisory Board to the CEO of Astara, part of the M&amp;A fund Albia Capital, and as a Board Member at EWI (Empowering Women in Insurance) from 2020 to 2021.</p><p>Earlier in her career, Elena was Global Head of Digital for Wealth Management and Insurance at Banco Santander (EVP), General Manager for Europe at CoverWallet — an insurtech startup acquired by Aon in January 2020 — and a member of the Aon Iberia Executive Committee. Prior to that, she led Artificial Intelligence Product Development at Minsait (Indra).</p><p>Elena is an expert in Artificial Intelligence and Digital Innovation, with a special focus on language technologies and international interdisciplinary projects. She holds a PhD in Philology (Comparative Linguistics) from Universidad Complutense de Madrid, completed with 2 years as Visiting Scholar at Harvard University, a Master's in Digital Information Systems from UC3M, and has completed executive programs at LSE London, MIT, and ESADE. A renowned international researcher, she has worked at Harvard University, King's College London, UNAM, Bonn, and UNED. She is currently an Associate Professor of Artificial Intelligence Applied to Business at IE Business School and also teaches at ICAI and AFI.</p><p>Fluent in English, French, German, and Italian, Elena has been recognized as one of the Top 100 Female Leaders in Spain (2017, 2018, 2019) and was awarded the Julián Marías Prize in 2017 for researchers under 40. She ranked #1 and #3 in the Choiseul \"100 Economic Leaders for the Future of Spain\" (2018, 2019), was named among the #40under40 Insurance Leaders in Spain (2020), and received the 2021 WIDS Prize for Women in Machine Learning and Data Science. Her honors also include: Gold Medal, National Physics Olympiad (Spain), 1999. She is the mother of four children.</p>",
    "exp.label": "02 / Experience",
    "exp.title": "Career <em>Timeline</em>",
    "exp.job1.title": "Head of Artificial Intelligence &amp; Data for Digital Natives (Unicorns &amp; Startups) — EMEA",
    "exp.job1.date": "Feb 2024 — Present",
    "exp.job1.desc": "Leader of the Technical Sales Specialists and Solution Engineers teams for all Azure solution plays (Infrastructure, Applications & Modernization, AI & Data) within the sales organization (MCAPS), covering the whole EMEA region, from the Nordics to South Africa. Driving AI and Data adoption for the fastest-growing tech companies in Europe. Annual target of $200M+ in Azure Consumed Revenue, with 80% YoY growth.",
    "exp.job2.title": "Independent Board Member",
    "exp.job2.date": "2024 — Present",
    "exp.job2.desc": "Independent Board Member at Traxion, one of Mexico's leading logistics and transportation conglomerates. Advising on AI strategy, digital transformation, and technology-driven growth.",
    "exp.job3.title": "Associate Professor",
    "exp.job3.date": "Sep 2018 — Present",
    "exp.job3.desc": "Teaching at the intersection of AI and business. Courses include \"Artificial Intelligence and Language Technologies\" (Big Data &amp; Business Analytics), \"AI and Machine Learning: Applications\" (MSc Computer Science &amp; Business Technology), and AI for Digital Finance.",
    "exp.job4.title": "Advisory Board Member to the CEO",
    "exp.job4.date": "2022 — 2024",
    "exp.job4.desc": "Strategic advisor to the CEO of Astara, one of Europe's largest automotive distribution groups, on AI adoption, digital transformation, and innovation strategy.",
    "exp.job5.title": "Independent Board Member — Audit &amp; Remuneration Committees",
    "exp.job5.date": "2021 — 2024",
    "exp.job5.desc": "Independent Board Member and President of the Audit Committee; member of the Appointments and Remuneration Committee at LLYC, a leading international communications and public affairs group listed on BME Growth.",
    "exp.job6.title": "Cofounder &amp; CEO",
    "exp.job6.date": "2023 — Jan 2024",
    "exp.job6.desc": "Co-founded ClibrAIn, a Generative AI startup building language models and operational intelligence solutions for Spanish-speaking companies. Developed LINCE — a Spanish LLM ecosystem of 40+ models generating $100k+ ARR. Built and led a team of 50+, including a 10-person sales team and a 30-person engineering and LLM research team. Hired 20+ top AI talent from AWS, Google, Oracle and Meta.",
    "exp.job7.title": "Global Head of Digital — Wealth Management &amp; Insurance",
    "exp.job7.date": "2021 — 2022",
    "exp.job7.desc": "Global Executive Vice-President responsible for the Digital Strategy across Private Banking, Asset Management, and Insurance at Grupo Santander — overseeing 10 countries and transforming a business of €2.3bn. Key initiative: Data Analytics project on multi-channel insurance sales funnel with 10% sales increase on first pilot (Spain &amp; Portugal).",
    "exp.job8.title": "General Manager Europe · Member of ExCo Aon Iberia",
    "exp.job8.date": "2018 — 2021",
    "exp.job8.desc": "GM of Europe at CoverWallet (400+ employees, backed by Union Square, Index, Highland Capital &amp; Two Sigma; acquired by Aon for $330M). Led the EU expansion, with a team of 60+, including a 40-person sales organization across four countries through country sales directors, plus Operations, Product, Marketing and HR. P&amp;L of Switzerland, Spain, France, and UK generating €5M+ revenue. Sealed partnership deals with Zurich and Chubb in EMEA. 15% improvement in Lead conversion and 50% increase in cross-selling. Member of ExCo of Aon Iberia post-acquisition (2020–2021).",
    "exp.job9.title": "Head of Artificial Intelligence Product Development",
    "exp.job9.date": "2017 — 2018",
    "exp.job9.desc": "Led the development of an AI-based cognitive platform focused on automated analysis and generation of language, combining Natural Language Processing, Machine Learning, and Deep Learning technologies. Implemented a solution for mortgage process automation by applying AI to extract information from BPO documents — reducing costs (FTEs) and errors by 20%.",
    "exp.job10.title": "Founder &amp; Director — LINHD (Digital Humanities Innovation Lab)",
    "exp.job10.date": "2014 — 2017",
    "exp.job10.desc": "Founded and directed LINHD — Spain's pioneering Digital Humanities research laboratory at UNED, raising €1.5M in funding. Led key IT projects in Natural Language Processing and database interoperability (George Eckert Institute, Germany), digital transformation projects for the Spanish National Library, and training &amp; consulting programs across LatAm. Managed a team of 10.",
    "exp.job11.title": "Associate Professor &amp; Government Board Member",
    "exp.job11.date": "2009 — 2017",
    "exp.job11.desc": "Associate Professor at UNED in Spanish Language, Literature, and Digital Humanities. Elected Member of the UNED Government Board for 3 years; Member of the Faculty Government Council, serving as Secretary for 2.5 years. Holder of two European Research Council (ERC) grants — including the ERC Starting Grant for the POSTDATA project on Poetry Standardization and Linked Open Data.",
    "exp.job12.title": "Visiting Fellow &amp; Teaching Assistant",
    "exp.job12.date": "2006 — 2008",
    "exp.job12.desc": "Visiting Fellow and Teaching Assistant at the Real Colegio Complutense (RCC) at Harvard University, supported by a MAE-AECI grant. Research focused on Medieval Spanish metrics and comparative Romance versification — the foundation of her PhD in Philology (Comparative Linguistics), awarded by Universidad Complutense de Madrid with the \"Doctor Europeus\" distinction and the Extraordinary Prize.",
    "speaking.label": "03 / Speaking & Media",
    "speaking.title": "Keynotes, Media &amp; <em>Publications</em>",
    "pub.label": "04 / Research",
    "pub.title": "Academic Publications &amp; <em>Research Papers</em>",
    "projects.label": "05 / Projects",
    "projects.title": "Key Research <em>Initiatives</em>",
    "contact.label": "06 / Contact",
    "contact.title": "Let's <em>Work Together</em>",
    "contact.name": "Name",
    "contact.namePlaceholder": "Your full name",
    "contact.email": "Email",
    "contact.subject": "Subject",
    "contact.opt1": "Speaking invitation",
    "contact.opt2": "AI advisory / board role",
    "contact.opt3": "Media inquiry",
    "contact.opt4": "Research collaboration",
    "contact.opt5": "Other",
    "contact.message": "Message",
    "contact.messagePlaceholder": "Write your message here…",
    "contact.send": "Send Message",
    "footer.tagline": "Elena González-Blanco García<br />Head of AI · Microsoft EMEA · Serial Entrepreneur · Keynote Speaker",
    "hero.claim": "AI at scale.",
    "hero.stat4": "Annual Azure revenue target",
    "logos.label": "Career across",
    "about.expertise": "Expertise",
    "speaking.sub": "Keynote speaker at the world's leading AI, tech and innovation events.",
    "speaking.youtube": "Watch talks on YouTube",
    "speaking.orcid": "Full Publication List (ORCID)",
    "link.read": "Read",
    "link.view": "View",
    "pub.sub": "58 scientific publications · keynote speaker at AWS, Salesforce, Databricks, Wired & more",
    "pub.viewAll": "View full list",
    "pub.more": "View All 58+ Publications",
    "pub.citations": "citations",
    "pubf.all": "All",
    "pubf.nlp": "NLP & AI",
    "pubf.poetry": "Computational Poetry",
    "pubf.dh": "Digital Humanities",
    "pubf.medieval": "Medieval Studies",
    "pubtype.journal": "Journal",
    "pubtype.preprint": "Preprint",
    "pubtype.conference": "Conference",
    "pubtype.chapter": "Book Chapter",
    "pubtype.book": "Book",
    "contact.sub": "Speaking invitations, board and advisory roles, media inquiries and research collaborations.",
    "footer.rights": "© 2026 Elena González-Blanco García. All rights reserved.",
    "footer.top": "Back to top"
  },
  es: {
    "education.title": "Educación y formación",
    "education.phd.title": "Doctorado en Filología (Lingüística Comparada) — \"Doctor Europeus\" · Premio Extraordinario",
    "education.phd.detail": "— Universidad Complutense de Madrid. Completado con una estancia de 2 años como Visiting Scholar en Harvard University.",
    "exp.ewi.title": "Miembro del Consejo",
    "exp.ewi.date": "2020 — 2021",
    "social.huggingface": "Hugging Face — Modelos abiertos de ClibrAIn",
    "nav.about": "Sobre mí",
    "nav.experience": "Experiencia",
    "nav.speaking": "Conferencias",
    "nav.publications": "Publicaciones",
    "nav.projects": "Proyectos",
    "nav.contact": "Contacto",
    "hero.eyebrow": "Head of Artificial Intelligence para Digital Natives en Microsoft EMEA · Cofundadora en Clibrain · Experta en NLP, Insurtech, Fintech e Innovación Digital · Consejera · Doctora · Conferenciante",
    "hero.tagline": "Directiva de IA, emprendedora en serie y conferenciante internacional — transformando la <span class=\"highlight\">Inteligencia Artificial</span> en impacto real para las <span class=\"highlight\">empresas más ambiciosas de Europa</span>.",
    "hero.meta1": "Microsoft EMEA",
    "hero.meta2": "Emprendedora en serie · 3× CEO",
    "hero.meta3": "Forbes Top 100 · Choiseul nº 1",
    "hero.btn1": "Mi Trayectoria",
    "hero.btn2": "Reservar Conferencia",
    "hero.stat1": "CEO y Fundadora",
    "hero.stat2": "Exit (Aon)",
    "hero.stat3": "Proyectos ERC",
    "about.label": "01 / Sobre mí",
    "about.title": "IA. Empresa. Impacto.<br /><em>A Escala.</em>",
    "about.bio": "<p>Elena González-Blanco es la Head of Artificial Intelligence and Data for Digital Natives (Unicorns &amp; Startups) para EMEA en Microsoft. Anteriormente fue Cofundadora y CEO de Clibrain, una startup de IA generativa para el desarrollo de LLMs en el ámbito hispanohablante. Es además Consejera Independiente de Traxion, y ha sido Consejera Independiente y Presidenta de la Comisión de Auditoría de LLYC, miembro del Advisory Board del CEO de Astara y miembro del Consejo de EWI (Empowering Women in Insurance) entre 2020 y 2021.</p><p>Previamente, fue Global Head of Digital for Wealth Management and Insurance en Banco Santander (EVP), y antes la General Manager de Europa en la startup de insurtech CoverWallet, adquirida por AON en enero de 2020, donde además fue miembro del Comité Ejecutivo de AON Iberia. Anteriormente, fue la Responsable de Desarrollo de Producto en Inteligencia Artificial en Minsait-Indra.</p><p>Experta en Inteligencia Artificial y Transformación Digital, es especialista en el ámbito de la tecnología lingüística. Es Doctora en Filología (Lingüística Comparada) por la Universidad Complutense de Madrid, con una estancia de 2 años como Visiting Scholar en Harvard University, y Máster en Sistemas de Información por la UC3M, ha cursado programas de formación ejecutiva en LSE Londres, MIT y ESADE. Ha sido docente e investigadora en Harvard University y actualmente es profesora en el IE Business School de Inteligencia Artificial aplicada a negocio, además de impartir clases en ICAI y en AFI. Investigadora de reconocido prestigio internacional, lidera POSTDATA, proyecto de investigación europeo de excelencia ERC sobre procesamiento del lenguaje y web semántica (+1M€), seguido por LYRAICS, que se enfocó en la recomendación musical utilizando IA para el análisis de las letras de canciones en español.</p><p>Elegida número #1 en 2018 y #3 en 2019 del Ranking Choiseul \"Líderes Económicos del futuro de España\", ha sido seleccionada como una de las Top 100 mujeres de España en las ediciones de 2017, 2018 y 2019, y galardonada con el premio de investigación Julián Marías 2017 en la categoría de menores de 40 años, el premio WIDS 2021 para Mujeres en Machine Learning y Ciencia de Datos. Entre sus distinciones figura también la Medalla de Oro en la Olimpiada Nacional de Física (España), 1999. Habla inglés, francés, alemán e italiano y es madre de 4 hijos.</p>",
    "exp.label": "02 / Experiencia",
    "exp.title": "Trayectoria <em>Profesional</em>",
    "exp.job1.title": "Responsable de Inteligencia Artificial y Datos para Digital Natives (Unicornios y Startups) — EMEA",
    "exp.job1.date": "Feb 2024 — Actualidad",
    "exp.job1.desc": "Líder de los equipos de Technical Sales Specialists y Solution Engineers para todas las áreas de soluciones de Azure (Infraestructura, Aplicaciones y Modernización, IA y Datos) dentro de la organización de ventas (MCAPS), cubriendo toda la región EMEA, desde los países nórdicos hasta Sudáfrica. Impulsando la adopción de IA y Datos en las empresas tecnológicas de mayor crecimiento en Europa. Objetivo anual de más de 200 millones de USD en Azure Consumed Revenue, con un crecimiento del 80% interanual.",
    "exp.job2.title": "Consejera Independiente",
    "exp.job2.date": "2024 — Actualidad",
    "exp.job2.desc": "Consejera Independiente en Traxion, uno de los principales conglomerados de logística y transporte de México. Asesoramiento en estrategia de IA, transformación digital y crecimiento tecnológico.",
    "exp.job3.title": "Profesora Asociada",
    "exp.job3.date": "Sep 2018 — Actualidad",
    "exp.job3.desc": "Docencia en la intersección entre IA y negocio. Asignaturas: \"Inteligencia Artificial y Tecnologías del Lenguaje\" (Big Data y Business Analytics), \"IA y Machine Learning: Aplicaciones\" (MSc en Computer Science y Business Technology), e IA para Finanzas Digitales.",
    "exp.job4.title": "Miembro del Advisory Board del CEO",
    "exp.job4.date": "2022 — 2024",
    "exp.job4.desc": "Asesora estratégica del CEO de Astara, uno de los mayores grupos de distribución de automoción de Europa, en adopción de IA, transformación digital y estrategia de innovación.",
    "exp.job5.title": "Consejera Independiente — Comisiones de Auditoría y Retribuciones",
    "exp.job5.date": "2021 — 2024",
    "exp.job5.desc": "Consejera Independiente y Presidenta de la Comisión de Auditoría; miembro de la Comisión de Nombramientos y Retribuciones en LLYC, grupo internacional líder en comunicación y asuntos públicos cotizado en BME Growth.",
    "exp.job6.title": "Cofundadora y CEO",
    "exp.job6.date": "2023 — Ene 2024",
    "exp.job6.desc": "Cofundó ClibrAIn, una startup de IA Generativa para el desarrollo de modelos de lenguaje e inteligencia operacional para empresas hispanohablantes. Desarrolló LINCE, un ecosistema de LLMs en español con más de 40 modelos y más de 100.000 USD de ARR. Creó y dirigió un equipo de más de 50 personas, incluidos un equipo comercial de 10 personas y un equipo de ingeniería e investigación en LLMs de 30 personas. Contrató a más de 20 profesionales de IA de primer nivel procedentes de AWS, Google, Oracle y Meta.",
    "exp.job7.title": "Global Head of Digital — Banca Privada y Seguros",
    "exp.job7.date": "2021 — 2022",
    "exp.job7.desc": "Vicepresidenta Ejecutiva Global responsable de la Estrategia Digital en Banca Privada, Gestión de Activos y Seguros en Grupo Santander — supervisando 10 países y transformando un negocio de 2.300M€. Iniciativa clave: proyecto de Data Analytics sobre el funnel de ventas multicanal de seguros con un incremento del 10% en ventas en el primer piloto (España y Portugal).",
    "exp.job8.title": "Directora General Europa · Miembro del ComEx Aon Iberia",
    "exp.job8.date": "2018 — 2021",
    "exp.job8.desc": "Directora General de Europa en CoverWallet (más de 400 empleados, respaldada por Union Square, Index, Highland Capital y Two Sigma; adquirida por Aon por 330M$). Lideró la expansión europea con un equipo de más de 60 personas, incluida una organización comercial de 40 personas en cuatro países a través de directores comerciales de país, además de Operaciones, Producto, Marketing y Recursos Humanos. P&L en Suiza, España, Francia y Reino Unido con más de 5M€ de ingresos. Cerró acuerdos de partnership con Zurich y Chubb en EMEA. Mejora del 15% en conversión de leads y del 50% en cross-selling. Miembro del ComEx de Aon Iberia tras la adquisición (2020–2021).",
    "exp.job9.title": "Responsable de Desarrollo de Producto en Inteligencia Artificial",
    "exp.job9.date": "2017 — 2018",
    "exp.job9.desc": "Lideró el desarrollo de una plataforma cognitiva basada en IA centrada en el análisis y la generación automatizada del lenguaje, combinando Procesamiento del Lenguaje Natural, Machine Learning y Deep Learning. Implementó una solución de automatización del proceso hipotecario aplicando IA para extraer información de documentos BPO — reduciendo costes (FTEs) y errores en un 20%.",
    "exp.job10.title": "Fundadora y Directora — LINHD (Laboratorio de Innovación en Humanidades Digitales)",
    "exp.job10.date": "2014 — 2017",
    "exp.job10.desc": "Fundó y dirigió LINHD, el primer laboratorio de Humanidades Digitales de España en la UNED, captando 1,5M€ en financiación. Lideró proyectos clave de PLN e interoperabilidad de bases de datos (Georg Eckert Institut, Alemania), proyectos de transformación digital para la Biblioteca Nacional de España, y programas de formación y consultoría en América Latina. Equipo de 10 personas.",
    "exp.job11.title": "Profesora Titular y Miembro del Claustro de Gobierno",
    "exp.job11.date": "2009 — 2017",
    "exp.job11.desc": "Profesora Titular en la UNED en Lengua y Literatura Española y Humanidades Digitales. Miembro electa del Claustro de Gobierno de la UNED durante 3 años; miembro del Consejo de Gobierno de la Facultad, ejerciendo como Secretaria durante 2,5 años. Titular de dos proyectos de investigación del Consejo Europeo de Investigación (ERC), incluido el ERC Starting Grant para el proyecto POSTDATA sobre Estandarización de la Poesía y Datos Enlazados.",
    "exp.job12.title": "Visiting Fellow y Teaching Assistant",
    "exp.job12.date": "2006 — 2008",
    "exp.job12.desc": "Visiting Fellow y Profesora Ayudante en el Real Colegio Complutense (RCC) de la Universidad de Harvard, con una beca MAE-AECI. La investigación se centró en la métrica medieval española y la versificación románica comparada, base de su doctorado en Filología (Lingüística Comparada) por la Universidad Complutense de Madrid, galardonado con la distinción \"Doctor Europeus\" y el Premio Extraordinario.",
    "speaking.label": "03 / Conferencias y medios",
    "speaking.title": "Conferencias, medios y <em>publicaciones</em>",
    "pub.label": "04 / Investigación",
    "pub.title": "Publicaciones académicas &amp; <em>Artículos científicos</em>",
    "projects.label": "05 / Proyectos",
    "projects.title": "Iniciativas de <em>Investigación</em>",
    "contact.label": "06 / Contacto",
    "contact.title": "¿<em>Trabajamos juntos</em>?",
    "contact.name": "Nombre",
    "contact.namePlaceholder": "Tu nombre completo",
    "contact.email": "Correo",
    "contact.subject": "Asunto",
    "contact.opt1": "Invitación como ponente",
    "contact.opt2": "Asesoría IA / rol en consejo",
    "contact.opt3": "Consulta de medios",
    "contact.opt4": "Colaboración en investigación",
    "contact.opt5": "Otro",
    "contact.message": "Mensaje",
    "contact.messagePlaceholder": "Escribe tu mensaje aquí…",
    "contact.send": "Enviar mensaje",
    "footer.tagline": "Elena González-Blanco García<br />Directora de IA · Microsoft EMEA · Emprendedora en serie · Conferenciante",
    "hero.claim": "IA a escala.",
    "hero.stat4": "Objetivo anual de ingresos en Azure",
    "logos.label": "Trayectoria en",
    "about.expertise": "Especialidades",
    "speaking.sub": "Ponente en los principales eventos de IA, tecnología e innovación.",
    "speaking.youtube": "Ver conferencias en YouTube",
    "speaking.orcid": "Lista completa de publicaciones (ORCID)",
    "link.read": "Leer",
    "link.view": "Ver",
    "pub.sub": "58 publicaciones científicas · ponente en AWS, Salesforce, Databricks, Wired y más",
    "pub.viewAll": "Ver lista completa",
    "pub.more": "Ver las más de 58 publicaciones",
    "pub.citations": "citas",
    "pubf.all": "Todas",
    "pubf.nlp": "PLN e IA",
    "pubf.poetry": "Poesía computacional",
    "pubf.dh": "Humanidades digitales",
    "pubf.medieval": "Estudios medievales",
    "pubtype.journal": "Revista",
    "pubtype.preprint": "Preprint",
    "pubtype.conference": "Congreso",
    "pubtype.chapter": "Capítulo de libro",
    "pubtype.book": "Libro",
    "contact.sub": "Invitaciones como ponente, consejos y asesoría, consultas de medios y colaboraciones de investigación.",
    "footer.rights": "© 2026 Elena González-Blanco García. Todos los derechos reservados.",
    "footer.top": "Volver arriba"
  }
};

let currentLang = localStorage.getItem('egb-lang') || 'en';
const decoder = document.createElement('textarea');

function decodeEntities(str) {
  decoder.innerHTML = str;
  return decoder.value;
}

function applyTranslations(lang) {
  const t = translations[lang];
  if (!t) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = decodeEntities(t[key]);
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) el.setAttribute('placeholder', decodeEntities(t[key]));
  });

  document.querySelectorAll('[data-i18n-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-label');
    if (t[key] !== undefined) {
      el.setAttribute('aria-label', decodeEntities(t[key]));
      el.setAttribute('title', decodeEntities(t[key]));
    }
  });

  document.querySelectorAll('[data-label-en]').forEach(el => {
    el.setAttribute('aria-label', el.getAttribute(lang === 'es' ? 'data-label-es' : 'data-label-en'));
  });

  document.documentElement.lang = lang;
  document.getElementById('langLabel').textContent = lang === 'en' ? 'ES' : 'EN';
  document.getElementById('langToggle').setAttribute('aria-label', lang === 'en' ? 'Cambiar a español' : 'Switch to English');
}

document.getElementById('langToggle').addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'es' : 'en';
  localStorage.setItem('egb-lang', currentLang);
  applyTranslations(currentLang);
});

applyTranslations(currentLang);
onScroll();
