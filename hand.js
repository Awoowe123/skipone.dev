/* ═══════════════════════════════════════════════════
   HAND.JS — the block hand: geometry and poses (pure, loadable in node)
   plus the hero scene and the hand cursor (DOM, browser only).
   ═══════════════════════════════════════════════════ */
(function () {
  const INK = '#1a1a18', RUST = '#ba6d4b';

  // ---- Geometry ----
  const FINGERS = [{ x: 34, h: [12, 11, 9] }, { x: 48, h: [12, 11, 10, 8] }, { x: 62, h: [12, 11, 9, 6] }, { x: 76, h: [11, 9, 7] }];
  const HAND = [];
  FINGERS.forEach((f, fi) => { let bottom = 62; f.h.forEach((h, level) => { HAND.push({ x: f.x, y: bottom - h, w: 10, h, c: INK, finger: fi, level }); bottom -= h + 2; }); });
  [[22, 58, 10, 8], [15, 49, 9, 7], [10, 41, 7, 6]].forEach(([x, y, w, h], level) => HAND.push({ x, y, w, h, c: INK, thumb: true, level }));
  [[34, 66, 16, 10], [52, 66, 16, 10, RUST], [70, 66, 16, 10], [34, 78, 25, 10], [61, 78, 25, 10], [40, 92, 40, 10]].forEach(([x, y, w, h, c]) => HAND.push({ x, y, w, h, c: c || INK }));

  // ---- Easing helpers ----
  const CX = 50, CY = 60;
  const backOut = (t, s = 1.4) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
  const inOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outCubic = (t) => 1 - Math.pow(1 - t, 3);
  const clamp = (t) => Math.max(0, Math.min(1, t)), seg = (t, a, b) => clamp((t - a) / (b - a)), lerp = (a, b, k) => a + (b - a) * k;

  // The word in chunky blocks: cap height 50..70, x-height 56..70, the p's descender to 76, stroke 4,
  // letters 3 units apart, centred on x = 50. The dot of the i is the rust part (it is the palm's rust block).
  const LETTERS = [
    [12, [[0, 50, 12, 4], [0, 54, 4, 4], [0, 58, 12, 4], [8, 62, 4, 4], [0, 66, 12, 4]]],                       // S
    [10, [[0, 50, 4, 20], [5, 56, 4, 7, .86], [5, 63, 4, 7, -.86]]],                                            // k
    [4, [[0, 56, 4, 14], [0, 50, 4, 4, 0, true]]],                                                             // i
    [11, [[0, 56, 4, 20], [4, 56, 7, 4], [7, 60, 4, 6], [4, 66, 7, 4]]],                                        // p
    [14, [[0, 50, 14, 4], [0, 54, 4, 12], [10, 54, 4, 12], [0, 66, 14, 4]]],                                    // O
    [11, [[0, 56, 4, 14], [4, 56, 7, 4], [7, 60, 4, 10]]],                                                      // n
    [11, [[0, 56, 11, 4], [0, 60, 4, 6], [7, 60, 4, 3], [4, 62, 7, 3], [0, 66, 11, 4]]],                        // e
  ];
  const WORD = [];
  { const total = LETTERS.reduce((s, [w]) => s + w, 0) + 3 * (LETTERS.length - 1); let x0 = 50 - total / 2;
    for (const [w, blocks] of LETTERS) { for (const [x, y, bw, bh, sk = 0, rust] of blocks) WORD.push({ x: x0 + x, y, w: bw, h: bh, sk, rust: !!rust }); x0 += w + 3; } }

  // Pair the hand's blocks with the word's: the rust palm block becomes the dot of the i; the ink blocks
  // go left to right, spread evenly over the word; word blocks left without a partner grow out of the
  // centre of the turn as extra blocks.
  const order = (list, isRust) => list.map((b, i) => ({ b, i })).filter((e) => !isRust(e.b)).sort((p, q) => (p.b.x - q.b.x) || (p.b.y - q.b.y)).map((e) => e.i);
  const ho = order(HAND, (b) => b.c === RUST), wo = order(WORD, (b) => b.rust), TARGET = [], used = new Set();
  ho.forEach((hi, n) => { const wi = wo[Math.floor(n * wo.length / ho.length)]; TARGET[hi] = WORD[wi]; used.add(wi); });
  const ri = HAND.findIndex((b) => b.c === RUST), wr = WORD.findIndex((b) => b.rust); TARGET[ri] = WORD[wr]; used.add(wr);
  const EXTRA = WORD.filter((b, i) => !used.has(i));
  HAND.forEach((b) => (b.speed = b.thumb ? 1.25 : b.level !== undefined ? 1.15 + b.level * .12 : 1));

  // ---- Poses ----
  function spin(b, from, to, p) {
    const m = inOut(p), turn = clamp(p * b.speed), ang = 2 * Math.PI * inOut(turn), k = 1 + .3 * Math.sin(Math.PI * turn);
    const w = lerp(from.w, to.w, m), h = lerp(from.h, to.h, m), vx = lerp(from.x + from.w / 2, to.x + to.w / 2, m) - CX, vy = lerp(from.y + from.h / 2, to.y + to.h / 2, m) - CY;
    return { x: CX + (vx * Math.cos(ang) - vy * Math.sin(ang)) * k - w / 2, y: CY + (vx * Math.sin(ang) + vy * Math.cos(ang)) * k - h / 2, w, h, sk: lerp(from.sk || 0, to.sk || 0, m) };
  }
  const PX = 60, PY = 102, SWING = 20 * Math.PI / 180;
  function wavePose(b, t) {               // t in s, 0..2.2
    const p = seg(t, 0, 2.2); if (p <= 0 || p >= 1) return b;
    const env = p < .15 ? outCubic(p / .15) : p > .7 ? 1 - inOut((p - .7) / .3) : 1;
    const lag = b.level !== undefined && !b.thumb ? b.level * .035 : 0, a = SWING * Math.sin(2 * Math.PI * 2 * seg(t - lag, 0, 2.2)) * env;
    const bx = b.x + b.w / 2 - PX, by = b.y + b.h / 2 - PY;
    return { ...b, x: PX + bx * Math.cos(a) - by * Math.sin(a) - b.w / 2, y: PY + bx * Math.sin(a) + by * Math.cos(a) - b.h / 2 };
  }
  // To the word in 2 s, hold 1.6 s, back in 2 s. Extra blocks grow from nothing in the last third of the turn
  // in (from their own centre) and shrink in the first third of the turn back.
  function wordPose(b, i, t) {
    if (t < 2) return spin(b, b, TARGET[i], seg(t, 0, 2));
    if (t < 3.6) return TARGET[i];
    return spin(b, TARGET[i], b, seg(t, 3.6, 5.6));
  }
  function extraPose(e, t) {
    const g = t < 3.6 ? backOut(seg(t, 1.35, 2), 1.6) : 1 - inOut(seg(t, 3.6, 4.2));
    const w = e.w * g, h = e.h * g;
    return { ...e, x: e.x + (e.w - w) / 2, y: e.y + (e.h - h) / 2, w, h };
  }
  // Cursor pointing pose: middle, ring and little fingers curl into the palm, the thumb tucks in, the index stays.
  function pointPose(b) {
    if (b.thumb) return { ...b, x: 26, y: 60 + b.level * 1.5, w: 8, h: 6 };           // tucked against the palm
    if (b.finger > 0) {                                                                // curled into the knuckle row
      return b.level === 0 ? { ...b, y: 52, h: 10 } : { ...b, y: 54, h: 0, w: b.w * .6, x: b.x + b.w * .2 };
    }
    return b;                                                                          // the index stays
  }
  const mat = (p) => `matrix(${p.w},0,${-(p.sk || 0) * p.h},${p.h},${p.x + (p.sk || 0) * p.h / 2},${p.y})`;

  const HOT = { x: 39, y: 26 };           // index fingertip, hand units
  // A click waves first (2.2 s, then 0.2 s at rest), then the word turn (5.6 s).
  const W = 2.4, TOTAL = W + 5.6;
  const clickPose = (b, i, t) => (t < W ? wavePose(b, t) : wordPose(b, i, t - W));
  const clickExtra = (e, t) => (t < W ? { ...e, w: 0, h: 0 } : extraPose(e, t - W));
  const api = { INK, RUST, HAND, LETTERS, WORD, TARGET, EXTRA, HOT, W, TOTAL, clickPose, clickExtra, wavePose, wordPose, extraPose, pointPose, mat };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;

  // ---- DOM: the hero scene ----
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rect = (fill) => `<rect width="1" height="1" fill="${fill}" style="transform-origin:0 0"/>`;
  const svg = document.getElementById('hand');
  if (svg) {
    // Rust painted first, under the rest.
    const paint = HAND.map((b, i) => i).sort((a, b) => (HAND[b].c === RUST) - (HAND[a].c === RUST));
    svg.innerHTML = paint.map((i) => rect(HAND[i].c)).join('') + EXTRA.map(() => rect(INK)).join('');
    const els = []; paint.forEach((i, n) => (els[i] = svg.children[n]));
    const extras = [...svg.children].slice(HAND.length);
    const animate = (el, pose, D) => {
      const N = Math.round(D * 40), k = [];
      for (let s = 0; s <= N; s++) k.push({ offset: s / N, transform: mat(pose(s / N * D)) });
      el.getAnimations().forEach((a) => a.cancel());
      el.animate(k, { duration: D * 1000, easing: 'linear', fill: 'forwards' });
    };
    HAND.forEach((b, i) => (els[i].style.transform = mat(b)));
    EXTRA.forEach((e, n) => (extras[n].style.transform = mat({ ...e, w: 0, h: 0 })));
    let busy = false;
    if (!still) setTimeout(() => HAND.forEach((b, i) => animate(els[i], (t) => wavePose(b, t), 2.2)), 500);
    const play = () => {
      if (busy || still) return; busy = true;
      HAND.forEach((b, i) => animate(els[i], (t) => clickPose(b, i, t), TOTAL));
      EXTRA.forEach((e, n) => animate(extras[n], (t) => clickExtra(e, t), TOTAL));
      setTimeout(() => (busy = false), TOTAL * 1000);
    };
    svg.addEventListener('click', play);
    svg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } });
  }

  // ---- DOM: the cursor ----
  // The hot spot is the index fingertip in both poses, so it never jumps. A system cursor cannot be
  // animated, hence a DOM cursor; touch screens and reduced motion keep the plain system one.
  if (!matchMedia('(pointer: fine)').matches || still) return;
  const CUR_SCALE = 32 / 92;              // hand units; 92 units -> 32 px
  document.documentElement.classList.add('has-cur');
  const cur = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  cur.id = 'cur'; cur.setAttribute('viewBox', '6 11 92 92'); cur.setAttribute('width', '32'); cur.setAttribute('height', '32');
  cur.setAttribute('aria-hidden', 'true');
  // Halo first (snow, 3 units wider each way), then the blocks; both follow the same poses.
  cur.innerHTML = HAND.map(() => rect('#fdfdfd')).join('') + HAND.map((b) => rect(b.c)).join('');
  document.body.append(cur);
  const halo = [...cur.children].slice(0, HAND.length), ink = [...cur.children].slice(HAND.length);
  const grow = (p, m) => ({ ...p, x: p.x - m, y: p.y - m, w: p.w > 0 ? p.w + 2 * m : 0, h: p.h > 0 ? p.h + 2 * m : 0 });
  HAND.forEach((b, i) => { ink[i].style.transform = mat(b); halo[i].style.transform = mat(grow(b, 3)); });
  let pointing = false;
  // Rest -> point: 220 ms, curling fingers first (from the little finger), each block 18 ms after the
  // previous one, one small overshoot; back is the same story reversed.
  function morph(toPoint) {
    if (toPoint === pointing) return; pointing = toPoint;
    HAND.forEach((b, i) => {
      const from = toPoint ? b : pointPose(b), to = toPoint ? pointPose(b) : b;
      const ord = b.thumb ? 0 : b.finger === undefined ? 4 : 3 - b.finger, delay = ord * 18;
      const k = [0, .7, 1].map((o) => { const m = o === 0 ? 0 : o === .7 ? 1.08 : 1; return { offset: o, p: { x: lerp(from.x, to.x, m), y: lerp(from.y, to.y, m), w: Math.max(0, lerp(from.w, to.w, m)), h: Math.max(0, lerp(from.h, to.h, m)) } }; });
      const opts = { duration: 220, delay, easing: 'cubic-bezier(.33,1,.68,1)', fill: 'both' };
      ink[i].animate(k.map(({ offset, p }) => ({ offset, transform: mat(p) })), opts);
      halo[i].animate(k.map(({ offset, p }) => ({ offset, transform: mat(grow(p, 3)) })), opts);
      // The rust travels: the palm block goes ink, the index fingertip goes rust.
      const rust = b.c === RUST ? !toPoint : (b.finger === 0 && b.level === 2) ? toPoint : null;
      if (rust !== null) ink[i].animate([{ fill: rust ? INK : RUST }, { fill: rust ? RUST : INK }], { duration: 160, delay: delay + 60, fill: 'forwards' });
    });
  }
  const CLICKABLE = 'a, button, [role=button], .stage';
  addEventListener('pointermove', (e) => {
    // The individual translate property, not transform: the press animates scale, and scale is applied
    // after translate (so it shrinks the hand about its fingertip) but before transform (where it would
    // also shrink the offset to the pointer and throw the hand towards the corner).
    cur.style.translate = `${e.clientX - (HOT.x - 6) * CUR_SCALE}px ${e.clientY - (HOT.y - 11) * CUR_SCALE}px`;
    cur.style.visibility = 'visible';
    morph(!!e.target.closest(CLICKABLE));
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => (cur.style.visibility = 'hidden'));
  // A press: the hand dips a little, like a finger pushing a key.
  addEventListener('pointerdown', () => cur.animate([{ scale: '1' }, { scale: '.88' }, { scale: '1' }], { duration: 180, easing: 'cubic-bezier(.34,1.56,.64,1)' }));
})();
