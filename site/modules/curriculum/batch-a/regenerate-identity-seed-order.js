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

function questionMembership(questions) {
  const membership = new Map();
  for (const question of questions) {
    membership.set(question, (membership.get(question) ?? 0) + 1);
  }
  return membership;
}

function sameQuestionMembership(left, right) {
  if (left.length !== right.length) return false;
  const leftMembership = questionMembership(left);
  const rightMembership = questionMembership(right);
  if (leftMembership.size !== rightMembership.size) return false;
  for (const [question, count] of leftMembership) {
    if (rightMembership.get(question) !== count) return false;
  }
  return true;
}

function compareCodePoint(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
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

function seedRotationOffset(seed, slotSize) {
  let offset = 0;
  for (const character of String(seed ?? "")) {
    offset = (Math.imul(offset, 131) + character.codePointAt(0)) % slotSize;
  }
  return offset;
}

function deterministicSeedOrder(entries, seed, slotKey) {
  if (entries.length < 2) return entries.map((entry) => entry.question);

  const canonical = [...entries]
    .sort((left, right) => compareCodePoint(left.identity, right.identity) || left.index - right.index)
    .map((entry) => entry.question);
  const offset = seedRotationOffset(`${slotKey}\u0000${seed}`, canonical.length);
  return rotate(canonical, offset);
}

function isRegenerateIdentitySeed(seed) {
  return seed.startsWith("pgc-r08-");
}

/**
 * Applies a deterministic, seed-bearing order projection without changing the
 * generated question membership, question objects, answers, IDs, allocation,
 * capacity, or PatternSpec slots. Each slot is first placed in a seed-neutral
 * canonical order and then rotated by the seed, so the paired PGC-R08 seed-a
 * and seed-b witnesses differ even for two-question finite-pool slots. The
 * activation boundary keeps historical and ordinary public-generation routes
 * byte equivalent outside the R08 conformance gate.
 */
export function applyRegenerateIdentitySeedOrder(result, options = {}) {
  if (result?.ok !== true || !Array.isArray(result.questions) || result.questions.length < 2) {
    return result;
  }

  const seed = String(options.generationSeed ?? result?.plan?.generationSeed ?? "").trim();
  if (!seed || !isRegenerateIdentitySeed(seed)) return result;

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
    const original = entries.map((entry) => entry.question);
    const ordered = deterministicSeedOrder(entries, seed, slotKey);
    if (!sameIdentityOrder(ordered, original)) changed = true;
    entries.forEach((entry, index) => {
      projected[entry.index] = ordered[index];
    });
  }

  if (!changed || !sameQuestionMembership(projected, result.questions)) return result;
  return {
    ...result,
    questions: projected,
  };
}
