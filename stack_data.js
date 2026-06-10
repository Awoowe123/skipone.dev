/**
 * ═══════════════════════════════════════════════════
 * STACK DATA — edit this array to manage tech badges
 * Each badge connects to projects via the "projects" field.
 * ═══════════════════════════════════════════════════
 *
 * Each badge object:
 *   name     — display name
 *   color    — brand color (hex)
 *   icon     — skillicons ID (e.g. "python") or inline <svg> string
 *   projects — array of project titles (must match title in projects_data.js)
 */
const STACK_DATA = [
  { name: 'Python',       color: '#3776AB', icon: 'python',     projects: ['SkipOneAI'] },
  { name: 'TypeScript',   color: '#3178C6', icon: 'ts',         projects: ['SHKKRIT', 'EduPlay', 'ChronOS-Web', 'chronos-mobile'] },
  { name: 'React',        color: '#61DAFB', icon: 'react',      projects: ['SHKKRIT', 'EduPlay', 'ChronOS-Web'] },
  { name: 'React Native', color: '#61DAFB', icon: 'react',      projects: ['chronos-mobile'] },
  { name: 'Next.js',      color: '#808080', icon: 'nextjs',     projects: ['SHKKRIT', 'EduPlay', 'ChronOS-Web'] },
  { name: 'NestJS',       color: '#E0234E', icon: 'nestjs',     projects: ['SHKKRIT', 'EduPlay'] },
  { name: 'Prisma',       color: '#2D3748', icon: 'prisma',     projects: ['SHKKRIT', 'EduPlay', 'ChronOS-Web'] },
  { name: 'PostgreSQL',   color: '#4169E1', icon: 'postgres',   projects: ['SHKKRIT', 'EduPlay', 'ChronOS-Web'] },
  { name: 'Redis',        color: '#DC382D', icon: 'redis',      projects: ['EduPlay'] },
  { name: 'Socket.IO',    color: '#010101', icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm-4-9h8v2H8z"/></svg>`, projects: ['EduPlay'] },
  { name: 'Docker',       color: '#2496ED', icon: 'docker',     projects: ['SHKKRIT', 'EduPlay', 'SkipOneAI'] },
  { name: 'Linux',        color: '#FCC624', icon: 'linux',      projects: ['SHKKRIT', 'EduPlay', 'SkipOneAI'] },
  { name: 'RAG / LLM',    color: '#c57e50', icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 11.5l-1.3-2.7L15 7.5l2.7-1.3 1.3-2.7 1.3 2.7 2.7 1.3-2.7 1.3-1.3 2.7zm-9 9l-2-4.5-4.5-2 4.5-2 2-4.5 2 4.5 4.5 2-4.5 2-2 4.5z"/></svg>`, projects: ['SkipOneAI'] },
  { name: 'Whisper',      color: '#74aa9c', icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4M6 6v12M9 3v18M12 9v6M15 5v14M18 8v8M21 10v4" /></svg>`, projects: ['SkipOneAI'] },
  { name: 'Telethon',     color: '#2196F3', icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.28-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/></svg>`, projects: ['SkipOneAI'] }
];
