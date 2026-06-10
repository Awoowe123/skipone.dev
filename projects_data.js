/**
 * ═══════════════════════════════════════════════════
 * PROJECTS DATA — edit this array to add/remove projects
 * The site renders cards automatically from this data.
 * ═══════════════════════════════════════════════════
 *
 * Each project object:
 *   id         — unique DOM id (used for badge connections)
 *   num        — display number like [01], [M1]
 *   title      — project name
 *   desc       — { ru, en } description (optional for small cards)
 *   stack      — tech stack string (optional for small cards)
 *   url        — live URL or null
 *   urlLabel   — { ru, en } label when url is null
 *   git        — GitHub URL or null
 *   gitLabel   — { ru, en } git link text
 *   gitStatus  — "public" | "private" | "soon"
 *   numMuted   — true for contribution projects (dimmed number)
 *   size       — "large" | "small"
 *   preview    — image URL for card preview (large cards only)
 */
const PROJECTS_DATA = [
  {
    id: "proj-shkkrit",
    num: "[01]",
    title: "SHKKRIT",
    desc: { ru: "Платформа расписания ККРИТ", en: "College Timetable Platform" },
    stack: "Next.js · Prisma · PostgreSQL",
    url: "https://shkkrit.skipone.dev",
    git: null,
    gitLabel: { ru: "git: откроется в июле", en: "git: opening in July" },
    gitStatus: "soon",
    size: "large",
    preview: "previews/shkkrit.webp"
  },
  {
    id: "proj-skiponeai",
    num: "[02]",
    title: "SkipOneAI",
    desc: { ru: "AI Telegram-двойник", en: "AI Telegram Twin" },
    stack: "Python · RAG · Whisper · Telethon",
    url: null,
    urlLabel: { ru: "нет публичной версии", en: "no public version" },
    git: "https://github.com/Awoowe123/SkipOneAI",
    gitLabel: { ru: "git: Awoowe123/SkipOneAI", en: "git: Awoowe123/SkipOneAI" },
    gitStatus: "public",
    size: "large",
    preview: "https://opengraph.githubassets.com/1/Awoowe123/SkipOneAI"
  },
  {
    id: "proj-eduplay",
    num: "[03]",
    title: "EduPlay",
    desc: { ru: "Образовательные игры", en: "Educational Games" },
    stack: "Next.js · NestJS · Socket.IO · Redis",
    url: "https://eduplay.skipone.dev",
    git: "https://github.com/Awoowe123/EduPlay",
    gitLabel: { ru: "git: Awoowe123/EduPlay", en: "git: Awoowe123/EduPlay" },
    gitStatus: "public",
    size: "large",
    preview: "previews/eduplay.webp"
  },
  {
    id: "proj-chronos",
    num: "[M1]",
    numMuted: true,
    title: "ChronOS-Web",
    url: "https://chronos.skipone.dev",
    git: null,
    gitLabel: { ru: "git: приватный", en: "git: private" },
    gitStatus: "private",
    size: "small",
    preview: "previews/chronos.webp"
  },
  {
    id: "proj-chronos-mobile",
    num: "[M2]",
    numMuted: true,
    title: "chronos-mobile",
    url: "https://m.chronos.skipone.dev",
    git: null,
    gitLabel: { ru: "git: приватный", en: "git: private" },
    gitStatus: "private",
    size: "small",
    preview: "previews/chronos-mobile.webp",
    previewNarrow: true
  }
];
