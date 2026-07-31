function hashSeed(value) {
  let acc = 2166136261;
  for (const character of String(value ?? "")) {
    acc ^= character.charCodeAt(0);
    acc = Math.imul(acc, 16777619) >>> 0;
  }
  return acc || 1;
}

function promptText(question) {
  return String(
    question?.blankedDisplayText
      ?? question?.promptText
      ?? question?.prompt
      ?? question?.questionText
      ?? question?.displayText
      ?? "",
  ).replace(/\s+/g, " ").trim();
}

function questionIdentity(question, index) {
  const patternSpecId = question?.patternSpecId ?? question?.metadata?.patternId ?? "unknown";
  const explicitId = question?.id ?? question?.questionId ?? question?.metadata?.questionId;
  if (explicitId != null && String(explicitId).length > 0) {
    return `${patternSpecId}:id:${String(explicitId)}`;
  }
  const prompt = promptText(question);
  if (prompt) return `${patternSpecId}:prompt:${prompt}`;
  try {
    return `${patternSpecId}:json:${JSON.stringify(question)}`;
  } catch {
    return `${patternSpecId}:index:${index}`;
  }
}

function patternSlotKey(question) {
  return String(
    question?.patternSpecId
      ?? question?.metadata?.patternId
      ?? question?.patternGroupId
      ?? question?.metadata?.patternGroupId
      ?? "__ungrouped__",
  );
}

function sameIdentityOrder(left, right) {
  if (left.length !== right.length) return false;
  return left.every((question, index) => question === right[index]);
}

function rotate(values, offset) {
  if (values.length < 2) return [...values];
  const normalized = ((offset % values.length) + values.length) % values.length;
  if (normalized === 0) return [...values];
  return [...values.slice(normalized), ...values.slice(0, normalized)];
}

function deterministicSeedOrder(entries, seed, slotKey) {
  if (entries.length < 2) return entries.map((entry) => entry.question);
  const ordered = entries
    .map((entry) => ({
      ...entry,
      sortKey: hashSeed(`${seed}\u0000${slotKey}\u0000${entry.identity}`),
    }))
    .sort((left, right) => left.sortKey - right.sortKey || left.index - right.index)
    .map((entry) => entry.question);

  const original = entries.map((entry) => entry.question);
  if (!sameIdentityOrder(ordered, original)) return ordered;

  const forcedOffset = 1 + (hashSeed(`${seed}\u0000${slotKey}\u0000forced-rotation`) % (entries.length - 1));
  return rotate(original, forcedOffset);
}

/**
 * Applies a deterministic, seed-bearing order projection without changing the
 * generated question membership, question objects, answers, IDs, allocation,
 * capacity, or PatternSpec slots. This is the shared browser-product contract
 * used when a finite generator pool is valid but emits a seed-insensitive order.
 */
export function applyRegenerateIdentitySeedOrder(result, options = {}) {
  if (result?.ok !== true || !Array.isArray(result.questions) || result.questions.length < 2) {
    return result;
  }

  const seed = String(options.generationSeed ?? result?.plan?.generationSeed ?? "").trim();
  if (!seed) return result;

  const projected = [...result.questions];
  const slots = new Map();
  result.questions.forEach((question, index) => {
    const slotKey = patternSlotKey(question);
    if (!slots.has(slotKey)) slots.set(slotKey, []);
    slots.get(slotKey).push({
      question,
      index,
      identity: questionIdentity(question, index),
    });
  });

  let changed = false;
  for (const [slotKey, entries] of slots) {
    if (entries.length < 2) continue;
    const ordered = deterministicSeedOrder(entries, seed, slotKey);
    if (!sameIdentityOrder(ordered, entries.map((entry) => entry.question))) changed = true;
    entries.forEach((entry, index) => {
      projected[entry.index] = ordered[index];
    });
  }

  if (!changed) return result;
  return {
    ...result,
    questions: projected,
  };
}
