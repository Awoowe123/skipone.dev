/**
 * ═══════════════════════════════════════════════════
 * PROJECTS DATA — edit this array to add/remove projects
 * The site renders one drawing sheet per entry.
 * ═══════════════════════════════════════════════════
 *
 * Each project object:
 *   id        — unique DOM id (used for patch-bay connections)
 *   sheet     — sheet number printed in the stamp, like 01 or M1
 *   title     — { ru, en } project name
 *   desc      — { ru, en } one line about what it is
 *   stack     — tech stack string
 *   url       — live URL, or null when there is nothing to open
 *   state     — "production" | "open" | "wip"  (drives the stamp)
 *   note      — { ru, en } replaces the link when url is null
 *   git       — GitHub URL or null
 *   preview   — image URL for the hover preview
 *   muted     — true for work handed over to me, not started by me
 *   wide      — true to stretch the sheet over two columns of the rack
 */
const PROJECTS_DATA = [
  {
    id: "proj-eduklass",
    sheet: "01",
    title: { ru: "ЭдуКласс Расписание", en: "EduKlass Schedule" },
    desc: { ru: "Расписание пар колледжа. Сайт, админка, боты в Telegram и MAX.", en: "College class timetable. Website, admin panel, Telegram and MAX bots." },
    stack: "Next.js · NestJS · Prisma · PostgreSQL",
    url: "https://eduklass.ru",
    state: "production",
    wide: true,
    preview: "previews/shkkrit.webp"
  },
  {
    id: "proj-kvestnik",
    sheet: "02",
    title: { ru: "Квестник", en: "Kvestnik" },
    desc: { ru: "Викторины на паре в реальном времени.", en: "Live quizzes during class." },
    stack: "Next.js · NestJS · Socket.IO · Redis",
    url: "https://kvestnik.ru",
    state: "production",
    preview: "previews/eduplay.webp"
  },
  {
    id: "proj-kvcg",
    sheet: "03",
    title: { ru: "КВ Лидер", en: "KVCG" },
    desc: { ru: "Лендинг для компании.", en: "Landing page for a company." },
    stack: "Next.js · Three.js · GSAP · Framer Motion",
    url: "https://kvcg.ru",
    state: "production"
  },
  {
    id: "proj-skiponeai",
    sheet: "04",
    title: { ru: "SkipOneAI", en: "SkipOneAI" },
    desc: { ru: "Telegram-двойник: поиск по своим сообщениям, свой слог", en: "Telegram twin: retrieval over my own messages, my own voice" },
    stack: "Python · RAG · Whisper · Telethon",
    url: null,
    note: { ru: "нет публичной версии", en: "no public instance" },
    git: "https://github.com/Awoowe123/SkipOneAI",
    state: "open",
    preview: "https://opengraph.githubassets.com/1/Awoowe123/SkipOneAI"
  },
  {
    id: "proj-chronos",
    sheet: "M1",
    title: { ru: "ChronOS", en: "ChronOS" },
    desc: { ru: "Учёт посещаемости колледжа. Часть экосистемы ЭдуКласса.", en: "College attendance tracking. Part of the EduKlass ecosystem." },
    stack: "Next.js · React Native · Prisma · PostgreSQL",
    url: null,
    note: { ru: "закрытый контур, показываю по запросу", en: "closed circuit, shown on request" },
    state: "wip",
    muted: true,
    preview: "previews/chronos.webp"
  }
];

/** Stamp wording per state, printed in the sheet's title block. */
const PROJECT_STATES = {
  production: { ru: "В ПРОИЗВОДСТВЕ", en: "IN PRODUCTION" },
  open: { ru: "ИСХОДНИК ОТКРЫТ", en: "SOURCE OPEN" },
  wip: { ru: "В РАЗРАБОТКЕ", en: "IN DEVELOPMENT" }
};
