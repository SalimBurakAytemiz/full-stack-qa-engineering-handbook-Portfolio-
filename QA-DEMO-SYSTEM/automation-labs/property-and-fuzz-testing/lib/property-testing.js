'use strict';

// A real, hand-rolled property-based testing framework — not a
// description of the technique, the actual generator/runner/shrinker
// machinery, deliberately built in-house rather than pulling in
// fast-check/jsverify (this repository avoids dependency bloat and
// prefers reuse/understanding over a black-box library — see the
// Part 2 tooling principle). The PRNG is seeded so every run is
// reproducible: the same seed always produces the same sequence of
// generated inputs, which is the property-based-testing discipline
// that matters most in practice — a failing run must be replayable,
// not "sometimes fails, who knows why."
// TR: Gerçek, elle yazılmış bir property-based test framework'ü — bir
// açıklama değil, GERÇEKTEN çalışan generator/runner/shrinker
// mekanizmasıdır. PRNG seed'lidir — aynı seed her zaman aynı girdi
// dizisini üretir, bu yüzden başarısız bir çalışma HER ZAMAN tekrar
// oynatılabilir (reproducible).

// mulberry32 — a small, fast, deterministic 32-bit PRNG. Public-domain
// algorithm; chosen for simplicity and determinism, not cryptographic
// strength (this is test-input generation, not security).
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRng(seed) {
  const rand = mulberry32(seed);
  const rng = {
    next: () => rand(),
    intBetween(min, max) {
      return min + Math.floor(rand() * (max - min + 1));
    },
    pick(arr) {
      return arr[rng.intBetween(0, arr.length - 1)];
    },
  };
  return rng;
}

const gen = {
  int: (min, max) => (rng) => rng.intBetween(min, max),
  oneOf: (arr) => (rng) => rng.pick(arr),
  arrayOf: (itemGen, { minLength = 0, maxLength = 10 } = {}) => (rng) => {
    const len = rng.intBetween(minLength, maxLength);
    return Array.from({ length: len }, () => itemGen(rng));
  },
};

const shrink = {
  // Shrinks an integer toward `target` (default 0) — the classic
  // property-testing move: a failure at 8734 usually has the same
  // root cause as a failure at 1, and 1 is a far more readable bug
  // report.
  int: (target = 0) => (value) => {
    if (value === target) return [];
    const mid = target + Math.floor((value - target) / 2);
    const step = value > target ? value - 1 : value + 1;
    const candidates = [target];
    if (mid !== value && mid !== target) candidates.push(mid);
    // A binary jump alone can overshoot past the exact failure
    // boundary and get stuck (e.g. halving from 125 lands on 62,
    // which no longer fails). The single-step candidate guarantees
    // convergence to the exact minimal counterexample once the binary
    // jumps get close, by walking one integer at a time from there.
    if (step !== value) candidates.push(step);
    return candidates;
  },
  // Shrinks an array by trying to drop its last or first element —
  // simple, but genuinely finds a minimal failing-length case.
  array: () => (arr) => {
    const candidates = [];
    if (arr.length > 0) candidates.push(arr.slice(0, -1));
    if (arr.length > 1) candidates.push(arr.slice(1));
    return candidates;
  },
};

/**
 * Runs `property` against `runs` generated inputs. On the first
 * failure, shrinks toward a minimal reproducing case (if `shrinker` is
 * given) and returns full diagnostic detail — the seed, the raw
 * failing input, and the shrunk one — so the failure is both
 * reproducible and readable.
 */
function forAll(generator, property, { seed = 1, runs = 100, shrinker = null, maxShrinkSteps = 1000 } = {}) {
  const rng = makeRng(seed);

  for (let i = 0; i < runs; i += 1) {
    const input = generator(rng);
    let holds;
    let thrown = null;
    try {
      holds = property(input);
    } catch (err) {
      holds = false;
      thrown = err;
    }

    if (!holds) {
      let failing = input;
      if (shrinker) {
        let improved = true;
        let steps = 0;
        while (improved && steps < maxShrinkSteps) {
          improved = false;
          for (const candidate of shrinker(failing)) {
            steps += 1;
            let candidateHolds;
            try {
              candidateHolds = property(candidate);
            } catch {
              candidateHolds = false;
            }
            if (!candidateHolds) {
              failing = candidate;
              improved = true;
              break;
            }
          }
        }
      }
      return { passed: false, seed, runsCompleted: i + 1, failingInput: input, shrunkInput: failing, error: thrown };
    }
  }

  return { passed: true, seed, runsCompleted: runs };
}

module.exports = { mulberry32, makeRng, gen, shrink, forAll };
