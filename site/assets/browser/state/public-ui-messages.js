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

  G4B_U01_CANONICAL_SOURCE_INVALID: "目前選取的單元無法使用這組多位數乘除設定。",
  G4B_U01_CANONICAL_RESOLVER_REQUIRED: "請從公開知識點與橫式題型重新建立出題設定。",
  G4B_U01_CANONICAL_SELECTION_MODE_INVALID: "本單元只接受單一知識點或同單元知識點混合。",
  G4B_U01_CANONICAL_PUBLIC_MODE_FLAG_FORBIDDEN: "公開介面不接受內部或其他表示模式。",
  G4B_U01_CANONICAL_COUNT_INVALID: "題目數量設定無效，請重新輸入。",
  G4B_U01_CANONICAL_KP_NOT_PROMOTED: "選取的知識點目前尚未開放。",
  G4B_U01_CANONICAL_GROUP_NOT_PROMOTED: "選取的橫式題型目前尚未開放。",
  G4B_U01_CANONICAL_ALLOCATION_EMPTY: "請至少選擇一個可用的知識點與橫式題型。",
  G4B_U01_CANONICAL_ALLOCATION_COUNT_INVALID: "題目配置無效，請重新產生。",
  G4B_U01_CANONICAL_PATTERN_NOT_PROMOTED: "選取的題型目前尚未開放。",
  G4B_U01_CANONICAL_GROUP_NOT_RESOLVED: "橫式題型未正確連結到目前選擇。",
  G4B_U01_CANONICAL_PATTERN_NOT_RESOLVED: "題型未正確連結到目前選擇。",
  G4B_U01_CANONICAL_ALLOCATION_MISMATCH: "題目配置與題數不一致，請重新產生。",
  G4B_U01_CANONICAL_LIFECYCLE_INVALID: "此單元目前尚未完成公開出題準備。",
  G4B_U01_CANONICAL_ROUTE_METADATA_INVALID: "題目路由資料無效，請重新產生。",
  G4B_U01_CANONICAL_OUTPUT_COUNT_MISMATCH: "實際產生題數與設定不一致，請重新產生。",

  G4B_U01_PRODUCTION_SOURCE_INVALID: "目前選取的單元無法使用這組多位數乘除題目。",
  G4B_U01_PRODUCTION_ROUTE_INVALID: "請重新選擇多位數乘除的橫式知識點。",
  G4B_U01_PRODUCTION_RESOLVER_REQUIRED: "請從公開知識點與橫式題型重新建立出題設定。",
  G4B_U01_PRODUCTION_MODE_FLAG_FORBIDDEN: "本單元只提供橫式計算，不需要選擇其他表示模式。",
  G4B_U01_PRODUCTION_QUESTION_COUNT_INVALID: "題目數量必須介於 1 到 200 題。",
  G4B_U01_PRODUCTION_LIFECYCLE_INVALID: "此單元目前尚未完成公開列印準備。",
  G4B_U01_PRODUCTION_ALLOCATION_EMPTY: "請至少選擇一個可用的知識點與橫式題型。",
  G4B_U01_PRODUCTION_ALLOCATION_COUNT_INVALID: "題目配置無效，請重新產生。",
  G4B_U01_PRODUCTION_PATTERN_NOT_ELIGIBLE: "選取的題型目前尚未開放列印。",
  G4B_U01_PRODUCTION_GROUP_NOT_VISIBLE: "選取的橫式題型目前不可用。",
  G4B_U01_PRODUCTION_PATTERN_NOT_RESOLVED: "題型未正確連結到目前選擇。",
  G4B_U01_PRODUCTION_ALLOCATION_MISMATCH: "題目配置與題數不一致，請重新產生。",

  G4B_U01_CANONICAL_QUESTION_PHASE_INVALID: "題目尚未完成正式工作表轉換，請重新產生。",
  G4B_U01_CANONICAL_QUESTION_VISIBILITY_INVALID: "題目公開狀態無效，請重新產生。",
  G4B_U01_CANONICAL_QUESTION_PRODUCTION_USE_INVALID: "題目尚未核准用於公開列印。",
  G4B_U01_CANONICAL_QUESTION_PROMOTION_INVALID: "題目版本資料無效，請重新產生。",
  G4B_U01_CANONICAL_QUESTION_RESOLVER_PROVENANCE_INVALID: "題目來源連結無效，請重新選擇後產生。",
  G4B_U01_CANONICAL_QUESTION_ROUTE_INVALID: "題目路由資料無效，請重新產生。",
  G4B_U01_CANONICAL_QUESTION_REPRESENTATION_INVALID: "本單元只接受橫式純計算題。",
  G4B_U01_CANONICAL_QUESTION_RUNTIME_STATUS_INVALID: "題目工作表狀態無效，請重新產生。",
  G4B_U01_CANONICAL_QUESTION_ANSWER_INVALID: "題目或答案資料不完整，請重新產生。",

  G4B_U01_IDENTITY_MISMATCH: "題目不屬於目前的多位數乘除單元，請重新產生。",
  G4B_U01_NON_HORIZONTAL_REPRESENTATION: "本單元只接受單行橫式計算題。",
  G4B_U01_APPLICATION_TEXT_FORBIDDEN: "本單元目前不提供應用題。",
  G4B_U01_PATTERN_SPEC_SCOPE_MISMATCH: "題型與知識點不相符，請重新產生。",
  G4B_U01_OPERAND_RANGE_INVALID: "運算數超出本題型允許範圍，請重新產生。",
  G4B_U01_DIGIT_COUNT_INVALID: "運算數位數不符合本題型要求，請重新產生。",
  G4B_U01_MULTIPLICATION_RESULT_INVALID: "乘法答案不正確，請重新產生。",
  G4B_U01_RESULT_RANGE_INVALID: "計算結果超出本題型允許範圍，請重新產生。",
  G4B_U01_INTERNAL_ZERO_POSITION_INVALID: "乘數中間的 0 位置不符合題型要求。",
  G4B_U01_TRAILING_ZERO_ROLE_INVALID: "尾 0 所在位置不符合題型要求。",
  G4B_U01_POWER10_SCALING_INVALID: "尾 0 簡算的位值關係不正確。",
  G4B_U01_DIVISOR_ZERO: "除數不可為 0。",
  G4B_U01_DIVISION_IDENTITY_INVALID: "除法結果不符合被除數等於除數乘商再加餘數。",
  G4B_U01_QUOTIENT_RANGE_INVALID: "商超出本題型允許範圍。",
  G4B_U01_QUOTIENT_DIGIT_COUNT_INVALID: "商的位數不符合本題型要求。",
  G4B_U01_REMAINDER_NEGATIVE: "餘數不可小於 0。",
  G4B_U01_REMAINDER_NOT_LESS_THAN_DIVISOR: "餘數必須小於除數。",
  G4B_U01_EXACT_DIVISION_HAS_REMAINDER: "整除題的餘數必須為 0。",
  G4B_U01_REMAINDER_REQUIRED_BUT_ZERO: "此題型必須產生非 0 餘數。",
  G4B_U01_COMMON_TRAILING_ZERO_INVALID: "被除數與除數的共同尾 0 關係不正確。",
  G4B_U01_REDUCED_DIVISION_INVALID: "消去共同尾 0 後的除法關係不正確。",
  G4B_U01_REMAINDER_SCALE_NOT_RESTORED: "餘數尚未恢復成原題的位值。",
  G4B_U01_ANSWER_MODEL_INVALID: "答案格式與題型不一致，請重新產生。",
  G4B_U01_GENERIC_FALLBACK_FORBIDDEN: "本單元不可改用一般題型替代，請重新產生。",

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
