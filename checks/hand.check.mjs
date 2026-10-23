import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { HAND, WORD, TARGET, EXTRA, RUST, HOT, W, TOTAL, clickPose, clickExtra, wavePose, wordPose, pointPose } = createRequire(import.meta.url)('../hand.js');
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-6, `${msg}: ${a} vs ${b}`);
const same = (p, b, msg) => ['x', 'y', 'w', 'h'].forEach((k) => near(p[k], b[k], `${msg}.${k}`));

// Every word block is either some hand block's target or an extra: none is lost, none is doubled.
const targeted = HAND.map((_, i) => TARGET[i]);
assert.ok(targeted.every(Boolean), 'every hand block has a target');
assert.equal(new Set(targeted).size, HAND.length, 'no two hand blocks share a target');
const placed = new Set([...targeted, ...EXTRA]);
assert.equal(placed.size, WORD.length, 'hand targets plus extras cover the whole word');
WORD.forEach((w, i) => assert.ok(placed.has(w), `word block ${i} is lost`));

// The rust palm block goes to the dot of the i.
const ri = HAND.findIndex((b) => b.c === RUST);
assert.equal(TARGET[ri], WORD.find((w) => w.rust), 'rust block must land on the dot of the i');
assert.equal(WORD.filter((w) => w.rust).length, 1, 'exactly one rust word block');

// The word turn starts and ends at the resting hand.
HAND.forEach((b, i) => { same(wordPose(b, i, 0), b, `wordPose(0)[${i}]`); same(wordPose(b, i, 5.6), b, `wordPose(5.6)[${i}]`); });

// The wave starts and ends at rest too.
HAND.forEach((b, i) => { same(wavePose(b, 0), b, `wavePose(0)[${i}]`); same(wavePose(b, 2.2), b, `wavePose(2.2)[${i}]`); });

// A click waves first: at t = W the wave is over and the turn has not begun, so every block is at rest.
assert.equal(TOTAL, W + 5.6, 'click total is the wave plus the word turn');
HAND.forEach((b, i) => { same(clickPose(b, i, W), b, `clickPose(W)[${i}]`); same(clickPose(b, i, TOTAL), b, `clickPose(TOTAL)[${i}]`); });

// ...and the hand really waves: somewhere in 0..W at least one block leaves its rest pose.
let waved = 0;
for (let t = 0; t < W; t += 0.05) HAND.forEach((b, i) => { const p = clickPose(b, i, t); waved = Math.max(waved, Math.abs(p.x - b.x), Math.abs(p.y - b.y)); });
assert.ok(waved > 1, `the hand waves: max deviation ${waved} units`);

// Extra word blocks stay at zero size until the wave is over.
EXTRA.forEach((e, n) => { for (let t = 0; t < W; t += 0.05) { const p = clickExtra(e, t); assert.ok(p.w === 0 && p.h === 0, `extra ${n} is empty before W`); } });

// Pointing never moves the index fingertip, and the cursor hot spot is on it.
const tip = HAND.find((b) => b.finger === 0 && b.level === 2);
same(pointPose(tip), tip, 'index tip');
near(HOT.x, tip.x + tip.w / 2, 'hot x'); near(HOT.y, tip.y, 'hot y');

console.log('hand checks: ok');
