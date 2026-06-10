/* ═══════════════════════════════════════════════════
   TERMINAL.JS — Terminal + i18n + badges + live pings
   ═══════════════════════════════════════════════════ */

// ─── STATE ───────────────────────────────────────
let currentLang = 'ru';
const SCRAMBLE_CHARS = 'АБВГДЕЖЗКЛМНПРСТФХЦШ•·—→←↑↓█▓░∑∆πΩ';

// STACK_DATA is loaded from stack_data.js

// Project ID Mapping — auto-generated from PROJECTS_DATA
const PROJ_MAP = {};
if (typeof PROJECTS_DATA !== 'undefined') {
  PROJECTS_DATA.forEach(p => { PROJ_MAP[p.title] = p.id; });
}

// ─── BUILD PROJECT CARDS from projects_data.js ───
function buildProjectCards() {
  if (typeof PROJECTS_DATA === 'undefined') return;
  const marker = document.getElementById('projectsContainer');
  if (!marker) return;
  const dashboard = marker.parentElement; // .dashboard

  const lang = document.documentElement.lang || 'ru';

  PROJECTS_DATA.forEach(p => {
    const isSmall = p.size === 'small';
    const cell = document.createElement('div');
    cell.className = `cell cell--project${isSmall ? ' cell--project-sm' : ''}`;
    cell.id = p.id;

    const inner = document.createElement('div');
    inner.className = 'cell__inner';

    // Number
    const num = document.createElement('div');
    num.className = `project__num${p.numMuted ? ' project__num--muted' : ''}`;
    num.textContent = p.num;
    inner.appendChild(num);

    // Title
    const title = document.createElement('h3');
    title.className = 'project__title';
    title.textContent = p.title;
    inner.appendChild(title);

    // Description (large cards only)
    if (p.desc && !isSmall) {
      const desc = document.createElement('p');
      desc.className = 'project__desc';
      desc.setAttribute('data-ru', p.desc.ru);
      desc.setAttribute('data-en', p.desc.en);
      desc.textContent = p.desc[lang] || p.desc.ru;
      inner.appendChild(desc);
    }

    // Stack (large cards only)
    if (p.stack && !isSmall) {
      const stack = document.createElement('div');
      stack.className = 'project__stack';
      stack.textContent = p.stack;
      inner.appendChild(stack);
    }

    // Links
    const links = document.createElement('div');
    links.className = 'project__links';

    // URL
    if (p.url) {
      const a = document.createElement('a');
      a.href = p.url;
      a.target = '_blank';
      a.className = `project__url${isSmall ? ' project__url--sm' : ''}`;
      a.textContent = p.url.replace('https://', '') + ' ↗';
      links.appendChild(a);
    } else if (p.urlLabel) {
      const s = document.createElement('span');
      s.className = 'project__url project__url--none';
      s.setAttribute('data-ru', p.urlLabel.ru);
      s.setAttribute('data-en', p.urlLabel.en);
      s.textContent = p.urlLabel[lang] || p.urlLabel.ru;
      links.appendChild(s);
    }

    // Git
    if (p.git) {
      const a = document.createElement('a');
      a.href = p.git;
      a.target = '_blank';
      a.className = `project__git project__git--${p.gitStatus || 'public'}`;
      const label = p.gitLabel ? (p.gitLabel[lang] || p.gitLabel.ru) : p.git.replace('https://github.com/', 'git: ');
      a.textContent = label + ' ↗';
      links.appendChild(a);
    } else if (p.gitLabel) {
      const s = document.createElement('span');
      s.className = `project__git project__git--${p.gitStatus || 'private'}`;
      s.setAttribute('data-ru', p.gitLabel.ru);
      s.setAttribute('data-en', p.gitLabel.en);
      s.textContent = p.gitLabel[lang] || p.gitLabel.ru;
      links.appendChild(s);
    }

    inner.appendChild(links);
    cell.appendChild(inner);
    dashboard.insertBefore(cell, marker);
  });

  // Remove the marker element
  marker.remove();
}

buildProjectCards();

// ─── BUILD STACK BADGES ──────────────────────────
function buildStackBadges() {
  const container = document.getElementById('stackTags');
  container.innerHTML = '';

  const patchOverlay = document.getElementById('patchOverlay');

  STACK_DATA.forEach((item) => {
    const badge = document.createElement('div');
    badge.className = 'stack-badge';
    badge.style.setProperty('--badge-color', item.color);

    // 1. Status LED
    const led = document.createElement('div');
    led.className = 'stack-badge__led';
    badge.appendChild(led);

    // 2. Icon Container
    const iconContainer = document.createElement('div');
    iconContainer.className = 'stack-badge__icon-container';
    if (item.icon) {
      if (item.icon.startsWith('<svg')) {
        iconContainer.innerHTML = item.icon;
        const svgEl = iconContainer.querySelector('svg');
        if (svgEl) {
          svgEl.classList.add('stack-badge__icon');
        }
      } else {
        const img = document.createElement('img');
        img.className = 'stack-badge__icon';
        img.src = `https://skillicons.dev/icons?i=${item.icon}&theme=light`;
        img.alt = item.name;
        img.loading = 'lazy';
        iconContainer.appendChild(img);
      }
    } else {
      // Decorative mini chip design for items without icons
      const chipDeco = document.createElement('div');
      chipDeco.style.width = '14px';
      chipDeco.style.height = '14px';
      chipDeco.style.border = `1.5px solid ${item.color}`;
      chipDeco.style.borderRadius = '2px';
      iconContainer.appendChild(chipDeco);
    }
    badge.appendChild(iconContainer);

    // 3. Label
    const label = document.createElement('span');
    label.className = 'stack-badge__label';
    label.textContent = item.name;
    badge.appendChild(label);

    // 4. Jack Input Port
    const jack = document.createElement('div');
    jack.className = 'stack-badge__jack';
    badge.appendChild(jack);

    // 5. Cable Connection Events
    badge.addEventListener('mouseenter', () => {
      synth.playJack();
      // Clear previous wires if any
      patchOverlay.innerHTML = '';

      const badgeRect = jack.getBoundingClientRect();
      const x1 = badgeRect.left + badgeRect.width / 2;
      const y1 = badgeRect.top + badgeRect.height / 2;

      // Dim all project cards by default, then highlight only the matched ones
      document.querySelectorAll('.cell--project').forEach(cell => {
        cell.classList.add('highlighted-dimmed');
        cell.classList.remove('highlighted-active');
      });

      item.projects.forEach(projKey => {
        const cellId = PROJ_MAP[projKey];
        const projCell = document.getElementById(cellId);
        if (!projCell) return;

        projCell.classList.remove('highlighted-dimmed');
        projCell.classList.add('highlighted-active');

        // Draw connection wire
        const cellRect = projCell.getBoundingClientRect();
        const x2 = cellRect.left + cellRect.width / 2;
        const y2 = cellRect.bottom; // enters card from bottom edge

        // Path curve: tension s-curve (goes upwards and enters from bottom of target cell)
        const controlY1 = y1 - 100;
        const controlY2 = y2 + 100;
        const pathData = `M ${x1} ${y1} C ${x1} ${controlY1}, ${x2} ${controlY2}, ${x2} ${y2}`;

        // Glow layer
        const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        glowPath.setAttribute('d', pathData);
        glowPath.className.baseVal = 'patch-cable-glow';
        glowPath.style.setProperty('--badge-color', item.color);
        patchOverlay.appendChild(glowPath);

        // Core cable layer
        const cablePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        cablePath.setAttribute('d', pathData);
        cablePath.className.baseVal = 'patch-cable';
        cablePath.style.setProperty('--badge-color', item.color);
        patchOverlay.appendChild(cablePath);

        // Animated signal pulse layer
        const pulsePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pulsePath.setAttribute('d', pathData);
        pulsePath.className.baseVal = 'patch-cable-pulse';
        patchOverlay.appendChild(pulsePath);
      });
    });

    badge.addEventListener('mouseleave', () => {
      patchOverlay.innerHTML = '';
      document.querySelectorAll('.cell--project').forEach(cell => {
        cell.classList.remove('highlighted-dimmed', 'highlighted-active');
      });
    });

    container.appendChild(badge);
  });
}

buildStackBadges();

// ─── TERMINAL DATA (bilingual) ───────────────────
const COMMANDS = {
  help: {
    ru: [
      '<span class="t-copper">Доступные команды:</span>',
      '  <span class="t-copper">about</span>     — Кто я',
      '  <span class="t-copper">stack</span>     — Технологии',
      '  <span class="t-copper">projects</span>  — Мои проекты',
      '  <span class="t-copper">contact</span>   — Связаться',
      '  <span class="t-copper">clear</span>     — Очистить',
    ],
    en: [
      '<span class="t-copper">Available commands:</span>',
      '  <span class="t-copper">about</span>     — About me',
      '  <span class="t-copper">stack</span>     — Tech stack',
      '  <span class="t-copper">projects</span>  — My projects',
      '  <span class="t-copper">contact</span>   — Get in touch',
      '  <span class="t-copper">clear</span>     — Clear screen',
    ],
  },
  about: {
    ru: [
      '<span class="t-copper">SkipOne</span> — Full-Stack инженер.',
      'Строю продукты от идеи до автоматизированного деплоя.',
      '',
      'Стек: <span class="t-copper">Python</span> · <span class="t-copper">TypeScript</span>',
      'Фокус: RAG, локальные LLM, agentic workflows.',
      '',
      '📍 Красноярск',
    ],
    en: [
      '<span class="t-copper">SkipOne</span> — Full-Stack Engineer.',
      'Building products from concept to automated deployment.',
      '',
      'Stack: <span class="t-copper">Python</span> · <span class="t-copper">TypeScript</span>',
      'Focus: RAG, local LLMs, agentic workflows.',
      '',
      '📍 Krasnoyarsk',
    ],
  },
  stack: {
    ru: [
      '<span class="t-copper">Языки</span>      Python · TypeScript · SQL · Bash',
      '<span class="t-copper">Backend</span>     NestJS · FastAPI',
      '<span class="t-copper">Frontend</span>    Next.js · React · React Native',
      '<span class="t-copper">БД</span>          PostgreSQL · Redis',
      '<span class="t-copper">ORM</span>         Prisma',
      '<span class="t-copper">AI/ML</span>       RAG · Faster Whisper · LM Studio',
      '<span class="t-copper">Инфра</span>       Docker · Linux · Caddy · PM2',
    ],
    en: [
      '<span class="t-copper">Languages</span>   Python · TypeScript · SQL · Bash',
      '<span class="t-copper">Backend</span>     NestJS · FastAPI',
      '<span class="t-copper">Frontend</span>    Next.js · React · React Native',
      '<span class="t-copper">Database</span>    PostgreSQL · Redis',
      '<span class="t-copper">ORM</span>         Prisma',
      '<span class="t-copper">AI/ML</span>       RAG · Faster Whisper · LM Studio',
      '<span class="t-copper">Infra</span>       Docker · Linux · Caddy · PM2',
    ],
  },
  projects: {
    ru: [
      '<span class="t-copper">[01]</span> SHKKRIT',
      '     Платформа расписания ККРИТ',
      '     <span class="t-green">→ shkkrit.skipone.dev</span>',
      '     <span class="t-muted">git: откроется в июле</span>',
      '',
      '<span class="t-copper">[02]</span> SkipOneAI',
      '     AI Telegram-двойник',
      '     <span class="t-green">→ github.com/Awoowe123/SkipOneAI</span>',
      '',
      '<span class="t-copper">[03]</span> EduPlay',
      '     Образовательные игры',
      '     <span class="t-green">→ eduplay.skipone.dev</span>',
      '     <span class="t-green">→ github.com/Awoowe123/EduPlay</span>',
      '',
      '<span class="t-muted">[M1]</span> ChronOS-Web  <span class="t-green">→ chronos.skipone.dev</span>',
      '<span class="t-muted">[M2]</span> chronos-mobile  <span class="t-green">→ m.chronos.skipone.dev</span>',
    ],
    en: [
      '<span class="t-copper">[01]</span> SHKKRIT',
      '     College Timetable Platform',
      '     <span class="t-green">→ shkkrit.skipone.dev</span>',
      '     <span class="t-muted">git: opening in July</span>',
      '',
      '<span class="t-copper">[02]</span> SkipOneAI',
      '     AI Telegram Twin',
      '     <span class="t-green">→ github.com/Awoowe123/SkipOneAI</span>',
      '',
      '<span class="t-copper">[03]</span> EduPlay',
      '     Educational Games',
      '     <span class="t-green">→ eduplay.skipone.dev</span>',
      '     <span class="t-green">→ github.com/Awoowe123/EduPlay</span>',
      '',
      '<span class="t-muted">[M1]</span> ChronOS-Web  <span class="t-green">→ chronos.skipone.dev</span>',
      '<span class="t-muted">[M2]</span> chronos-mobile  <span class="t-green">→ m.chronos.skipone.dev</span>',
    ],
  },
  contact: {
    ru: [
      '<span class="t-copper">Telegram</span>   <a href="https://t.me/l_SkipOne_l" target="_blank" style="color:#7ab87a">@l_SkipOne_l</a>',
      '<span class="t-copper">Email</span>      <a href="mailto:contact@skipone.dev" style="color:#7ab87a">contact@skipone.dev</a>',
      '<span class="t-copper">GitHub</span>     <a href="https://github.com/Awoowe123" target="_blank" style="color:#7ab87a">github.com/Awoowe123</a>',
    ],
    en: [
      '<span class="t-copper">Telegram</span>   <a href="https://t.me/l_SkipOne_l" target="_blank" style="color:#7ab87a">@l_SkipOne_l</a>',
      '<span class="t-copper">Email</span>      <a href="mailto:contact@skipone.dev" style="color:#7ab87a">contact@skipone.dev</a>',
      '<span class="t-copper">GitHub</span>     <a href="https://github.com/Awoowe123" target="_blank" style="color:#7ab87a">github.com/Awoowe123</a>',
    ],
  },
  cat: {
    ru: [
      '             ⣤⡶⢶⣦⡀',
      '⠀⠀⠀⣴⡿⠟⠷⠆⣠⠋⠀⠀⠀⢸⣿',
      '⠀⠀⠀⣿⡄⠀⠀⠀⠈⠀⠀⠀⠀⣾⡿',
      '⠀⠀⠀⠹⣿⣦⡀⠀⠀⠀⠀⢀⣾⣿',
      '⠀⠀⠀⠀⠈⠻⣿⣷⣦⣀⣠⣾⡿',
      '⠀⠀⠀⠀⠀⠀⠀⠉⠻⢿⡿⠟',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⡟⠀⠀⠀⢠⠏⡆⠀⠀⠀⠀⠀⢀⣀⣤⣤⣤⣀⡀',
      '⠀⠀⠀⠀⠀⡟⢦⡀⠇⠀⠀⣀⠞⠀⠀⠘⡀⢀⡠⠚⣉⠤⠂⠀⠀⠀⠈⠙⢦⡀',
      '⠀⠀⠀⠀⠀⡇⠀⠉⠒⠊⠁⠀⠀⠀⠀⠀⠘⢧⠔⣉⠤⠒⠒⠉⠉⠀⠀⠀⠀⠹⣆',
      '⠀⠀⠀⠀⠀⢰⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⠀⠀⣤⠶⠶⢶⡄⠀⠀⠀⠀⢹⡆',
      '⠀⣀⠤⠒⠒⢺⠒⠀⠀⠀⠀⠀⠀⠀⠀⠤⠊⠀⢸⠀⡿⠀⡀⠀⣀⡟⠀⠀⠀⠀⢸⡇',
      '⠈⠀⠀⣠⠴⠚⢯⡀⠐⠒⠚⠉⠀⢶⠂⠀⣀⠜⠀⢿⡀⠉⠚⠉⠀⠀⠀⠀⣠⠟',
      '⠀⠠⠊⠀⠀⠀⠀⠙⠂⣴⠒⠒⣲⢔⠉⠉⣹⣞⣉⣈⠿⢦⣀⣀⣀⣠⡴⠟',
      '<span class="t-muted">Кот сладко спит в правом углу терминала. Не будите его слишком часто!</span>',
    ],
    en: [
      '             ⣤⡶⢶⣦⡀',
      '⠀⠀⠀⣴⡿⠟⠷⠆⣠⠋⠀⠀⠀⢸⣿',
      '⠀⠀⠀⣿⡄⠀⠀⠀⠈⠀⠀⠀⠀⣾⡿',
      '⠀⠀⠀⠹⣿⣦⡀⠀⠀⠀⠀⢀⣾⣿',
      '⠀⠀⠀⠀⠈⠻⣿⣷⣦⣀⣠⣾⡿',
      '⠀⠀⠀⠀⠀⠀⠀⠉⠻⢿⡿⠟',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⡟⠀⠀⠀⢠⠏⡆⠀⠀⠀⠀⠀⢀⣀⣤⣤⣤⣀⡀',
      '⠀⠀⠀⠀⠀⡟⢦⡀⠇⠀⠀⣀⠞⠀⠀⠘⡀⢀⡠⠚⣉⠤⠂⠀⠀⠀⠈⠙⢦⡀',
      '⠀⠀⠀⠀⠀⡇⠀⠉⠒⠊⠁⠀⠀⠀⠀⠀⠘⢧⠔⣉⠤⠒⠒⠉⠉⠀⠀⠀⠀⠹⣆',
      '⠀⠀⠀⠀⠀⢰⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⠀⠀⣤⠶⠶⢶⡄⠀⠀⠀⠀⢹⡆',
      '⠀⣀⠤⠒⠒⢺⠒⠀⠀⠀⠀⠀⠀⠀⠀⠤⠊⠀⢸⠀⡿⠀⡀⠀⣀⡟⠀⠀⠀⠀⢸⡇',
      '⠈⠀⠀⣠⠴⠚⢯⡀⠐⠒⠚⠉⠀⢶⠂⠀⣀⠜⠀⢿⡀⠉⠚⠉⠀⠀⠀⠀⣠⠟',
      '⠀⠠⠊⠀⠀⠀⠀⠙⠂⣴⠒⠒⣲⢔⠉⠉⣹⣞⣉⣈⠿⢦⣀⣀⣀⣠⡴⠟',
      '<span class="t-muted">The cat is sleeping soundly in the top-right corner. Try not to wake him too often!</span>',
    ],
  },
};

// ─── TERMINAL ENGINE ────────────────────────────
const terminalBody = document.getElementById('terminalBody');
const terminalInput = document.getElementById('terminalInput');

function addLine(html, className = '') {
  const div = document.createElement('div');
  div.className = `terminal__line ${className}`;
  div.innerHTML = html;
  terminalBody.appendChild(div);
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function processCommand(raw) {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return;

  addLine(cmd, 'terminal__line--input');

  if (cmd === 'clear') {
    terminalBody.innerHTML = '';
    return;
  }

  if (cmd === 'cat' || cmd === 'meow') {
    if (typeof synth !== 'undefined') {
      synth.playMeow();
    }
  }

  const targetCmd = cmd === 'meow' ? 'cat' : cmd;
  const data = COMMANDS[targetCmd];
  if (data) {
    const lines = data[currentLang];
    lines.forEach((line, i) => {
      setTimeout(() => addLine(line, 'terminal__line--response'), i * 50);
    });
  } else if (cmd === 'matrix') {
    // ── MATRIX DIGITAL RAIN EASTER EGG ──
    runMatrixRain();
  } else if (cmd === 'sudo') {
    setTimeout(() => {
      addLine(currentLang === 'ru'
        ? '<span class="t-copper">Nice try.</span> <span class="t-muted">У вас нет sudo-прав в этом терминале.</span>'
        : '<span class="t-copper">Nice try.</span> <span class="t-muted">You have no sudo privileges in this terminal.</span>',
        'terminal__line--response');
    }, 50);
  } else {
    setTimeout(() => {
      const msg = currentLang === 'ru'
        ? `<span class="t-muted">Неизвестная команда: "${cmd}". Введите</span> <span class="t-copper">help</span>`
        : `<span class="t-muted">Unknown command: "${cmd}". Type</span> <span class="t-copper">help</span>`;
      addLine(msg, 'terminal__line--response');
    }, 50);
  }
}

// ── MATRIX RAIN ANIMATION ───────────────────────
function runMatrixRain() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:200px;display:block;background:#000;margin:4px 0;border:1px solid #333;';
  const wrapper = document.createElement('div');
  wrapper.className = 'terminal__line';
  wrapper.appendChild(canvas);
  terminalBody.appendChild(wrapper);
  terminalBody.scrollTop = terminalBody.scrollHeight;

  const ctx2d = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = 200;

  const chars = 'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
  const fontSize = 10;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = new Array(columns).fill(1);

  let frameId;
  const startTime = performance.now();

  function draw() {
    const elapsed = performance.now() - startTime;
    if (elapsed > 5000) {
      cancelAnimationFrame(frameId);
      addLine(currentLang === 'ru'
        ? '<span class="t-green">Wake up, Neo...</span>'
        : '<span class="t-green">Wake up, Neo...</span>',
        'terminal__line--response');
      return;
    }

    ctx2d.fillStyle = 'rgba(0, 0, 0, 0.06)';
    ctx2d.fillRect(0, 0, canvas.width, canvas.height);
    ctx2d.fillStyle = '#0F0';
    ctx2d.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx2d.fillText(char, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    frameId = requestAnimationFrame(draw);
  }

  draw();
}

const terminalGhost = document.getElementById('terminalGhost');
const CMD_LIST = [...Object.keys(COMMANDS), 'matrix', 'sudo', 'meow'];

function updateGhost() {
  const val = terminalInput.value;
  if (!val) {
    terminalGhost.textContent = '';
    return;
  }
  const match = CMD_LIST.find(c => c.startsWith(val.toLowerCase()) && c !== val.toLowerCase());
  if (match) {
    // Show full command as ghost (the typed part is invisible behind the real input)
    terminalGhost.textContent = match;
  } else {
    terminalGhost.textContent = '';
  }
}

function acceptSuggestion() {
  const val = terminalInput.value;
  if (!val) return false;
  const match = CMD_LIST.find(c => c.startsWith(val.toLowerCase()) && c !== val.toLowerCase());
  if (match) {
    terminalInput.value = match;
    terminalGhost.textContent = '';
    return true;
  }
  return false;
}

terminalInput.addEventListener('input', updateGhost);

terminalInput.addEventListener('keydown', (e) => {
  if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter' || e.key === 'Tab' || e.key === 'ArrowRight') {
    synth.playClick();
  }
  if (e.key === 'Enter') {
    processCommand(terminalInput.value);
    terminalInput.value = '';
    terminalGhost.textContent = '';
  } else if (e.key === 'Tab' || (e.key === 'ArrowRight' && terminalInput.selectionStart === terminalInput.value.length)) {
    if (acceptSuggestion()) {
      e.preventDefault();
    }
  }
});

document.querySelector('.terminal').addEventListener('click', () => {
  terminalInput.focus();
});

// ─── LANGUAGE SWITCH ────────────────────────────
const langToggle = document.getElementById('langToggle');
const langLabel = document.getElementById('langLabel');

function scrambleText(element, newText, duration = 500) {
  const len = Math.max(element.textContent.length, newText.length);
  const startTime = performance.now();

  function tick() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const settled = Math.floor(progress * len);

    let result = '';
    for (let i = 0; i < len; i++) {
      if (i < settled) {
        result += newText[i] || '';
      } else if (i < newText.length) {
        result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
    }

    element.textContent = result;
    if (progress < 1) requestAnimationFrame(tick);
    else element.textContent = newText;
  }

  element.classList.add('scrambling');
  requestAnimationFrame(tick);
  setTimeout(() => element.classList.remove('scrambling'), duration);
}

function switchLanguage() {
  currentLang = currentLang === 'ru' ? 'en' : 'ru';
  langLabel.textContent = currentLang === 'ru' ? 'EN' : 'RU';

  synth.playScramble();

  document.querySelectorAll('[data-ru][data-en]').forEach((el) => {
    const newText = el.getAttribute(`data-${currentLang}`);
    scrambleText(el, newText, 350 + Math.random() * 200);
  });
}

langToggle.addEventListener('click', switchLanguage);

// ─── LIVE STATUS PINGS ──────────────────────────
const pingBtn = document.getElementById('pingBtn');
const statusRows = document.querySelectorAll('.status__row');

async function pingService(url) {
  const start = performance.now();
  try {
    await fetch(url, {
      mode: 'no-cors',
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000),
    });
    const ping = Math.round(performance.now() - start);
    return { online: true, ping };
  } catch (e) {
    const elapsed = Math.round(performance.now() - start);
    // CORP/COEP headers cause ERR_BLOCKED_BY_RESPONSE even on 200 OK.
    // If the error happens fast (< 3s), the server DID respond — it's online.
    // If it times out (> 3s), the server is truly unreachable.
    if (elapsed < 3000) {
      return { online: true, ping: elapsed };
    }
    return { online: false, ping: 0 };
  }
}

async function checkSingleRow(row) {
  const url = row.dataset.url;
  const dot = row.querySelector('.status__dot');
  const result = row.querySelector('.status__result');

  // Set checking state
  dot.className = 'status__dot checking';
  result.className = 'status__result';
  result.textContent = currentLang === 'ru' ? 'проверка...' : 'checking...';

  const status = await pingService(url);

  if (status.online) {
    dot.className = 'status__dot online';
    result.className = 'status__result online';
    result.textContent = `${status.ping}ms`;
  } else {
    dot.className = 'status__dot offline';
    result.className = 'status__result offline';
    result.textContent = currentLang === 'ru' ? 'недоступен' : 'offline';
  }
}

async function runAllPings() {
  pingBtn.classList.add('pinging');
  const promises = Array.from(statusRows).map(row => checkSingleRow(row));
  await Promise.all(promises);
  pingBtn.classList.remove('pinging');
}

// Click the button to ping all
pingBtn.addEventListener('click', runAllPings);

// Click individual row to ping just that service
statusRows.forEach(row => {
  row.addEventListener('click', () => checkSingleRow(row));
});

// ─── WEB AUDIO API SYNTHESIZER ───────────────────
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('soundMuted') === 'true';
    this.clickBuffers = [];
    this.activeClicks = 0;
    this.lastClickTime = 0;
    // Eagerly initialize context and load samples
    this._ensureCtx();
  }

  _ensureCtx() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { return; }
      // Decode embedded click samples (from click_data.js)
      if (typeof CLICK_SAMPLES !== 'undefined') {
        CLICK_SAMPLES.forEach((dataUri, i) => {
          const b64 = dataUri.split(',')[1];
          const bin = atob(b64);
          const buf = new Uint8Array(bin.length);
          for (let j = 0; j < bin.length; j++) buf[j] = bin.charCodeAt(j);
          this.ctx.decodeAudioData(buf.buffer)
            .then(decoded => { this.clickBuffers[i] = decoded; })
            .catch(() => {});
        });
      }
    }
  }

  init() {
    this._ensureCtx();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('soundMuted', this.muted);
    // Don't close AudioContext — it invalidates decoded AudioBuffers
    this.updateToggleIcon();
  }

  updateToggleIcon() {
    const icon = document.getElementById('soundIcon');
    if (!icon) return;
    if (this.muted) {
      icon.innerHTML = `<path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
    } else {
      icon.innerHTML = `<path fill="currentColor" d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-3 1.77L6.43 9H3v6h3.43L11 19V5zm2 7c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>`;
    }
  }

  // Mechanical keyboard — Play randomly chosen click sample (max 3 overlapping)
  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Cooldown: skip if last click was <30ms ago
    const now = performance.now();
    if (now - this.lastClickTime < 50) return;
    this.lastClickTime = now;

    // Polyphony limit
    if (this.activeClicks >= 3) return;

    const validBuffers = this.clickBuffers.filter(b => b);
    if (validBuffers.length === 0) return;

    const buf = validBuffers[Math.floor(Math.random() * validBuffers.length)];
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = 0.9 + Math.random() * 0.2;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0.4 + Math.random() * 0.2;

    this.activeClicks++;
    src.onended = () => { this.activeClicks--; };

    src.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    src.start(0);
  }

  // Patch-cable jack insert — snap transient + brief contact hum
  playJack() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Sharp snap transient (3ms noise)
    const snapLen = Math.floor(this.ctx.sampleRate * 0.004);
    const snapBuf = this.ctx.createBuffer(1, snapLen, this.ctx.sampleRate);
    const snapData = snapBuf.getChannelData(0);
    for (let i = 0; i < snapLen; i++) {
      snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (snapLen * 0.12));
    }
    const snap = this.ctx.createBufferSource();
    snap.buffer = snapBuf;
    const snapGain = this.ctx.createGain();
    snapGain.gain.value = 0.07;
    snap.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snap.start(t);

    // 2. Brief ground-loop hum after contact
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 180;
    oscGain.gain.setValueAtTime(0.035, t + 0.005);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t + 0.005);
    osc.stop(t + 0.09);
  }

  // Radio static — sustained noise band (no frequency sweep)
  playScramble() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 0.35;
    const len = Math.floor(this.ctx.sampleRate * duration);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = Math.random() * 2 - 1;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    bp.Q.value = 1.5;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.025, t + 0.06);
    g.gain.setValueAtTime(0.025, t + duration - 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);

    src.connect(bp);
    bp.connect(g);
    g.connect(this.ctx.destination);
    src.start(t);
  }

  playMeow() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';

    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(650, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.35);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.start();
    osc.stop(t + 0.35);
  }
}

const synth = new SoundSynth();

// Initialize sound button state
synth.updateToggleIcon();

// Hook toggle button click
document.getElementById('soundToggle').addEventListener('click', () => {
  synth.toggleMute();
  synth.init();
});

// Auto-resume audio context on first user interaction
document.addEventListener('click', () => synth.init(), { once: true });
document.addEventListener('keydown', () => synth.init(), { once: true });
document.addEventListener('pointerdown', () => synth.init(), { once: true });
document.addEventListener('mousemove', () => synth.init(), { once: true });

