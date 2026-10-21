/* ═══════════════════════════════════════════════════
   TERMINAL.JS — i18n + project cards + badges + live pings + sound
   ═══════════════════════════════════════════════════ */

// ─── STATE ───────────────────────────────────────
let currentLang = 'ru';
const SCRAMBLE_CHARS = 'АБВГДЕЖЗКЛМНПРСТФХЦШ•·—→←↑↓█▓░∑∆πΩ';

// STACK_DATA is loaded from stack_data.js

// Known project ids. STACK_DATA patches into projects by id, so a typo in a
// badge's list is a wire that goes nowhere -- worth one console warning.
const PROJ_IDS = new Set(
  typeof PROJECTS_DATA !== 'undefined' ? PROJECTS_DATA.map(p => p.id) : []
);

// ─── BUILD PROJECT CARDS from projects_data.js ───
function buildProjectCards() {
  if (typeof PROJECTS_DATA === 'undefined') return;
  const rack = document.getElementById('projectsContainer');
  if (!rack) return;

  const lang = document.documentElement.lang || 'ru';

  // Двуязычная подпись: атрибуты data-ru/data-en нужны переключателю языка,
  // текст ставим сразу на текущем -- иначе до первого переключения пусто.
  const bilingual = (el, pair) => {
    el.setAttribute('data-ru', pair.ru);
    el.setAttribute('data-en', pair.en);
    el.textContent = pair[lang] || pair.ru;
    return el;
  };

  PROJECTS_DATA.forEach(p => {
    const cell = document.createElement('div');
    cell.className = `cell cell--project${p.muted ? ' cell--project--muted' : ''}`;
    cell.id = p.id;

    const inner = document.createElement('div');
    inner.className = 'cell__inner';

    // Заголовок листа: номер и статус, как на настоящем чертеже.
    const head = document.createElement('div');
    head.className = 'project__head';

    const sheet = document.createElement('span');
    sheet.className = 'project__sheet';
    sheet.textContent = `ЛИСТ ${p.sheet}`;
    sheet.setAttribute('data-ru', `ЛИСТ ${p.sheet}`);
    sheet.setAttribute('data-en', `SHEET ${p.sheet}`);
    if (lang === 'en') sheet.textContent = `SHEET ${p.sheet}`;
    head.appendChild(sheet);

    const stateText = (typeof PROJECT_STATES !== 'undefined' && PROJECT_STATES[p.state]) || null;
    if (stateText) {
      const stamp = document.createElement('span');
      stamp.className = `project__stamp project__stamp--${p.state}`;
      head.appendChild(bilingual(stamp, stateText));
    }
    inner.appendChild(head);

    const title = document.createElement('h3');
    title.className = 'project__title';
    inner.appendChild(bilingual(title, p.title));

    if (p.desc) {
      const desc = document.createElement('p');
      desc.className = 'project__desc';
      inner.appendChild(bilingual(desc, p.desc));
    }

    if (p.stack) {
      const stack = document.createElement('div');
      stack.className = 'project__stack';
      stack.textContent = p.stack;
      inner.appendChild(stack);
    }

    // Preview tooltip (step 1: small popup on card hover)
    if (p.preview) {
      cell.addEventListener('mouseenter', () => {
        showPreviewTooltip(p.preview, p.title[lang] || p.title.ru, p.previewNarrow, cell);
      });
      cell.addEventListener('mouseleave', () => {
        scheduleHideTooltip();
      });
    }

    const links = document.createElement('div');
    links.className = 'project__links';

    if (p.url) {
      const a = document.createElement('a');
      a.href = p.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'project__url';
      a.textContent = p.url.replace('https://', '') + ' ↗';
      links.appendChild(a);
    } else if (p.note) {
      const s = document.createElement('span');
      s.className = 'project__url project__url--none';
      links.appendChild(bilingual(s, p.note));
    }

    if (p.git) {
      const a = document.createElement('a');
      a.href = p.git;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'project__git';
      a.textContent = p.git.replace('https://github.com/', 'git: ') + ' ↗';
      links.appendChild(a);
    }

    inner.appendChild(links);
    cell.appendChild(inner);
    rack.appendChild(cell);
  });
}

buildProjectCards();

// ─── TWO-STEP PREVIEW SYSTEM ─────────────────────
// Step 1: Tooltip (small popup near card on hover)
// Step 2: Fullscreen overlay (on tooltip hover)

// --- Tooltip element ---
const previewTooltip = document.createElement('div');
previewTooltip.className = 'preview-tooltip';
previewTooltip.innerHTML = '<img class="preview-tooltip__img" /><div class="preview-tooltip__label"></div><div class="preview-tooltip__hint"></div>';
document.body.appendChild(previewTooltip);

const tooltipImg = previewTooltip.querySelector('.preview-tooltip__img');
const tooltipLabel = previewTooltip.querySelector('.preview-tooltip__label');
const tooltipHint = previewTooltip.querySelector('.preview-tooltip__hint');

// --- Fullscreen overlay element ---
const previewOverlay = document.createElement('div');
previewOverlay.className = 'preview-overlay';
previewOverlay.innerHTML = '<div class="preview-overlay__backdrop"></div><div class="preview-overlay__content"><img /><div class="preview-overlay__label"></div></div>';
document.body.appendChild(previewOverlay);

const overlayImg = previewOverlay.querySelector('img');
const overlayLabel = previewOverlay.querySelector('.preview-overlay__label');
const overlayContent = previewOverlay.querySelector('.preview-overlay__content');

let tooltipHideTimer = null;
let overlayHideTimer = null;
let currentTooltipData = null;

function clearTooltipTimer() {
  if (tooltipHideTimer) { clearTimeout(tooltipHideTimer); tooltipHideTimer = null; }
}
function clearOverlayTimer() {
  if (overlayHideTimer) { clearTimeout(overlayHideTimer); overlayHideTimer = null; }
}

function showPreviewTooltip(src, title, narrow, cardEl) {
  clearTooltipTimer();
  tooltipImg.src = src;
  tooltipLabel.textContent = title;
  tooltipHint.textContent = currentLang === 'ru' ? 'наведите для увеличения' : 'hover to expand';
  previewTooltip.classList.toggle('preview-tooltip--narrow', !!narrow);
  currentTooltipData = { src, title, narrow };

  // Position tooltip above the card, centered horizontally
  const rect = cardEl.getBoundingClientRect();
  const tooltipW = narrow ? 180 : 320;
  let left = rect.left + rect.width / 2 - tooltipW / 2;
  let top = rect.top - 230; // above the card

  // Clamp to viewport
  if (left < 8) left = 8;
  if (left + tooltipW > window.innerWidth - 8) left = window.innerWidth - tooltipW - 8;
  if (top < 8) top = rect.bottom + 8; // flip below if no space above

  previewTooltip.style.left = left + 'px';
  previewTooltip.style.top = top + 'px';
  previewTooltip.classList.add('preview-tooltip--visible');
}

function scheduleHideTooltip() {
  clearTooltipTimer();
  tooltipHideTimer = setTimeout(() => {
    previewTooltip.classList.remove('preview-tooltip--visible');
    currentTooltipData = null;
  }, 150); // small delay to allow mouse to reach tooltip
}

function showFullscreenOverlay() {
  if (!currentTooltipData) return;
  clearOverlayTimer();
  overlayImg.src = currentTooltipData.src;
  overlayLabel.textContent = currentTooltipData.title;
  overlayContent.classList.toggle('preview-overlay__content--narrow', !!currentTooltipData.narrow);
  previewOverlay.classList.add('preview-overlay--visible');
  previewTooltip.classList.add('preview-tooltip--ghost'); // hide visually, keep hit zone
}

function scheduleHideOverlay() {
  clearOverlayTimer();
  overlayHideTimer = setTimeout(() => {
    previewOverlay.classList.remove('preview-overlay--visible');
    previewTooltip.classList.remove('preview-tooltip--ghost');
  }, 100);
}

// Tooltip hover → show fullscreen
previewTooltip.addEventListener('mouseenter', () => {
  clearTooltipTimer(); // keep tooltip alive
  showFullscreenOverlay();
});

previewTooltip.addEventListener('mouseleave', () => {
  scheduleHideTooltip();
  scheduleHideOverlay();
});

// Click overlay backdrop to dismiss (overlay covers entire screen, mouseleave won't work)
previewOverlay.addEventListener('click', () => {
  previewOverlay.classList.remove('preview-overlay--visible');
  previewTooltip.classList.remove('preview-tooltip--visible', 'preview-tooltip--ghost');
  currentTooltipData = null;
  clearOverlayTimer();
  clearTooltipTimer();
});

// Preload all preview images
if (typeof PROJECTS_DATA !== 'undefined') {
  PROJECTS_DATA.forEach(p => {
    if (p.preview && !p.preview.startsWith('http')) {
      const img = new Image();
      img.src = p.preview;
    }
  });
}

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
        if (!PROJ_IDS.has(projKey)) {
          console.warn(`stack_data: "${item.name}" patches into unknown project "${projKey}"`);
          return;
        }
        const projCell = document.getElementById(projKey);
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
    // Eagerly initialize the context
    this._ensureCtx();
  }

  _ensureCtx() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { return; }
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

