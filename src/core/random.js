function normalizeSeed(seed) {
  if (typeof seed === "number" && Number.isFinite(seed)) {
    return Math.abs(Math.trunc(seed)) >>> 0;
  }

  if (typeof seed === "string") {
    let acc = 0;
    for (const char of seed) {
      acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
    }
    return acc;
  }

  return null;
}

export function createSeededRandom(seed) {
  const normalizedSeed = normalizeSeed(seed);
  if (normalizedSeed === null) {
    return Math.random;
  }

  let state = normalizedSeed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function randomIntBetween(randomFn, min, max) {
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
    throw new RangeError("randomIntBetween requires integer min/max with max >= min.");
  }

  const nextRandom = typeof randomFn === "function" ? randomFn : Math.random;
  return min + Math.floor(nextRandom() * (max - min + 1));
}

export function pickOne(randomFn, values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new RangeError("pickOne requires a non-empty array.");
  }

  return values[randomIntBetween(randomFn, 0, values.length - 1)];
}
