import {
  buildPath1P102DiversityItems,
  PATH1_P1_02_DISTINCT_PROMPT_CAPACITY,
  PATH1_P1_02_KNOWLEDGE_POINT_IDS,
  PATH1_P1_02_PATTERN_FAMILIES,
  validatePath1P102DiversityItem,
} from "./path1-p1-02-diversity.js";
import {
  buildPath1P102AssessmentFamilyCandidates,
  PATH1_P1_02_ASSESSMENT_CANDIDATE_DISTINCT_PROMPT_CAPACITY,
  PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES,
  validatePath1P102AssessmentFamilyCandidate,
} from "./path1-p1-02-assessment-family-candidates.js";

export const PATH1_P1_02_PUBLIC_DIVERSITY_PROFILE_ID =
  "PATH1_P1_02_MULTI_DIGIT_BY_ONE_DIGIT_DIVERSITY_V2";

export const PATH1_P1_02_PUBLIC_PATTERN_FAMILIES = Object.freeze([
  ...PATH1_P1_02_PATTERN_FAMILIES,
  ...PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES,
]);

export const PATH1_P1_02_PUBLIC_DISTINCT_PROMPT_CAPACITY =
  PATH1_P1_02_DISTINCT_PROMPT_CAPACITY
  + PATH1_P1_02_ASSESSMENT_CANDIDATE_DISTINCT_PROMPT_CAPACITY;

function hashSeed(input) {
  let hash = 2166136261;
  for (const char of String(input)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededShuffle(values, seed) {
  const result = [...values];
  let state = hashSeed(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function promoteLegacyItem(entry) {
  return Object.freeze({
    ...entry,
    operationFamilyId: "PATH1_MULTI_DIGIT_BY_ONE_DIGIT_DIVERSITY_V2",
    metadata: Object.freeze({
      ...(entry.metadata ?? {}),
      path1DiversityProfileId: PATH1_P1_02_PUBLIC_DIVERSITY_PROFILE_ID,
      candidateOnly: false,
      publicCutoverApproved: true,
      promotedFromAssessmentCandidate: false,
    }),
  });
}

function promoteCandidateItem(entry) {
  return Object.freeze({
    ...entry,
    generatedItemId: String(entry.generatedItemId ?? "").replace("path1-p1-02-candidate-", "path1-p1-02-public-"),
    operationFamilyId: "PATH1_MULTI_DIGIT_BY_ONE_DIGIT_DIVERSITY_V2",
    metadata: Object.freeze({
      ...(entry.metadata ?? {}),
      path1DiversityProfileId: PATH1_P1_02_PUBLIC_DIVERSITY_PROFILE_ID,
      candidateOnly: false,
      publicCutoverApproved: true,
      promotedFromAssessmentCandidate: true,
    }),
  });
}

function candidateShadow(entry) {
  return {
    ...entry,
    metadata: {
      ...(entry.metadata ?? {}),
      candidateOnly: true,
      publicCutoverApproved: false,
    },
  };
}

export function validatePath1P102PublicDiversityItem(entry) {
  const errors = [];
  const metadata = entry?.metadata ?? {};
  const familyId = metadata.path1PatternFamilyId;

  if (!PATH1_P1_02_PUBLIC_PATTERN_FAMILIES.some((family) => family.familyId === familyId)) {
    errors.push("UNKNOWN_PUBLIC_PATTERN_FAMILY");
  }
  if (!PATH1_P1_02_KNOWLEDGE_POINT_IDS.includes(entry?.knowledgePointId)) {
    errors.push("KP_ID_MISMATCH");
  }
  if (metadata.path1DiversityProfileId !== PATH1_P1_02_PUBLIC_DIVERSITY_PROFILE_ID) {
    errors.push("PUBLIC_PROFILE_ID_MISMATCH");
  }
  if (metadata.candidateOnly !== false) errors.push("CANDIDATE_ONLY_SCOPE_LEAK");
  if (metadata.publicCutoverApproved !== true) errors.push("PUBLIC_CUTOVER_NOT_APPROVED");
  if (metadata.missingDigitInferenceUsed !== false) errors.push("MISSING_DIGIT_SCOPE_LEAK");
  if (metadata.zeroSpecialCaseRoutedHere !== false) errors.push("ZERO_SPECIAL_SCOPE_LEAK");

  if (PATH1_P1_02_PATTERN_FAMILIES.some((family) => family.familyId === familyId)) {
    const validation = validatePath1P102DiversityItem(entry);
    if (!validation.ok) errors.push(...validation.errors.map((code) => `LEGACY_${code}`));
    if (metadata.promotedFromAssessmentCandidate !== false) errors.push("LEGACY_PROMOTION_FLAG_MISMATCH");
  } else if (PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES.some((family) => family.familyId === familyId)) {
    const validation = validatePath1P102AssessmentFamilyCandidate(candidateShadow(entry));
    if (!validation.ok) errors.push(...validation.errors.map((code) => `PROMOTED_${code}`));
    if (metadata.promotedFromAssessmentCandidate !== true) errors.push("ASSESSMENT_PROMOTION_FLAG_MISMATCH");
  }

  return { ok: errors.length === 0, errors };
}

export function buildPath1P102PublicDiversityItems({
  count = 20,
  seed = "path1-p1-02-public-v2",
} = {}) {
  const requested = Math.max(1, Math.min(120, Number(count) || 20));
  const legacyCount = Math.ceil(requested / 2);
  const candidateCount = requested - legacyCount;
  const selected = [];

  if (legacyCount > 0) {
    const legacy = buildPath1P102DiversityItems({
      count: legacyCount,
      seed: `${seed}:legacy-c0-c1`,
    });
    if (!legacy.ok) return legacy;
    selected.push(...legacy.items.map(promoteLegacyItem));
  }

  if (candidateCount > 0) {
    const candidates = buildPath1P102AssessmentFamilyCandidates({
      count: candidateCount,
      seed: `${seed}:promoted-c2-c3`,
    });
    if (!candidates.ok) return candidates;
    selected.push(...candidates.items.map(promoteCandidateItem));
  }

  const items = seededShuffle(selected, `${seed}:cross-family-v2`);
  const validationFailures = items
    .map((entry, index) => ({ index, validation: validatePath1P102PublicDiversityItem(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (validationFailures.length > 0) {
    return {
      ok: false,
      items: [],
      errors: [{ code: "PATH1_P1_02_PUBLIC_V2_VALIDATION_FAILED", failures: validationFailures }],
    };
  }

  const duplicatePrompts = items.length - new Set(items.map((entry) => entry.prompt)).size;
  if (duplicatePrompts !== 0) {
    return {
      ok: false,
      items: [],
      errors: [{ code: "PATH1_P1_02_PUBLIC_V2_DUPLICATE_PROMPT", duplicatePrompts }],
    };
  }

  const familyCounts = Object.fromEntries(PATH1_P1_02_PUBLIC_PATTERN_FAMILIES.map(({ familyId }) => [
    familyId,
    items.filter((entry) => entry.metadata.path1PatternFamilyId === familyId).length,
  ]));
  const knowledgePointCounts = Object.fromEntries(PATH1_P1_02_KNOWLEDGE_POINT_IDS.map((knowledgePointId) => [
    knowledgePointId,
    items.filter((entry) => entry.knowledgePointId === knowledgePointId).length,
  ]));

  return {
    ok: true,
    items,
    errors: [],
    summary: {
      requested,
      generated: items.length,
      patternFamilyCount: PATH1_P1_02_PUBLIC_PATTERN_FAMILIES.length,
      distinctPromptCapacity: PATH1_P1_02_PUBLIC_DISTINCT_PROMPT_CAPACITY,
      diversityProfileId: PATH1_P1_02_PUBLIC_DIVERSITY_PROFILE_ID,
      publicCutoverApproved: true,
      familyCounts,
      knowledgePointCounts,
    },
  };
}
