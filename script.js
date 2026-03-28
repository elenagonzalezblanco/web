/* ============================================================
   Elena González-Blanco García — Personal Branding Website
   JavaScript — Interactions, Animations, Virtual Chat
   ============================================================ */

'use strict';

// ── Navbar scroll effect ──────────────────────────────────
const navbar = document.getElementById('navbar');
const navLinks = document.getElementById('navLinks');
const navToggle = document.getElementById('navToggle');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  updateActiveNavLink();
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
});

// Close nav when a link is clicked (mobile)
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Active section highlighting
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
}

// ── Intersection Observer for [data-aos] animations ──────
const aosElements = document.querySelectorAll('[data-aos]');
const aosObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('aos-animate');
      aosObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

aosElements.forEach(el => aosObserver.observe(el));

// ── Publication filter ────────────────────────────────────
const pubFilters = document.querySelectorAll('.pub-filter');
const pubCards   = document.querySelectorAll('.pub-card');

pubFilters.forEach(btn => {
  btn.addEventListener('click', () => {
    pubFilters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    pubCards.forEach(card => {
      const cats = (card.dataset.cat || '').split(' ');
      const show = filter === 'all' || cats.includes(filter);
      card.classList.toggle('hidden', !show);
    });
  });
});

// ── Chat Widget ───────────────────────────────────────────
const chatWidget    = document.getElementById('chatWidget');
const chatToggleBtn = document.getElementById('chatToggleBtn');
const chatPanel     = document.getElementById('chatPanel');
const chatMessages  = document.getElementById('chatMessages');
const chatInput     = document.getElementById('chatInput');
const chatSendBtn   = document.getElementById('chatSendBtn');
const chatNotif     = document.getElementById('chatNotif');
const chatIcon      = document.getElementById('chatIcon');
const chatCloseIcon = document.getElementById('chatCloseIcon');
const openChatBtn   = document.getElementById('openChatBtn');
const chatNavBtn    = document.getElementById('chatNavBtn');
const chatMinimize  = document.getElementById('chatMinimize');
let chatOpen = false;

function toggleChat(open) {
  chatOpen = open !== undefined ? open : !chatOpen;
  chatWidget.classList.toggle('chat-open', chatOpen);
  chatWidget.classList.toggle('chat-closed', !chatOpen);
  chatIcon.style.display     = chatOpen ? 'none'         : 'inline-block';
  chatCloseIcon.style.display = chatOpen ? 'inline-block' : 'none';
  if (chatOpen) {
    chatNotif && (chatNotif.style.display = 'none');
    chatInput.focus();
  }
}

chatToggleBtn.addEventListener('click', () => toggleChat());
chatMinimize.addEventListener('click', () => toggleChat(false));
if (openChatBtn) openChatBtn.addEventListener('click', () => toggleChat(true));
if (chatNavBtn) chatNavBtn.addEventListener('click', () => { toggleChat(true); });

document.querySelectorAll('.suggestion-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const msg = chip.dataset.msg;
    sendMessage(msg);
    chip.closest('.chat-suggestions')?.remove();
  });
});

// Send on Enter
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(chatInput.value.trim());
  }
});

chatSendBtn.addEventListener('click', () => {
  sendMessage(chatInput.value.trim());
});

function sendMessage(text) {
  if (!text) return;
  appendMessage(text, 'user');
  chatInput.value = '';
  document.querySelectorAll('.chat-suggestions').forEach(el => el.remove());
  const typing = appendTyping();
  const delay = 800 + Math.random() * 700;
  setTimeout(() => {
    typing.remove();
    const reply = getReply(text);
    appendMessage(reply, 'bot');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, delay);
}

function appendMessage(text, sender) {
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement('div');
  div.className = `chat-msg ${sender}`;

  if (sender === 'bot') {
    div.innerHTML = `
      <img src="Elena.jpg" alt="Elena" class="msg-avatar" />
      <div class="msg-bubble">
        <p>${escapeHtml(text)}</p>
        <span class="msg-time">${now}</span>
      </div>`;
  } else {
    div.innerHTML = `
      <div class="msg-bubble">
        <p>${escapeHtml(text)}</p>
        <span class="msg-time">${now}</span>
      </div>`;
  }

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function appendTyping() {
  const div = document.createElement('div');
  div.className = 'chat-msg bot typing-indicator';
  div.innerHTML = `
    <img src="Elena.jpg" alt="Elena" class="msg-avatar" />
    <div class="msg-bubble">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Virtual Elena Knowledge Base ─────────────────────────
const knowledge = [
  {
    patterns: [/hello|hi|hey|hola|greetings|buenos|ciao/i],
    responses: [
      "Hello! I'm Elena's virtual assistant. I'm here to tell you about her research in Digital Humanities, AI, and computational poetry analysis. What would you like to know?",
      "Hi there! I'm Virtual Elena — happy to chat about my work in NLP, Digital Humanities, or anything else you're curious about!",
    ]
  },
  {
    patterns: [/your name|who are you|what are you/i],
    responses: [
      "I'm a virtual representation of Elena González-Blanco García — an AI-powered chat assistant trained on her research, career, and expertise. Ask me anything!",
    ]
  },
  {
    patterns: [/research|work on|study|field/i],
    responses: [
      "My research sits at the intersection of Artificial Intelligence, Natural Language Processing, and Digital Humanities. I'm particularly passionate about using computational methods to analyze poetry — from medieval Spanish verse to modern multilingual corpora. I also work on Linked Open Data and ontological models for cultural heritage.",
      "At IE University, I research how AI and NLP can unlock insights in literary and historical texts. My work on poetry analysis uses transformers, language models, and computational metrics to study versification, metrical patterns, and stylistic features across centuries of literature.",
    ]
  },
  {
    patterns: [/postdata|erc|linked.open.data|ontolog/i],
    responses: [
      "POSTDATA was my European Research Council (ERC) Starting Grant project — one of the highlights of my career! The goal was to standardize the concepts used to describe European poetry and publish those rich datasets as Linked Open Data on the Semantic Web. We built a network of ontologies connecting poetry traditions from Spanish, Italian, French, Portuguese, to German and beyond. It was a landmark project in Digital Humanities.",
    ]
  },
  {
    patterns: [/rantanplan|scansion|syllabif|metric/i],
    responses: [
      "Rantanplan is a tool I co-developed for the automatic syllabification and metrical scansion of Spanish poetry. It's one of the most accurate tools of its kind. We later built Alberti — a multilingual domain-specific language model based on BERT/Transformers — specifically fine-tuned for poetry analysis Tasks. These tools let us analyze thousands of poems at scale!",
    ]
  },
  {
    patterns: [/alberti|language model|bert|transformer|llm/i],
    responses: [
      "Alberti is a domain-specific language model I helped develop for poetry analysis. It's built on transformer architectures (similar to BERT) and fine-tuned on a multilingual poetry corpus. It can predict metrical patterns, classify stanza types, and understand poetic structure with much higher accuracy than general-purpose models. Named after Rafael Alberti, the Spanish poet!",
    ]
  },
  {
    patterns: [/disco|sonnet|diachronic|corpus/i],
    responses: [
      "The DISCO (Diachronic Spanish Sonnet Corpus) is a project I was deeply involved in. It's a large TEI-encoded collection of Spanish sonnets spanning from the 15th to the 19th century, enriched with metrical annotations and Linked Open Data. We used it to study how the sonnet form evolved over centuries — tracking changes in metrical patterns, rhyme schemes, and enjambment.",
    ]
  },
  {
    patterns: [/linhd|lab|uned|innovation|humanities lab/i],
    responses: [
      "I founded LINHD — the Laboratorio de Innovación en Humanidades Digitales — at UNED (Spain's national distance university). It was one of Spain's first dedicated Digital Humanities research labs. We worked on digital editions, medieval text corpora, computational linguistics, and AI applications in cultural heritage. A truly exciting chapter of my career!",
    ]
  },
  {
    patterns: [/remetca|medieval metric|medieval spanish|cuaderna/i],
    responses: [
      "ReMetCa (Repertorio Digital de Métrica Medieval Castellana) was the first online digital repertoire of Medieval Spanish metrics and poetry. I built it integrating TEI-XML encoding with relational databases. My early research focused on medieval Spanish verse forms like the cuaderna vía, which I studied in a pan-Romance European context — looking at connections with Old French, Italian, and Latin poetry.",
    ]
  },
  {
    patterns: [/ie university|ie school|where.*work|current.*position|professor/i],
    responses: [
      "I'm currently an Associate Professor at IE University in Madrid — specifically at the IE Human Language and Technology School and the Business School. IE is a wonderful place that truly values interdisciplinarity. I teach and research at the intersection of AI, language sciences, and the humanities.",
    ]
  },
  {
    patterns: [/education|degree|phd|doctorate|study|background|qualif/i],
    responses: [
      "My educational background is wonderfully eclectic! I hold a PhD in Spanish Literature (2008), a Master in Digital Libraries and Information Systems (2014), a Degree in Spanish Philology (2004), and a Degree in Classics (2005) — all from Madrid universities. That combination of literary scholarship, information science, and classical languages is really what drives my interdisciplinary research.",
    ]
  },
  {
    patterns: [/digital humanities|dh|humanities.digital/i],
    responses: [
      "Digital Humanities is the field that brings computational methods to humanistic inquiry. It's about using AI, data analysis, Linked Open Data, and text technologies to study literature, history, culture, and language in new ways. I've been one of the pioneers of Digital Humanities in Spain — I founded LINHD, served as President of the Spanish DH Association (HDH), and helped establish the CLARIN infrastructure in Spain.",
    ]
  },
  {
    patterns: [/nlp|natural language|text mining|computational linguistics/i],
    responses: [
      "Natural Language Processing is central to my work. I use NLP techniques — named entity recognition, metrical analysis, sequence labeling, language modeling — on literary and historical texts. One particularly interesting challenge is applying NLP to medieval Spanish, which has very different linguistic features from modern text. My group developed specialized NER tools for 12th–15th century Spanish.",
    ]
  },
  {
    patterns: [/citation|publication|paper|author|publi/i],
    responses: [
      "I have 58+ publications and over 1,629 citations on Google Scholar. My most cited work includes surveys on computational poetry analysis, transformer-based metrical prediction, and the DISCO sonnet corpus. I publish in venues like Digital Scholarship in the Humanities, IEEE Access, Neural Computing and Applications, and ACL proceedings.",
    ]
  },
  {
    patterns: [/award|grant|erc|prize|fund/i],
    responses: [
      "The biggest research award I've received was the ERC Starting Grant for the POSTDATA project — this was a European Research Council grant, which is one of the most prestigious and competitive research grants in Europe. It funded our work on standardizing and publishing European poetry as Linked Open Data.",
    ]
  },
  {
    patterns: [/eadh|adho|clarin|hdh|committee|president|secretary/i],
    responses: [
      "I've been deeply involved in international Digital Humanities governance! I'm on the Executive Committee of EADH (European Association for Digital Humanities) and Centernet, a member of the CLARIN Scientific Advisory Board, former Secretary of ADHO (Alliance of Digital Humanities Organizations), and former President of HDH — the Spanish Association for Digital Humanities. These roles have been important for shaping the field internationally.",
    ]
  },
  {
    patterns: [/poetry|poem|verse|stanza|rhyme|metric/i],
    responses: [
      "Poetry is my lifelong passion! From my early research on medieval verse forms to my current work on AI-powered poetry analysis, I've always been drawn to the musicality of language. I find it fascinating how computational methods can reveal patterns in poetry that human readers might miss — like statistical regularities in metrical choices across centuries, or how enjambment evolved over time.",
    ]
  },
  {
    patterns: [/ai|artificial intelligence|machine learning|deep learning/i],
    responses: [
      "AI is transforming what's possible in humanities research. In my work, I use language models, transformers, and machine learning to analyze literary texts at scale. The exciting challenge is adapting AI tools — typically trained on modern text — to handle the peculiarities of historical language, poetic form, and multilingual corpora. My research helps bridge these two worlds.",
    ]
  },
  {
    patterns: [/contact|email|reach|collaborate/i],
    responses: [
      "I'd love to collaborate! You can reach me through IE University: elena.gonzalez@faculty.ie.edu, or connect with me on LinkedIn at linkedin.com/in/elena-gonzalez-blanco/. I'm always interested in interdisciplinary collaborations at the intersection of AI, language, and culture.",
    ]
  },
  {
    patterns: [/madrid|spain|spanish|españa/i],
    responses: [
      "Madrid is my home and base! I've spent most of my academic career here — at UNED and now at IE University. Spain has a rich tradition in medieval literature that deeply informs my research, and the Spanish Digital Humanities community I helped build has become a vibrant international hub.",
    ]
  },
  {
    patterns: [/teach|course|class|student|lecture/i],
    responses: [
      "Teaching is one of the things I love most. At IE University I teach courses on Digital Humanities, Natural Language Processing, and Language Technologies. I love helping students from business, tech, and humanities backgrounds discover how AI can transform how we understand language and culture. The interdisciplinary mix at IE makes every class a new adventure!",
    ]
  },
  {
    patterns: [/language model|llm|gpt|chatgpt|generative/i],
    responses: [
      "Large language models like GPT are fascinating from my perspective! As someone who has built domain-specific language models for poetry (like Alberti), I'm very aware of both the potential and limitations. General LLMs are impressive but can struggle with specialized domains like medieval verse or poetic meter — that's exactly why domain-specific fine-tuning matters so much in my research.",
    ]
  },
  {
    patterns: [/interview|talk|speaker|keynote|conference/i],
    responses: [
      "I've spoken at numerous international conferences in Digital Humanities (DH), computational linguistics (ACL, CLARIN Annual Conference), and AI. I enjoy sharing my interdisciplinary perspective — showing AI researchers the richness of literary data, and showing humanities scholars the power of computational approaches. If you're interested in having me speak, please get in touch!",
    ]
  },
  {
    patterns: [/future|next|plan|upcoming/i],
    responses: [
      "I'm very excited about the future! I'm exploring how generative AI can assist with the analysis and preservation of endangered poetic traditions, and how LLMs can be made to genuinely understand — not just pattern-match — literary language. I'm also deepening my work on the intersection of AI ethics and cultural heritage.",
    ]
  },
  {
    patterns: [/fun|hobby|free time|interest|outside/i],
    responses: [
      "Outside of research? I'm still passionate about poetry — reading it, not just analyzing it computationally! I love traveling, exploring different literary traditions across cultures, and cooking. And yes, I do sometimes find myself thinking about metrical patterns in the songs I listen to!",
    ]
  },
  {
    patterns: [/thank|thanks|gracias|merci|grazie/i],
    responses: [
      "You're very welcome! It's always a pleasure to share about my work and research. Feel free to ask anything else!",
      "De nada! Happy to help. Is there anything else you'd like to know about Digital Humanities, poetry analysis, or my research?",
    ]
  },
  {
    patterns: [/bye|goodbye|hasta luego|ciao|see you/i],
    responses: [
      "Goodbye! It was lovely chatting. Don't hesitate to reach out if you'd like to know more about my research or collaborate. ¡Hasta pronto!",
    ]
  },
];

const fallbackResponses = [
  "That's an interesting question! My research spans Digital Humanities, NLP, and computational poetry. Could you rephrase, or ask something more specific? I love talking about my work!",
  "I'm not sure I have a perfect answer for that, but I'd love to discuss my work on AI-powered poetry analysis, the POSTDATA project, or Digital Humanities in Spain. What are you most curious about?",
  "Hmm, I'm not certain about that specific topic. But feel free to ask me about my publications, the ERC POSTDATA project, computational poetry tools like Rantanplan or Alberti, or my work at IE University!",
  "Great question! While I may not have all the details handy, the best way to reach me is via LinkedIn or email. I'd love to continue the conversation!",
];

function getReply(text) {
  const lower = text.toLowerCase();
  for (const item of knowledge) {
    for (const pattern of item.patterns) {
      if (pattern.test(lower)) {
        const arr = item.responses;
        return arr[Math.floor(Math.random() * arr.length)];
      }
    }
  }
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

// ── Smooth scroll for anchor links ───────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68);
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});

// ── Init ─────────────────────────────────────────────────
updateActiveNavLink();

// ── Internationalisation (EN / ES) ───────────────────────
const translations = {
  en: {
    'nav.about':        'About',
    'nav.experience':   'Experience',
    'nav.speaking':     'Speaking',
    'nav.publications': 'Publications',
    'nav.projects':     'Projects',
    'nav.contact':      'Contact',

    'hero.eyebrow': 'Head of Artificial Intelligence for Digital Natives at Microsoft EMEA · Cofounder at Clibrain · NLP, Insurtech, Fintech & Digital Innovation Expert · Board Member · PhD · Keynote Speaker',
    'hero.tagline': 'AI executive, serial entrepreneur, and keynote speaker — turning <span class="highlight">Artificial Intelligence</span> into business impact across <span class="highlight">Europe\'s most ambitious companies</span>.',
    'hero.meta1':   'Microsoft EMEA',
    'hero.meta2':   'Serial Entrepreneur · 3× CEO',
    'hero.meta3':   'Forbes Top 100 · Choiseul #1',
    'hero.btn1':    'My Journey',
    'hero.btn2':    'Book a Talk',
    'hero.stat1':   'CEO & Founder',
    'hero.stat2':   'Exit (Aon)',
    'hero.stat3':   'ERC Grants',
    'hero.scroll':  'Scroll',

    'about.label': '01 / About',
    'about.title': 'AI. Business. Impact.<br /><em>At Scale.</em>',
    'about.bio': '<p>Elena González-Blanco is the Head of Artificial Intelligence &amp; Data for Digital Natives (Startups &amp; Unicorns) at Microsoft for EMEA. Previously, she was the Co-Founder and CEO of Clibrain, a generative AI startup specializing in the creation of large language models tailored to the Spanish-speaking community. She is also an Independent Board Member at Traxion and formerly served as an Independent Board Member and Chair of the Audit Committee at LLYC, as well as a member of the Advisory Board to the CEO of Astara, part of the M&amp;A fund Albia Capital.</p><p>Earlier in her career, Elena was Global Head of Digital for Wealth Management and Insurance at Banco Santander (EVP), General Manager for Europe at CoverWallet — an insurtech startup acquired by Aon in January 2020 — and a member of the Aon Iberia Executive Committee. Prior to that, she led Artificial Intelligence Product Development at Minsait (Indra).</p><p>Elena is an expert in Artificial Intelligence and Digital Innovation, with a special focus on language technologies and international interdisciplinary projects. She holds a PhD from Universidad Complutense, a Master\'s in Digital Information Systems from UC3M, and has completed executive programs at LSE London, MIT, and ESADE. A renowned international researcher, she has worked at Harvard University, King\'s College London, UNAM, Bonn, and UNED. She is currently an Associate Professor of Artificial Intelligence Applied to Business at IE Business School and also teaches at ICAI and AFI.</p><p>Fluent in English, French, German, and Italian, Elena has been recognized as one of the Top 100 Female Leaders in Spain (2016, 2017, 2018) and was awarded the Julián Marías Prize in 2017 for researchers under 40. She ranked #1 and #3 in the Choiseul "100 Economic Leaders for the Future of Spain" (2018, 2019), was named among the #40under40 Insurance Leaders in Spain (2020), and received the 2021 WIDS Prize for Women in Machine Learning and Data Science. She is the mother of four children.</p>',

    'exp.label': '02 / Experience',
    'exp.title': 'Career <em>Timeline</em>',

    'exp.job1.title': 'Head of Artificial Intelligence &amp; Data for Digital Natives (Unicorns &amp; Startups) — EMEA',
    'exp.job1.date':  'Feb 2024 — Present',
    'exp.job1.desc':  'Leader of the Technical Sales Specialists team across France, Germany, Switzerland, and CEMA within the sales organization (MCAPs). Driving AI and Data adoption for the fastest-growing tech companies in Europe. Sales target +€100M/yr with 80% YoY growth.',

    'exp.job2.title': 'Independent Board Member',
    'exp.job2.date':  '2024 — Present',
    'exp.job2.desc':  'Independent Board Member at Traxion, one of Mexico\'s leading logistics and transportation conglomerates. Advising on AI strategy, digital transformation, and technology-driven growth.',

    'exp.job3.title': 'Associate Professor',
    'exp.job3.date':  'Sep 2018 — Present',
    'exp.job3.desc':  'Teaching at the intersection of AI and business. Courses include "Artificial Intelligence and Language Technologies" (Big Data &amp; Business Analytics), "AI and Machine Learning: Applications" (MSc Computer Science &amp; Business Technology), and AI for Digital Finance.',

    'exp.job4.title': 'Advisory Board Member to the CEO',
    'exp.job4.date':  '2022 — 2024',
    'exp.job4.desc':  'Strategic advisor to the CEO of Astara, one of Europe\'s largest automotive distribution groups, on AI adoption, digital transformation, and innovation strategy.',

    'exp.job5.title': 'Independent Board Member — Audit &amp; Remuneration Committees',
    'exp.job5.date':  '2021 — 2024',
    'exp.job5.desc':  'Independent Board Member and President of the Audit Committee; member of the Appointments and Remuneration Committee at LLYC, a leading international communications and public affairs group listed on BME Growth.',

    'exp.job6.title': 'Cofounder &amp; CEO',
    'exp.job6.date':  '2023 — Jan 2024',
    'exp.job6.desc':  'Co-founded ClibrAIn, a Generative AI startup building language models and operational intelligence solutions for Spanish-speaking companies. Developed LINCE — a Spanish LLM ecosystem of 40+ models generating $100k+ ARR. Hired 20+ top AI researchers from AWS, Google, Oracle, and Meta. Key customer: UNIR (20% improvement in student retention via Call Center analytics).',

    'exp.job7.title': 'Global Head of Digital — Wealth Management &amp; Insurance',
    'exp.job7.date':  '2021 — 2022',
    'exp.job7.desc':  'Global Executive Vice-President responsible for the Digital Strategy across Private Banking, Asset Management, and Insurance at Grupo Santander — overseeing 10 countries and transforming a business of €2.3bn. Key initiative: Data Analytics project on multi-channel insurance sales funnel with 10% sales increase on first pilot (Spain &amp; Portugal).',

    'exp.job8.title': 'General Manager Europe · Member of ExCo Aon Iberia',
    'exp.job8.date':  '2018 — 2021',
    'exp.job8.desc':  'GM of Europe at CoverWallet (400+ employees, backed by Union Square, Index, Highland Capital &amp; Two Sigma; acquired by Aon for $330M). Led EU expansion managing Operations, Sales, Marketing, and Product with 20+ direct reports. P&amp;L of Switzerland, Spain, France, and UK generating €5M+ revenue. Sealed partnership deals with Zurich and Chubb in EMEA. 15% improvement in Lead conversion and 50% increase in cross-selling. Member of ExCo of Aon Iberia post-acquisition (2020–2021).',

    'exp.job9.title': 'Head of Artificial Intelligence Product Development',
    'exp.job9.date':  '2017 — 2018',
    'exp.job9.desc':  'Led the development of an AI-based cognitive platform focused on automated analysis and generation of language, combining Natural Language Processing, Machine Learning, and Deep Learning technologies. Implemented a solution for mortgage process automation by applying AI to extract information from BPO documents — reducing costs (FTEs) and errors by 20%.',

    'exp.job10.title': 'Founder &amp; Director — LINHD (Digital Humanities Innovation Lab)',
    'exp.job10.date':  '2014 — 2017',
    'exp.job10.desc':  'Founded and directed LINHD — Spain\'s pioneering Digital Humanities research laboratory at UNED, raising €1.5M in funding. Led key IT projects in Natural Language Processing and database interoperability (George Eckert Institute, Germany), digital transformation projects for the Spanish National Library, and training &amp; consulting programs across LatAm. Managed a team of 10.',

    'exp.job11.title': 'Associate Professor &amp; Government Board Member',
    'exp.job11.date':  '2009 — 2017',
    'exp.job11.desc':  'Associate Professor at UNED in Spanish Language, Literature, and Digital Humanities. Elected Member of the UNED Government Board for 3 years; Member of the Faculty Government Council, serving as Secretary for 2.5 years. Holder of two European Research Council (ERC) grants — including the ERC Starting Grant for the POSTDATA project on Poetry Standardization and Linked Open Data.',

    'exp.job12.title': 'Visiting Fellow &amp; Teaching Assistant',
    'exp.job12.date':  '2006 — 2008',
    'exp.job12.desc':  'Visiting Fellow and Teaching Assistant at the Radcliffe Center for Advanced Study (RCC) at Harvard University, supported by a MAE-AECI grant. Research focused on Medieval Spanish metrics and comparative Romance versification — the foundation of her PhD awarded with the "Doctor Europeus" distinction and the Extraordinary Prize.',

    'speaking.label': '03 / Speaking',
    'speaking.title': 'Selected Keynotes &amp; <em>Publications</em>',

    'pub.label': '04 / Research',
    'pub.title': 'Academic Publications &amp; <em>Research Papers</em>',

    'projects.label': '05 / Projects',
    'projects.title': 'Key Research <em>Initiatives</em>',

    'contact.label':            '06 / Contact',
    'contact.title':            'Let\'s <em>Work Together</em>',
    'contact.name':             'Name',
    'contact.namePlaceholder':  'Your full name',
    'contact.email':            'Email',
    'contact.subject':          'Subject',
    'contact.opt1':             'Speaking invitation',
    'contact.opt2':             'AI advisory / board role',
    'contact.opt3':             'Media inquiry',
    'contact.opt4':             'Research collaboration',
    'contact.opt5':             'Other',
    'contact.message':          'Message',
    'contact.messagePlaceholder': 'Write your message here…',
    'contact.send':             'Send Message',

    'footer.tagline': 'Elena González-Blanco García<br />Head of AI · Microsoft EMEA · Serial Entrepreneur · Keynote Speaker',

    'chat.intro':  'Hello! I\'m Elena\'s virtual assistant — trained on her research, career, and interests. Ask me anything about Digital Humanities, AI, poetry analysis, or my academic journey!',
    'chat.chip1':  'What is your research about?',
    'chat.chip2':  'About POSTDATA',
    'chat.chip3':  'What is Digital Humanities?',
    'chat.chip4':  'Where do you work?',
    'chat.placeholder': 'Ask Elena anything…',

    'avatar.btn': 'Chat with my Avatar',
  },
  es: {
    'nav.about':        'Sobre mí',
    'nav.experience':   'Experiencia',
    'nav.speaking':     'Conferencias',
    'nav.publications': 'Publicaciones',
    'nav.projects':     'Proyectos',
    'nav.contact':      'Contacto',

    'hero.eyebrow': 'Head of Artificial Intelligence para Digital Natives en Microsoft EMEA · Cofundadora en Clibrain · Experta en NLP, Insurtech, Fintech e Innovación Digital · Consejera · Doctora · Conferenciante',
    'hero.tagline': 'Directiva de IA, emprendedora en serie y conferenciante internacional — transformando la <span class="highlight">Inteligencia Artificial</span> en impacto real para las <span class="highlight">empresas más ambiciosas de Europa</span>.',
    'hero.meta1':   'Microsoft EMEA',
    'hero.meta2':   'Emprendedora en serie · 3× CEO',
    'hero.meta3':   'Forbes Top 100 · Choiseul nº 1',
    'hero.btn1':    'Mi Trayectoria',
    'hero.btn2':    'Reservar Conferencia',
    'hero.stat1':   'CEO y Fundadora',
    'hero.stat2':   'Exit (Aon)',
    'hero.stat3':   'Proyectos ERC',
    'hero.scroll':  'Desplaza',

    'about.label': '01 / Sobre mí',
    'about.title': 'IA. Empresa. Impacto.<br /><em>A Escala.</em>',
    'about.bio': '<p>Elena González-Blanco es la Head of Artificial Intelligence and Data for Digital Natives (Unicorns &amp; Startups) para EMEA en Microsoft. Anteriormente fue Cofundadora y CEO de Clibrain, una startup de IA generativa para el desarrollo de LLMs en el ámbito hispanohablante. Es además Consejera Independiente de Traxion y ha sido Consejera Independiente y Presidenta de la Comisión de Auditoría de LLYC y miembro del Advisory Board del CEO de Astara.</p><p>Previamente, fue Global Head of Digital for Wealth Management and Insurance en Banco Santander (EVP), y antes la General Manager de Europa en la startup de insurtech CoverWallet, adquirida por AON en enero de 2020, donde además fue miembro del Comité Ejecutivo de AON Iberia. Anteriormente, fue la Responsable de Desarrollo de Producto en Inteligencia Artificial en Minsait-Indra.</p><p>Experta en Inteligencia Artificial y Transformación Digital, es especialista en el ámbito de la tecnología lingüística. Es Doctora en Filología Hispánica por la Universidad Complutense de Madrid y Máster en Sistemas de Información por la UC3M, ha cursado programas de formación ejecutiva en LSE Londres, MIT y ESADE. Ha sido docente e investigadora en Harvard University y actualmente es profesora en el IE Business School de Inteligencia Artificial aplicada a negocio, además de impartir clases en ICAI y en AFI. Investigadora de reconocido prestigio internacional, lidera POSTDATA, proyecto de investigación europeo de excelencia ERC sobre procesamiento del lenguaje y web semántica (+1M€), seguido por LYRAICS, que se enfocó en la recomendación musical utilizando IA para el análisis de las letras de canciones en español.</p><p>Elegida número #1 en 2018 y #3 en 2019 del Ranking Choiseul "Líderes Económicos del futuro de España", ha sido seleccionada como una de las Top 100 mujeres de España en las ediciones de 2016, 2017 y 2018, y galardonada con el premio de investigación Julián Marías 2017 en la categoría de menores de 40 años, el premio WIDS 2021 para Mujeres en Machine Learning y Ciencia de Datos. Habla inglés, francés, alemán e italiano y es madre de 4 hijos.</p>',

    'exp.label': '02 / Experiencia',
    'exp.title': 'Trayectoria <em>Profesional</em>',

    'exp.job1.title': 'Responsable de Inteligencia Artificial y Datos para Digital Natives (Unicornios y Startups) — EMEA',
    'exp.job1.date':  'Feb 2024 — Actualidad',
    'exp.job1.desc':  'Líder del equipo de Technical Sales Specialists en Francia, Alemania, Suiza y CEMA dentro de la organización de ventas (MCAPs). Impulsando la adopción de IA y Datos en las empresas tecnológicas de mayor crecimiento en Europa. Objetivo de ventas +100M€/año con un crecimiento del 80% interanual.',

    'exp.job2.title': 'Consejera Independiente',
    'exp.job2.date':  '2024 — Actualidad',
    'exp.job2.desc':  'Consejera Independiente en Traxion, uno de los principales conglomerados de logística y transporte de México. Asesoramiento en estrategia de IA, transformación digital y crecimiento tecnológico.',

    'exp.job3.title': 'Profesora Asociada',
    'exp.job3.date':  'Sep 2018 — Actualidad',
    'exp.job3.desc':  'Docencia en la intersección entre IA y negocio. Asignaturas: "Inteligencia Artificial y Tecnologías del Lenguaje" (Big Data y Business Analytics), "IA y Machine Learning: Aplicaciones" (MSc en Computer Science y Business Technology), e IA para Finanzas Digitales.',

    'exp.job4.title': 'Miembro del Advisory Board del CEO',
    'exp.job4.date':  '2022 — 2024',
    'exp.job4.desc':  'Asesora estratégica del CEO de Astara, uno de los mayores grupos de distribución de automoción de Europa, en adopción de IA, transformación digital y estrategia de innovación.',

    'exp.job5.title': 'Consejera Independiente — Comisiones de Auditoría y Retribuciones',
    'exp.job5.date':  '2021 — 2024',
    'exp.job5.desc':  'Consejera Independiente y Presidenta de la Comisión de Auditoría; miembro de la Comisión de Nombramientos y Retribuciones en LLYC, grupo internacional líder en comunicación y asuntos públicos cotizado en BME Growth.',

    'exp.job6.title': 'Cofundadora y CEO',
    'exp.job6.date':  '2023 — Ene 2024',
    'exp.job6.desc':  'Cofundó ClibrAIn, una startup de IA Generativa para el desarrollo de modelos de lenguaje e inteligencia operacional para empresas hispanohablantes. Desarrolló LINCE, un ecosistema de LLMs en español con más de 40 modelos y más de 100.000 USD de ARR. Contrató a más de 20 investigadores de primer nivel procedentes de AWS, Google, Oracle y Meta. Cliente clave: UNIR (mejora del 20% en retención de alumnos mediante analítica de Call Center).',

    'exp.job7.title': 'Global Head of Digital — Banca Privada y Seguros',
    'exp.job7.date':  '2021 — 2022',
    'exp.job7.desc':  'Vicepresidenta Ejecutiva Global responsable de la Estrategia Digital en Banca Privada, Gestión de Activos y Seguros en Grupo Santander — supervisando 10 países y transformando un negocio de 2.300M€. Iniciativa clave: proyecto de Data Analytics sobre el funnel de ventas multicanal de seguros con un incremento del 10% en ventas en el primer piloto (España y Portugal).',

    'exp.job8.title': 'Directora General Europa · Miembro del ComEx Aon Iberia',
    'exp.job8.date':  '2018 — 2021',
    'exp.job8.desc':  'Directora General de Europa en CoverWallet (más de 400 empleados, respaldada por Union Square, Index, Highland Capital y Two Sigma; adquirida por Aon por 330M$). Lideró la expansión europea gestionando Operaciones, Ventas, Marketing y Producto con más de 20 reportes directos. P&L en Suiza, España, Francia y Reino Unido con más de 5M€ de ingresos. Cerró acuerdos de partnership con Zurich y Chubb en EMEA. Mejora del 15% en conversión de leads y del 50% en cross-selling. Miembro del ComEx de Aon Iberia tras la adquisición (2020–2021).',

    'exp.job9.title': 'Responsable de Desarrollo de Producto en Inteligencia Artificial',
    'exp.job9.date':  '2017 — 2018',
    'exp.job9.desc':  'Lideró el desarrollo de una plataforma cognitiva basada en IA centrada en el análisis y la generación automatizada del lenguaje, combinando Procesamiento del Lenguaje Natural, Machine Learning y Deep Learning. Implementó una solución de automatización del proceso hipotecario aplicando IA para extraer información de documentos BPO — reduciendo costes (FTEs) y errores en un 20%.',

    'exp.job10.title': 'Fundadora y Directora — LINHD (Laboratorio de Innovación en Humanidades Digitales)',
    'exp.job10.date':  '2014 — 2017',
    'exp.job10.desc':  'Fundó y dirigió LINHD, el primer laboratorio de Humanidades Digitales de España en la UNED, captando 1,5M€ en financiación. Lideró proyectos clave de PLN e interoperabilidad de bases de datos (Georg Eckert Institut, Alemania), proyectos de transformación digital para la Biblioteca Nacional de España, y programas de formación y consultoría en América Latina. Equipo de 10 personas.',

    'exp.job11.title': 'Profesora Titular y Miembro del Claustro de Gobierno',
    'exp.job11.date':  '2009 — 2017',
    'exp.job11.desc':  'Profesora Titular en la UNED en Lengua y Literatura Española y Humanidades Digitales. Miembro electa del Claustro de Gobierno de la UNED durante 3 años; miembro del Consejo de Gobierno de la Facultad, ejerciendo como Secretaria durante 2,5 años. Titular de dos proyectos de investigación del Consejo Europeo de Investigación (ERC), incluido el ERC Starting Grant para el proyecto POSTDATA sobre Estandarización de la Poesía y Datos Enlazados.',

    'exp.job12.title': 'Visiting Fellow y Teaching Assistant',
    'exp.job12.date':  '2006 — 2008',
    'exp.job12.desc':  'Visiting Fellow y Profesora Ayudante en el Radcliffe Center for Advanced Study (RCC) de la Universidad de Harvard, con una beca MAE-AECI. La investigación se centró en la métrica medieval española y la versificación románica comparada, base de su tesis doctoral, galardonada con la distinción "Doctor Europeus" y el Premio Extraordinario.',

    'speaking.label': '03 / Conferencias',
    'speaking.title': 'Keynotes &amp; <em>Publicaciones seleccionadas</em>',

    'pub.label': '04 / Investigación',
    'pub.title': 'Publicaciones académicas &amp; <em>Artículos científicos</em>',

    'projects.label': '05 / Proyectos',
    'projects.title': 'Iniciativas de <em>Investigación</em>',

    'contact.label':            '06 / Contacto',
    'contact.title':            '¿<em>Trabajamos juntos</em>?',
    'contact.name':             'Nombre',
    'contact.namePlaceholder':  'Tu nombre completo',
    'contact.email':            'Correo',
    'contact.subject':          'Asunto',
    'contact.opt1':             'Invitación como ponente',
    'contact.opt2':             'Asesoría IA / rol en consejo',
    'contact.opt3':             'Consulta de medios',
    'contact.opt4':             'Colaboración en investigación',
    'contact.opt5':             'Otro',
    'contact.message':          'Mensaje',
    'contact.messagePlaceholder': 'Escribe tu mensaje aquí…',
    'contact.send':             'Enviar mensaje',

    'footer.tagline': 'Elena González-Blanco García<br />Directora de IA · Microsoft EMEA · Emprendedora en serie · Conferenciante',

    'chat.intro':  '¡Hola! Soy el asistente virtual de Elena, entrenado con su investigación, carrera e intereses. ¡Pregúntame lo que quieras sobre Humanidades Digitales, IA, análisis computacional de poesía o su trayectoria académica!',
    'chat.chip1':  '¿En qué investiga?',
    'chat.chip2':  'El proyecto POSTDATA',
    'chat.chip3':  '¿Qué son las Humanidades Digitales?',
    'chat.chip4':  '¿Dónde trabaja?',
    'chat.placeholder': 'Pregunta a Elena lo que quieras…',

    'avatar.btn': 'Chatea con mi Avatar',
  }
};

let currentLang = localStorage.getItem('egb-lang') || 'en';

function applyTranslations(lang) {
  const t = translations[lang];
  if (!t) return;

  // Plain text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });

  // HTML content elements
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  // Placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) el.setAttribute('placeholder', t[key]);
  });

  // Select option text
  document.querySelectorAll('option[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });

  // Update <html lang>
  document.documentElement.lang = lang;
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'es' : 'en';
  localStorage.setItem('egb-lang', currentLang);
  document.getElementById('langLabel').textContent = currentLang === 'en' ? 'ES' : 'EN';
  applyTranslations(currentLang);
}

document.getElementById('langToggle').addEventListener('click', toggleLanguage);

// Apply saved language on load
document.getElementById('langLabel').textContent = currentLang === 'en' ? 'ES' : 'EN';
applyTranslations(currentLang);

// ── Twinfluence Avatar Widget ─────────────────────────────
(function () {
  const widget    = document.getElementById('avatar-widget');
  const toggleBtn = document.getElementById('avatar-toggle');
  const frameWrap = document.getElementById('avatar-frame-wrap');
  const closeBtn  = document.getElementById('avatar-close');
  const iframe    = document.getElementById('avatar-iframe');

  if (!widget || !toggleBtn || !frameWrap || !closeBtn) return;

  // Lazy-load the iframe src only when first opened
  const realSrc = iframe.getAttribute('src');
  iframe.removeAttribute('src');

  function openAvatar() {
    if (!iframe.src || iframe.src === window.location.href) {
      iframe.src = realSrc;
    }
    frameWrap.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closeAvatar() {
    frameWrap.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  toggleBtn.addEventListener('click', () => {
    frameWrap.classList.contains('open') ? closeAvatar() : openAvatar();
  });

  closeBtn.addEventListener('click', closeAvatar);
})();
