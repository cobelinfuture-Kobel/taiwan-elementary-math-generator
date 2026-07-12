# S62 — G4B-U04 Manual PDF KnowledgePoint Extraction

```text
TASK = S62_G4B_U04_ManualPDFKnowledgePointExtraction
STATUS = PASS_MANUAL_VISUAL_EXTRACTION
SOURCE_ID = g4b_u04_4b04
SOURCE_TITLE = 概數
SOURCE_PAGES = 2
KNOWLEDGE_POINT_CANDIDATES = 12
```

## 1. Scope

This task manually reads the uploaded two-page PDF and extracts source-backed KnowledgePoint candidates.

```text
PDF visual evidence
→ KnowledgePoint candidate boundary
→ candidate tags / representations / answer models
```

It does not create FormalMapping, PatternSpec, generator, validator, selector, worksheet, or production promotion.

OCR is not source authority.

## 2. Source QA note

The uploaded filename and repository metadata identify:

```text
4B-U04 概數
```

The rendered page header displays:

```text
https://meow911.com/4b03/
```

This is retained as `source_header_url_unit_mismatch`. It does not change the sourceId because the filename, title and curriculum assignment consistently identify `g4b_u04_4b04`.

## 3. Extracted KnowledgePoints

### A. Concept and notation

| KP ID | KnowledgePoint | Evidence |
|---|---|---|
| `kp_g4b_u04_approximation_language_cues` | 概數語意關鍵詞與精確數辨識 | Page 1 top-left: 大約、大概、差不多、將近、接近 and daily-life statements. |
| `kp_g4b_u04_approximation_symbol_reading` | 約等號、近似符號與讀法 | Page 1 top-right: 約等號; 約等於 / 近似於. |
| `kp_g4b_u04_three_approximation_methods_compare` | 三種取概數方法的辨識與比較 | Page 1 second-row-left: 無條件捨去、無條件進入、四捨五入 using 753. |

### B. Direct numeric approximation

| KP ID | KnowledgePoint | Evidence |
|---|---|---|
| `kp_g4b_u04_unconditional_round_down` | 無條件捨去法取概數到指定數位 | Page 1 method comparison; Page 2 city population approximation. |
| `kp_g4b_u04_unconditional_round_up` | 無條件進入法取概數到指定數位 | Page 1 method comparison; Page 2 city population approximation. |
| `kp_g4b_u04_round_half_up_place_value` | 四捨五入到十位、百位、千位與萬位 | Page 1 bottom-right algorithm; Page 2 top-left multi-place examples. |

The four-rounding algorithm includes:

```text
identify retained place
→ inspect next digit
→ keep or carry
→ replace all lower places with zero
```

### C. Context-dependent method selection

| KP ID | KnowledgePoint | Evidence |
|---|---|---|
| `kp_g4b_u04_context_floor_ceiling_selection` | 依最多完整數量或最少需求選擇捨去與進入 | Page 1: orange boxes, hat containers, saving months. |
| `kp_g4b_u04_payment_denomination_ceiling` | 依鈔票面額決定取概數位置並用進入法付款 | Page 1: 7699-dollar price, thousand-dollar and hundred-dollar banknotes, insufficient-payment correction. |

The source distinguishes:

```text
最多完整盒數 / 袋數 → discard the remainder
最少需要盒數 / 月數 / 鈔票數 → include the remainder
```

### D. Approximation followed by operations

| KP ID | KnowledgePoint | Evidence |
|---|---|---|
| `kp_g4b_u04_round_then_add_subtract` | 先取概數再做大數加減估算 | Page 2 top-right: population difference and total after rounding to ten-thousands. |
| `kp_g4b_u04_round_then_multiply_divide` | 先取概數再做乘除估算 | Page 2 second row: six-year insurance estimate and five-person cost sharing. |

### E. Inverse rounding

| KP ID | KnowledgePoint | Evidence |
|---|---|---|
| `kp_g4b_u04_inverse_rounding_unknown_digit` | 已知四捨五入結果推回未知數字範圍 | Page 2 third row: `2□318 → 30000` and `47□61 → 47000`. |
| `kp_g4b_u04_inverse_rounding_possible_original` | 由近似值與部分數位推回可能原數 | Page 2 bottom-left: partial television price `4,□□99` rounds to about 45000 at the thousands place. |

## 4. Candidate implementation classes

```text
Class C deterministic / new runtime candidate = 8
Class D controlled semantic-template candidate = 4
```

Class C candidates:

- concept / notation classification;
- direct numeric rounding;
- inverse rounding constraints.

Class D candidates:

- maximum / minimum packaging and saving contexts;
- denomination-payment reasoning;
- round-then-add/subtract word problems;
- round-then-multiply/divide word problems.

These are candidate feasibility classes only. They are not production support declarations.

## 5. Data artifact

```text
data/curriculum/registry/g4b_u04_knowledge_point_candidates.json
```

Each row includes:

- source page and visual panel;
- source evidence summary;
- canonical-skill candidate;
- subskill, difficulty and representation tags;
- question-kind and answer-model candidates;
- implementation-class candidate.

## 6. Gate

```text
sourceId = g4b_u04_4b04
pageCount = 2
candidate rows = 12
unique KP IDs = 12
page 1 evidence = present
page 2 evidence = present
source anomaly = recorded
FormalMapping = not created
PatternSpec = not created
generator = not implemented
validator = not implemented
public selector = disabled
productionUse = forbidden
```

## 7. Distance and next step

```text
GOAL_DISTANCE_BEFORE = D4_G4B_U04_SOURCE_READY_VISUAL_REVIEW_PENDING
GOAL_DISTANCE_AFTER  = D3_G4B_U04_12_KNOWLEDGE_POINT_CANDIDATES_EXTRACTED
DISTANCE_REDUCED     = Converted the two-page source from a title-level Batch B node into 12 page-evidenced KnowledgePoint candidates.
REMAINING_BLOCKERS   = [
  "KnowledgePoint candidate QA and boundary normalization",
  "canonical tag and duplicate-boundary review",
  "FormalMapping not created"
]
NEXT_SHORTEST_STEP   = S63_G4B_U04_KnowledgePointCandidateMapQA
```
