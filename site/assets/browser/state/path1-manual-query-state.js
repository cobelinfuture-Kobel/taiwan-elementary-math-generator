export const PATH1_MANUAL_DEFAULT_BLOCK_ID = "P1-01";
export const PATH1_MANUAL_DEFAULT_PRACTICE_MODE = "arithmetic";
export const PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE = "equalGroupsTransfer";

const PATH1_MANUAL_PRACTICE_MODES = Object.freeze([
  PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
  PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
]);
const TRANSFER_BLOCK_IDS = new Set(["P1-01", "P1-02"]);

function warning(code, details = {}) {
  return Object.freeze({ code, ...details });
}

function normalizedValidBlockIds(validBlockIds = []) {
  const ids = [...new Set((validBlockIds ?? []).map((value) => String(value ?? "").trim()).filter(Boolean))];
  return ids.length > 0 ? ids : [PATH1_MANUAL_DEFAULT_BLOCK_ID];
}

export function normalizePath1ManualQueryState(
  { path1BlockId, practiceMode } = {},
  { validBlockIds = [] } = {},
) {
  const allowedBlockIds = normalizedValidBlockIds(validBlockIds);
  const allowedBlockSet = new Set(allowedBlockIds);
  const warnings = [];

  let normalizedBlockId = String(path1BlockId ?? PATH1_MANUAL_DEFAULT_BLOCK_ID).trim();
  if (!allowedBlockSet.has(normalizedBlockId)) {
    warnings.push(warning("PATH1_PUBLIC_BLOCK_QUERY_FALLBACK", {
      requested: normalizedBlockId,
      normalized: PATH1_MANUAL_DEFAULT_BLOCK_ID,
    }));
    normalizedBlockId = allowedBlockSet.has(PATH1_MANUAL_DEFAULT_BLOCK_ID)
      ? PATH1_MANUAL_DEFAULT_BLOCK_ID
      : allowedBlockIds[0];
  }

  let normalizedPracticeMode = String(practiceMode ?? PATH1_MANUAL_DEFAULT_PRACTICE_MODE).trim();
  if (!PATH1_MANUAL_PRACTICE_MODES.includes(normalizedPracticeMode)) {
    warnings.push(warning("PATH1_PUBLIC_PRACTICE_MODE_QUERY_FALLBACK", {
      requested: normalizedPracticeMode,
      normalized: PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
    }));
    normalizedPracticeMode = PATH1_MANUAL_DEFAULT_PRACTICE_MODE;
  }

  if (
    normalizedPracticeMode === PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE
    && !TRANSFER_BLOCK_IDS.has(normalizedBlockId)
  ) {
    warnings.push(warning("PATH1_PUBLIC_TRANSFER_MODE_BLOCK_NOT_SUPPORTED", {
      path1BlockId: normalizedBlockId,
      requestedPracticeMode: normalizedPracticeMode,
      normalized: PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
    }));
    normalizedPracticeMode = PATH1_MANUAL_DEFAULT_PRACTICE_MODE;
  }

  return Object.freeze({
    path1BlockId: normalizedBlockId,
    practiceMode: normalizedPracticeMode,
    warnings: Object.freeze(warnings),
  });
}

export function parsePath1ManualQueryState(
  search = "",
  { validBlockIds = [] } = {},
) {
  const params = new URLSearchParams(search);
  return normalizePath1ManualQueryState({
    path1BlockId: params.get("path1BlockId") ?? PATH1_MANUAL_DEFAULT_BLOCK_ID,
    practiceMode: params.get("practiceMode") ?? PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
  }, { validBlockIds });
}

export function serializePath1ManualQueryState(
  state = {},
  { validBlockIds = [], search = "" } = {},
) {
  const normalized = normalizePath1ManualQueryState(state, { validBlockIds });
  const params = new URLSearchParams(search);
  params.set("path1BlockId", normalized.path1BlockId);
  params.set("practiceMode", normalized.practiceMode);
  return Object.freeze({
    ...normalized,
    search: `?${params.toString()}`,
  });
}

export function path1ManualBlockSupportsEqualGroupsTransfer(path1BlockId) {
  return TRANSFER_BLOCK_IDS.has(path1BlockId);
}
