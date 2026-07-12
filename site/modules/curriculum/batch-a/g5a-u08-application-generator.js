import {
  ALLOWED_SDG_IDS as CORE_ALLOWED_SDG_IDS,
  G5A_U08_S60H_PATTERN_SPEC_IDS as CORE_PATTERN_SPEC_IDS,
  SPEC_POLICY as CORE_SPEC_POLICY,
  generateG5AU08ApplicationQuestion as generateCoreQuestion,
} from "./g5a-u08-application-generator-core.js";

const MAX_BATCH_COUNT = 1000;
const DEPTHS = Object.freeze(["N", "N_PLUS_1"]);
const CONTEXT_TYPES = Object.freeze(["daily_life", "sdg"]);

export const ALLOWED_SDG_IDS = CORE_ALLOWED_SDG_IDS;
export const G5A_U08_S60H_PATTERN_SPEC_IDS = CORE_PATTERN_SPEC_IDS;
export const SPEC_POLICY = CORE_SPEC_POLICY;
export const generateG5AU08ApplicationQuestion = generateCoreQuestion;

const SDG_GOAL_OPTIONS = Object.freeze({
  SDG_2: Object.freeze([
    Object.freeze({ patternSpecId: "ps_g5a_u08_app_group_select", depth: "N_PLUS_1" }),
  ]),
  SDG_4: Object.freeze([
    Object.freeze({ patternSpecId: "ps_g5a_u08_app_two_same_rate_groups_sum", depth: "N" }),
    Object.freeze({ patternSpecId: "ps_g5a_u08_app_two_same_rate_groups_sum", depth: "N_PLUS_1" }),
  ]),
  SDG_6: Object.freeze([
    Object.freeze({ patternSpecId: "ps_g5a_u08_app_average_update", depth: "N_PLUS_1" }),
    Object.freeze({ patternSpecId: "ps_g5a_u08_app_adjust_unit_remaining", depth: "N_PLUS_1" }),
  ]),
  SDG_7: Object.freeze([
    Object.freeze({ patternSpecId: "ps_g5a_u08_app_average_inverse", depth: "N_PLUS_1" }),
    Object.freeze({ patternSpecId: "ps_g5a_u08_app_adjust_unit_remaining", depth: "N_PLUS_1" }),
  ]),
  SDG_11: Object.freeze([
    Object.freeze({ patternSpecId: "ps_g5a_u08_app_direct_average", depth: "N" }),
    Object.freeze({ patternSpecId: "ps_g5a_u08_app_two_product_groups_difference", depth: "N_PLUS_1" }),
  ]),
  SDG_12: Object.freeze([
    Object.freeze({ patternSpecId: "ps_g5a_u08_app_discount_change", depth: "N_PLUS_1" }),
    Object.freeze({ patternSpecId: "ps_g5a_u08_app_average_share_transfer", depth: "N_PLUS_1" }),
  ]),
  SDG_13: Object.freeze([
    Object.freeze({ patternSpecId: "ps_g5a_u08_app_near_round_unit_price", depth: "N" }),
    Object.freeze({ patternSpecId: "ps_g5a_u08_app_near_round_unit_price", depth: "N_PLUS_1" }),
  ]),
  SDG_15: Object.freeze([
    Object.freeze({ patternSpecId: "ps_g5a_u08_app_nested_grouping", depth: "N_PLUS_1" }),
  ]),
});

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "s60h-r1")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619);
  }
  return acc >>> 0 || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function randomInt(seed, offset, min, max) {
  const mixed = mix32(seed + Math.imul(offset + 1, 0x9e3779b1));
  return min + (mixed % (max - min + 1));
}

function deterministicShuffle(values, seed) {
  const output = [...values];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(seed, output.length - index, 0, index);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

function normalizeSelectedIds(ids) {
  const selected = ids == null ? [...G5A_U08_S60H_PATTERN_SPEC_IDS] : [...new Set(ids)];
  if (selected.length === 0) throw new Error("G5A_U08_APP_EMPTY_PATTERN_SELECTION");
  for (const id of selected) {
    if (!G5A_U08_S60H_PATTERN_SPEC_IDS.includes(id)) {
      throw new Error(`G5A_U08_APP_PATTERN_SPEC_UNSUPPORTED:${id}`);
    }
  }
  return selected;
}

function supports(selected, depth, contextType = null) {
  return selected.some((id) => {
    const policy = SPEC_POLICY[id];
    return policy.depths.includes(depth) && (contextType == null || policy.contexts.includes(contextType));
  });
}

function orderedCountCandidates(total, preferred, mode, firstSupported, secondSupported, firstName, secondName) {
  if (mode === firstName) {
    if (!firstSupported) throw new Error(`G5A_U08_APP_NO_ELIGIBLE_PATTERN:${firstName}`);
    return [total];
  }
  if (mode === secondName) {
    if (!secondSupported) throw new Error(`G5A_U08_APP_NO_ELIGIBLE_PATTERN:${secondName}`);
    return [0];
  }
  if (mode !== "mixed") throw new Error(`G5A_U08_APP_MODE_INVALID:${mode}`);
  if (!firstSupported && !secondSupported) throw new Error("G5A_U08_APP_NO_ELIGIBLE_PATTERN");
  if (!firstSupported) return [0];
  if (!secondSupported) return [total];
  return Array.from({ length: total + 1 }, (_, value) => value).sort((a, b) => {
    const distance = Math.abs(a - preferred) - Math.abs(b - preferred);
    return distance || a - b;
  });
}

function cellKey(patternSpecId, depth, contextType) {
  return `${patternSpecId}|${depth}|${contextType}`;
}

function jointKey(depth, contextType) {
  return `${depth}|${contextType}`;
}

function eligibleSpecs(selected, depth, contextType) {
  return selected.filter((id) => {
    const policy = SPEC_POLICY[id];
    return policy.depths.includes(depth) && policy.contexts.includes(contextType);
  });
}

function resolveJointPlan(questionCount, selected, depthMode, contextMode) {
  const preferredN = Math.round(questionCount * 0.3);
  const preferredDaily = Math.round(questionCount * 0.5);
  const nCandidates = orderedCountCandidates(
    questionCount,
    preferredN,
    depthMode,
    supports(selected, "N"),
    supports(selected, "N_PLUS_1"),
    "N",
    "N_PLUS_1",
  );
  const dailyCandidates = orderedCountCandidates(
    questionCount,
    preferredDaily,
    contextMode,
    selected.some((id) => SPEC_POLICY[id].contexts.includes("daily_life")),
    selected.some((id) => SPEC_POLICY[id].contexts.includes("sdg")),
    "daily_life",
    "sdg",
  );

  let best = null;
  for (const nCount of nCandidates) {
    const nPlus1Count = questionCount - nCount;
    for (const dailyCount of dailyCandidates) {
      const sdgCount = questionCount - dailyCount;
      const minimumNDaily = Math.max(0, dailyCount - nPlus1Count);
      const maximumNDaily = Math.min(nCount, dailyCount);
      for (let nDaily = minimumNDaily; nDaily <= maximumNDaily; nDaily += 1) {
        const counts = {
          [jointKey("N", "daily_life")]: nDaily,
          [jointKey("N", "sdg")]: nCount - nDaily,
          [jointKey("N_PLUS_1", "daily_life")]: dailyCount - nDaily,
          [jointKey("N_PLUS_1", "sdg")]: sdgCount - (nCount - nDaily),
        };
        if (Object.values(counts).some((count) => count < 0)) continue;
        const feasible = DEPTHS.every((depth) => CONTEXT_TYPES.every((contextType) => {
          const count = counts[jointKey(depth, contextType)];
          return count === 0 || eligibleSpecs(selected, depth, contextType).length > 0;
        }));
        if (!feasible) continue;
        const proportional = questionCount === 0 ? 0 : (nCount * dailyCount) / questionCount;
        const score =
          Math.abs(nCount - preferredN) * 1_000_000 +
          Math.abs(dailyCount - preferredDaily) * 10_000 +
          Math.abs(nDaily - proportional);
        if (!best || score < best.score) {
          best = { counts, nCount, dailyCount, score };
        }
      }
    }
  }
  if (!best) throw new Error(`G5A_U08_APP_NO_ELIGIBLE_PATTERN:${depthMode}:${contextMode}`);
  return best;
}

function selectOptionForGoal(goalId, selectedSet, remaining) {
  const options = SDG_GOAL_OPTIONS[goalId] ?? [];
  return options.find(({ patternSpecId, depth }) =>
    selectedSet.has(patternSpecId) &&
    (remaining.get(jointKey(depth, "sdg")) ?? 0) > 0 &&
    SPEC_POLICY[patternSpecId].depths.includes(depth) &&
    SPEC_POLICY[patternSpecId].contexts.includes("sdg"));
}

function generateQuestionForCell(patternSpecId, depth, contextType, seed, desiredSdgGoalId = null) {
  const maxAttempts = desiredSdgGoalId == null ? 1 : 96;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const question = generateCoreQuestion(patternSpecId, {
      seed: `${seed}:${attempt}`,
      depth,
      contextType,
    });
    if (desiredSdgGoalId == null || question.context.sdgGoalId === desiredSdgGoalId) return question;
  }
  throw new Error(`G5A_U08_APP_SDG_GOAL_UNREACHABLE:${desiredSdgGoalId}:${patternSpecId}`);
}

function increment(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function frozenObjectFromMap(map) {
  return Object.freeze(Object.fromEntries([...map.entries()].sort(([a], [b]) => a.localeCompare(b))));
}

export function generateG5AU08ApplicationBatch({
  questionCount,
  seed = "s60h-batch",
  selectedPatternSpecIds = null,
  depthMode = "mixed",
  contextMode = "mixed",
  ordering = "grouped",
} = {}) {
  if (!Number.isSafeInteger(questionCount) || questionCount < 1 || questionCount > MAX_BATCH_COUNT) {
    throw new Error(`G5A_U08_APP_QUESTION_COUNT_INVALID:${questionCount}`);
  }
  if (!new Set(["grouped", "shuffled"]).has(ordering)) {
    throw new Error(`G5A_U08_APP_ORDERING_INVALID:${ordering}`);
  }

  const selected = normalizeSelectedIds(selectedPatternSpecIds);
  const selectedSet = new Set(selected);
  const plan = resolveJointPlan(questionCount, selected, depthMode, contextMode);
  const remaining = new Map(Object.entries(plan.counts));
  const specCounts = new Map(selected.map((id) => [id, 0]));
  const cellCounts = new Map();
  const rows = [];
  let sequence = 0;

  function addQuestion(patternSpecId, depth, contextType, reason, desiredSdgGoalId = null) {
    const key = jointKey(depth, contextType);
    if ((remaining.get(key) ?? 0) <= 0) return false;
    const question = generateQuestionForCell(
      patternSpecId,
      depth,
      contextType,
      `${seed}:${reason}:${patternSpecId}:${sequence}`,
      desiredSdgGoalId,
    );
    sequence += 1;
    rows.push(question);
    remaining.set(key, remaining.get(key) - 1);
    increment(specCounts, patternSpecId);
    increment(cellCounts, cellKey(patternSpecId, depth, contextType));
    return true;
  }

  // Coverage seeding is feasibility-aware. It never changes the requested joint margins.
  if (contextMode !== "daily_life") {
    for (const goalId of ALLOWED_SDG_IDS) {
      const option = selectOptionForGoal(goalId, selectedSet, remaining);
      if (option) addQuestion(option.patternSpecId, option.depth, "sdg", `sdg:${goalId}`, goalId);
    }
  }

  // Seed every selected PatternSpec when the remaining quota permits its legal cell.
  for (const patternSpecId of selected) {
    if ((specCounts.get(patternSpecId) ?? 0) > 0) continue;
    const policy = SPEC_POLICY[patternSpecId];
    const candidates = [];
    for (const depth of policy.depths) {
      for (const contextType of policy.contexts) {
        const count = remaining.get(jointKey(depth, contextType)) ?? 0;
        if (count > 0) candidates.push({ depth, contextType, count });
      }
    }
    candidates.sort((a, b) => b.count - a.count || DEPTHS.indexOf(a.depth) - DEPTHS.indexOf(b.depth) || CONTEXT_TYPES.indexOf(a.contextType) - CONTEXT_TYPES.indexOf(b.contextType));
    if (candidates.length > 0) {
      const { depth, contextType } = candidates[0];
      addQuestion(patternSpecId, depth, contextType, "spec-seed");
    }
  }

  // Balanced fill uses PatternSpec × depth × contextType counts, not total spec counts alone.
  for (const depth of DEPTHS) {
    for (const contextType of CONTEXT_TYPES) {
      const key = jointKey(depth, contextType);
      while ((remaining.get(key) ?? 0) > 0) {
        const eligible = eligibleSpecs(selected, depth, contextType);
        if (eligible.length === 0) throw new Error(`G5A_U08_APP_NO_ELIGIBLE_PATTERN:${depth}:${contextType}`);
        const minimumCell = Math.min(...eligible.map((id) => cellCounts.get(cellKey(id, depth, contextType)) ?? 0));
        const leastCellUsed = eligible.filter((id) => (cellCounts.get(cellKey(id, depth, contextType)) ?? 0) === minimumCell);
        const minimumSpec = Math.min(...leastCellUsed.map((id) => specCounts.get(id) ?? 0));
        const leastSpecUsed = leastCellUsed.filter((id) => (specCounts.get(id) ?? 0) === minimumSpec);
        const selectedIndex = randomInt(hashSeed(seed), sequence + 1, 0, leastSpecUsed.length - 1);
        addQuestion(leastSpecUsed[selectedIndex], depth, contextType, "balanced-fill");
      }
    }
  }

  let questions;
  if (ordering === "shuffled") {
    questions = deterministicShuffle(rows, hashSeed(seed));
  } else {
    const order = new Map(selected.map((id, index) => [id, index]));
    questions = [...rows].sort((a, b) =>
      order.get(a.patternSpecId) - order.get(b.patternSpecId) ||
      DEPTHS.indexOf(a.depth) - DEPTHS.indexOf(b.depth) ||
      CONTEXT_TYPES.indexOf(a.context.contextType) - CONTEXT_TYPES.indexOf(b.context.contextType));
  }

  const depthAllocation = Object.freeze({
    N: questions.filter((row) => row.depth === "N").length,
    N_PLUS_1: questions.filter((row) => row.depth === "N_PLUS_1").length,
  });
  const contextAllocation = Object.freeze({
    daily_life: questions.filter((row) => row.context.contextType === "daily_life").length,
    sdg: questions.filter((row) => row.context.contextType === "sdg").length,
  });
  const actualCellCounts = new Map();
  for (const question of questions) {
    increment(actualCellCounts, cellKey(question.patternSpecId, question.depth, question.context.contextType));
  }
  const coveredSdgGoalIds = Object.freeze([
    ...new Set(questions.filter((row) => row.context.contextType === "sdg").map((row) => row.context.sdgGoalId)),
  ].filter(Boolean).sort());

  return Object.freeze({
    sourceId: "g5a_u08_5a08",
    unitCode: "5A-U08",
    kind: "g5aU08ApplicationBatch",
    questionCount,
    seed: String(seed),
    ordering,
    depthMode,
    contextMode,
    allocationPolicy: "pattern_spec_x_depth_x_context_with_feasible_coverage_seeding",
    selectedPatternSpecIds: Object.freeze(selected),
    specAllocation: frozenObjectFromMap(specCounts),
    cellAllocation: frozenObjectFromMap(actualCellCounts),
    depthAllocation,
    contextAllocation,
    coveredSdgGoalIds,
    generatorRouting: "hidden_application_not_canonical",
    fallbackUsed: false,
    questions: Object.freeze(questions),
  });
}

export { SDG_GOAL_OPTIONS };
