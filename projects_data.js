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
 */
const PROJECTS_DATA = [
  {
    id: "proj-eduklass",
    sheet: "01",
    title: { ru: "ЭдуКласс Расписание", en: "EduKlass Schedule" },
    desc: { ru: "Расписание колледжа, которое переживает смерть сервера", en: "A college timetable that survives the server dying" },
    stack: "Next.js · NestJS · Prisma · PostgreSQL",
    url: "https://eduklass.ru",
    state: "production",
    preview: "previews/shkkrit.webp"
  },
  {
    id: "proj-kvestnik",
    sheet: "02",
    title: { ru: "Квестник", en: "Kvestnik" },
    desc: { ru: "Игры на паре: один преподаватель, тридцать телефонов", en: "Classroom games: one teacher, thirty phones" },
    stack: "Next.js · NestJS · Socket.IO · Redis",
    url: "https://kvestnik.ru",
    state: "production",
    preview: "previews/eduplay.webp"
  },
  {
    id: "proj-kvcg",
    sheet: "03",
    title: { ru: "КВ Лидер", en: "KVCG" },
    desc: { ru: "Панель правки встроена прямо в готовый сайт: страница меняется на самой странице", en: "The editor is built into the finished site: the page is edited on the page itself" },
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
    title: { ru: "ChronOS-Web", en: "ChronOS-Web" },
    desc: { ru: "Учёт посещаемости колледжа: систему передали мне по моей просьбе, перебираю изнутри", en: "College attendance tracking: handed to me at my request, being rebuilt from the inside" },
    stack: "Next.js · Prisma · PostgreSQL",
    url: null,
    note: { ru: "закрытый контур, показываю по запросу", en: "closed circuit, shown on request" },
    state: "wip",
    muted: true,
    preview: "previews/chronos.webp"
  },
  {
    id: "proj-chronos-mobile",
    sheet: "M2",
    title: { ru: "chronos-mobile", en: "chronos-mobile" },
    desc: { ru: "Мобильный клиент к тому же учёту: довожу до релиза", en: "The mobile client for the same attendance system: bringing it to a release" },
    stack: "React Native · TypeScript",
    url: null,
    note: { ru: "закрытый контур, показываю по запросу", en: "closed circuit, shown on request" },
    state: "wip",
    muted: true,
    preview: "previews/chronos-mobile.webp",
    previewNarrow: true
  }
];

/** Stamp wording per state, printed in the sheet's title block. */
const PROJECT_STATES = {
  production: { ru: "В ПРОИЗВОДСТВЕ", en: "IN PRODUCTION" },
  open: { ru: "ИСХОДНИК ОТКРЫТ", en: "SOURCE OPEN" },
  wip: { ru: "В РАЗРАБОТКЕ", en: "IN DEVELOPMENT" }
};
