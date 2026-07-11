const PUBLIC_MESSAGE_BY_CODE = Object.freeze({
  kp_resolver_selection_mode_invalid: "出題模式無效，請重新選擇。",
  kp_resolver_no_visible_kp: "請至少選擇一個目前可用的知識點。",
  kp_resolver_kp_not_visible: "選取的知識點已不可用，請重新選擇。",
  kp_resolver_pattern_group_not_visible: "選取的題目形式已不可用，請重新選擇。",
  kp_resolver_pattern_group_not_linked_to_kp: "題目形式與所選知識點不相符，請重新選擇。",
  kp_resolver_pattern_group_selection_required: "此知識點有多種題目形式，請至少選擇一種。",
  kp_resolver_mixed_same_unit_source_mismatch: "同單元混合只能選擇同一個單元內的知識點。",
  kp_resolver_cross_unit_not_supported_yet: "目前尚未開放跨單元知識點混合。",
  G3B_U04_CANONICAL_SCOPE_INVALID: "目前的兩步驟計算選擇無法產生題目，請重新選擇。",
  G3B_U04_CANONICAL_PATTERN_NOT_PROMOTED: "選取的題目形式尚未開放。",
  G3B_U04_CANONICAL_GROUP_NOT_RESOLVED: "題目形式未正確連結到目前選擇。",
  G3B_U04_CANONICAL_PATTERN_NOT_RESOLVED: "題型未正確連結到目前選擇。",
  G3B_U04_CANONICAL_HIDDEN_MODE_FORBIDDEN: "公開介面不接受內部測試模式。",
  G3B_U04_PRODUCTION_RESOLVER_REQUIRED: "請從公開知識點與題目形式重新建立出題設定。",
  G3B_U04_PRODUCTION_PATTERN_GROUP_NOT_VISIBLE: "選取的題目形式目前不可用。",
  G3B_U04_PRODUCTION_PATTERN_NOT_PROMOTED: "選取的題型目前尚未開放。",
  G3B_U04_PRODUCTION_COUNT_INVALID: "題目數量必須介於 1 到 200 題。",
  G3B_U08_CANONICAL_SCOPE_INVALID: "目前的乘法與除法應用題選擇無法產生題目，請重新選擇。",
  G3B_U08_CANONICAL_PATTERN_NOT_PROMOTED: "選取的應用題型尚未開放。",
  G3B_U08_CANONICAL_GROUP_NOT_RESOLVED: "應用題形式未正確連結到目前選擇。",
  G3B_U08_CANONICAL_PATTERN_NOT_RESOLVED: "應用題型未正確連結到目前選擇。",
  G3B_U08_CANONICAL_HIDDEN_MODE_FORBIDDEN: "公開介面不接受內部測試模式。",
  G3B_U08_PRODUCTION_SOURCE_INVALID: "目前選取的單元無法使用這組應用題設定。",
  G3B_U08_PRODUCTION_ROUTE_INVALID: "請重新選擇乘法與除法應用題知識點。",
  G3B_U08_PRODUCTION_RESOLVER_REQUIRED: "請從公開知識點重新建立出題設定。",
  G3B_U08_PRODUCTION_HIDDEN_OR_REPRESENTATION_MODE_FORBIDDEN: "本單元只提供應用題，不需要選擇其他題目形式。",
  G3B_U08_PRODUCTION_QUESTION_COUNT_INVALID: "題目數量必須介於 1 到 200 題。",
  G3B_U08_PRODUCTION_LIFECYCLE_INVALID: "此單元目前尚未完成公開出題準備。",
  G3B_U08_PRODUCTION_ALLOCATION_EMPTY: "請至少選擇一個可用的應用題知識點。",
  G3B_U08_PRODUCTION_ALLOCATION_COUNT_INVALID: "題目配置無效，請重新產生。",
  G3B_U08_PRODUCTION_PATTERN_NOT_ELIGIBLE: "選取的應用題型目前尚未開放。",
  G3B_U08_PRODUCTION_GROUP_NOT_VISIBLE: "選取的應用題形式目前不可用。",
  G3B_U08_PRODUCTION_PATTERN_NOT_RESOLVED: "應用題型未正確連結到目前選擇。",
  G3B_U08_PRODUCTION_ALLOCATION_MISMATCH: "題目配置與題數不一致，請重新產生。",
  pixel_generation_missing_source_id: "請先選擇一個單元。",
  pixel_generation_invalid_question_count: "題目數量必須介於 1 到 200 題。",
  pixel_generation_single_kp_selection_invalid: "單一知識點模式需要一個知識點與至少一種題目形式。",
  pixel_generation_mixed_kp_selection_invalid: "同單元混合模式需要至少兩個知識點，且每個知識點都要有題目形式。",
  public_pattern_group_dropped: "已移除不屬於目前知識點的題目形式。",
  public_pattern_group_defaulted: "已為新選取的知識點套用預設題目形式。",
  public_pattern_group_minimum_one: "每個知識點至少要保留一種題目形式。"
});

const INTERNAL_IDENTIFIER_PATTERN = /\b(?:kp|pg|ps|tpl|ctx)_[a-z0-9_]+\b/gi;
const SOURCE_IDENTIFIER_PATTERN = /\b(?:g\d+[ab]_u\d+_[0-9a-z_]+)\b/gi;

export function sanitizePublicMessage(value) {
  return String(value ?? "")
    .replace(INTERNAL_IDENTIFIER_PATTERN, "所選項目")
    .replace(SOURCE_IDENTIFIER_PATTERN, "目前單元")
    .replace(/\s+/g, " ")
    .trim();
}

export function publicIssueMessage(issue = {}) {
  const code = String(issue?.code ?? "").trim();
  const mapped = PUBLIC_MESSAGE_BY_CODE[code];
  if (mapped) return mapped;
  const sanitized = sanitizePublicMessage(issue?.message ?? "");
  if (sanitized && !/^[A-Z0-9_]+$/.test(sanitized)) return sanitized;
  return issue?.severity === "warning"
    ? "設定已調整，請確認目前選擇。"
    : "無法完成出題，請確認知識點、題目形式與題數設定。";
}

export function publicSelectorWarningMessage(warning = {}) {
  return publicIssueMessage({ severity: "warning", ...warning });
}
