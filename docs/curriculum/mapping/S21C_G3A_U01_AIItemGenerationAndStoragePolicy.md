# S21C G3A U01 AI Item Generation and Storage Policy

## Document Status

- Task scope: documentation / policy only
- Production impact: no generator code, generated item JSON files, or worksheet assets are created by this task
- Purpose: define the formal policy layer between the S21B formal pattern mapping and any future AI-assisted or rule-based item generation for G3A U01 "1萬以內的數／數到1萬"
- Reference mapping: `S21B_G3A_U01_10000Numbers_FormalPatternMapping.md`
- Reference template: `S21A_G3A_U01_10000Numbers_PatternMapping_Template.md`
- Patch version: S21C1 — terminology tightening. Clarified answerStatus semantics (verified vs computed), production storage vs runtime generation, and storage policy wording.

---

## 1. Purpose

S21C is a **policy layer** positioned between the S21B formal pattern mapping and any future item generation work. It defines:

- The storage taxonomy for generated, curated, and literacy-fused items.
- The generation modes that may be used.
- The validation gates every item must pass before production storage.
- The rules governing AI-assisted item creation.
- The fusion rules for cross-skill items within G3A U01 scope.

This task does **not** generate production items. It does not create JSON item banks, implement validators, or produce worksheets. It establishes the policy that future generation work must follow.

---

## 2. Source Boundary

The S21B formal mapping provides the authoritative reference for this policy. Key source-boundary rules inherited from S21B:

| Rule | Source |
| --- | --- |
| `ExampleItem` entries are source evidence / sample / QA seed, not production item inventory. | S21B §8 |
| OCR-derived text is not an authority for source verification. Verification follows operator-provided visual verification notes. | S21B §Source PDF Access Note |
| A `QuestionPattern` is the future generator implementation unit; one pattern may produce many items. | S21B §7 |
| `sourceBacked` means the item is directly visible in the source PDF; `inferredExample` means it was derived from a pattern label. | S21B §8 taxonomy |
| Visual-dependent patterns (`numline_integer_reading`, `money_4digit_counting`) are `v1TextFallbackSupported` and do not have verified production answers. | S21B §7, §8 |

**Consequence for generation:** AI-generated or rule-based items must not bypass the verification gates described in this policy. An `ExampleItem` that is `to_be_verified` or `omitted_for_template` in S21B must not be promoted to a production `GeneratedItem` without completing the required validation and human review steps.

---

## 3. Item Taxonomy

Three storage categories are defined for AI-generated or curated items.

### 3.1 PatternSpec

A `PatternSpec` stores the **reusable pattern definition**: constraints, valid answer ranges, difficulty parameters, linked curriculum metadata, and a reference to one or more ExampleItems. It does not require storing thousands of concrete questions.

| Aspect | Meaning |
| --- | --- |
| **What it stores** | Pattern-level metadata: constraints, shapes, allowed ranges, linked KnowledgePoints, validation rules. |
| **When to create** | Once per `QuestionPattern` identified in S21B. |
| **Does it need JSON storage?** | Yes — one JSON document per pattern. |
| **Examples** | The `seq_4digit_place_step` pattern spec defines the allowed step sizes (1, 10, 100, 1000), direction (+/-), and range constraints for four-digit sequences. |

### 3.2 GeneratedItem

A `GeneratedItem` stores a **rule-based or AI-assisted concrete question** that has passed a deterministic validator. It is appropriate for number sense, place value, comparison, digit composition, number writing, and similar checkable items.

| Aspect | Meaning |
| --- | --- |
| **What it stores** | A single concrete question, its deterministic answer, and its provenance trace. |
| **When to create** | After a `PatternSpec` exists and a validator has confirmed correctness. |
| **Does it need JSON storage?** | Yes — but only for **production** items (item bank, benchmark set, QA seed set, curated worksheet source, or reusable LiteracyItem library). Drafts may exist in memory. Runtime worksheet-only generated items may be generated from PatternSpec + randomSeed without permanent GeneratedItem JSON storage. |
| **Examples** | "用 1、3、7、9 排成的四位數中，數字不重複，最大的是 □，最小的是 □。" with answer `{"max":9731,"min":1379}`. |

### 3.3 LiteracyItem

A `LiteracyItem` stores a **word problem, contextual question, or fused-skill item** that requires stricter review before production use. These items typically involve narrative context, combined skills, or human-judgment answers.

| Aspect | Meaning |
| --- | --- |
| **What it stores** | A contextual question combining multiple skills, a narrative wrapper, or a real-world scenario. |
| **When to create** | Only after deterministic validation and human review are both complete. |
| **Does it need JSON storage?** | Yes — but only after `human_reviewed` status is reached. |
| **Examples** | "小明有 55 個 10 元硬幣，他想換成 100 元鈔票，最多可以換幾張？還剩多少錢？" |

---

## 4. Generation Modes

| Mode | Description | Deterministic Answer? | Requires Validator? |
| --- | --- | --- | --- |
| `rule_based` | Items produced by deterministic code from a `PatternSpec`. | Yes | Yes — validator confirms range, shape, and correctness. |
| `ai_draft` | AI drafts a concrete item from a `PatternSpec` and an example. | No by default | Yes — validator must confirm the answer. |
| `ai_rewrite` | AI rewords an existing `GeneratedItem` without changing its mathematical structure. | Inherited from parent item | Yes — validator confirms no semantic drift. |
| `ai_literacy_fusion` | AI creates a contextual word problem combining approved linked patterns. | No by default | Yes — plus human review required. |
| `manual_curated` | A human writes an item directly. | Yes | Yes — validator confirms correctness; human review may be self-review. |

**Default preference for G3A U01:** `rule_based` generation is preferred for all deterministic patterns where answers can be computed exactly. This includes all patterns currently marked `v1NumberSenseSupported` in S21B. `ai_draft` may be used as a seeding step, but the output must pass the same validator.

---

## 5. Storage Decision Matrix

"Store concrete items?" means "store production concrete items"; it does not require permanent JSON storage for every runtime-generated worksheet item. See §5.1 for the distinction between production storage and runtime generation.

| Question family | Example patterns (S21B) | Allowed generation mode | Store concrete items? | Required validation | Human review required? | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Four-digit place value decomposition | `pv_4digit_decompose` | `rule_based`, `ai_draft` | Yes | Deterministic answer check; digit count validity; total equals decomposed parts | No | Answers are purely arithmetic. |
| Four-digit place value composition | `pv_4digit_compose` | `rule_based`, `ai_draft` | Yes | Deterministic answer check; zero-handling for missing places | No | Zero-handling edge case documented in S21B ExampleItem. |
| Number-to-Chinese reading/writing | `rw_4digit_number_to_chinese` | `rule_based`, `ai_draft` | Yes | Chinese reading consistency with Taiwan G3A convention; zero-reading rules | No | Follow Taiwan elementary usage in zh-Hant. |
| Chinese-to-number reading/writing | `rw_4digit_chinese_to_number` | `rule_based`, `ai_draft` | Yes | Numeric conversion correctness; valid four-digit range | No | Reverse direction of the above. |
| Digit meaning / zero reading | `rw_4digit_zero_reading` | `rule_based`, `ai_draft` | Yes | Internal zero handling; consecutive-zero reading rule (single 零) | No | Covered by reading/writing validator rules. |
| Digit arrangement max/min | `perm_4digit_max_min_from_digits` | `rule_based`, `ai_draft` | Yes | Leading zero not allowed for four-digit numbers; max/min correctness | No | Leading-zero rule documented in S21B. |
| Four-digit comparison | `cmp_4digit_compare` | `rule_based`, `ai_draft` | Yes | Comparison correctness; relational operator match | No | Also covers numeral-vs-Chinese-reading comparison items seen in source. |
| Sequence / skip-count / missing number | `seq_4digit_place_step`, `seq_between_two_numbers` | `rule_based`, `ai_draft` | Yes | Step consistency; blank positions valid; bounds within 10000 | No | Step size must be declared in PatternSpec. |
| Money representation / conversion | `money_4digit_payment` | `rule_based`, `ai_draft` | Yes | Money total consistency; exchange arithmetic correct | No | Verified text-fallback pattern. Remainder handling documented. |
| Money counting (visual diagram) | `money_4digit_counting` | `manual_curated`, `ai_draft` (text fallback only) | Conditional (text-fallback items only) | Money total correctness; no visual dependency unless textFallback is explicit | Yes — `human_reviewed` required before production | Visual panel answer to_be_verified; text-fallback items may proceed after review. |
| Number-line reading or movement | `numline_integer_reading` | `manual_curated`, `ai_draft` (text fallback only) | Conditional (text-fallback items only) | Integer position correctness; tick spacing valid | Yes — `human_reviewed` required before production | Visual answer omitted_for_template; text-fallback description may be created after review. |
| Literacy / contextual fusion items | (fused from above) | `ai_literacy_fusion`, `manual_curated` | Yes — after review | Deterministic answer check on composed math; no ambiguity in question | Yes — `human_reviewed` required | Must not mix future-domain skills. |

### 5.1 Production storage vs runtime generation

**Production storage** means the item is persisted as part of:

- An item bank (curated, reusable question inventory).
- A benchmark set (calibrated difficulty anchor items).
- A QA seed set (items used to validate generator output quality).
- A curated worksheet source (pre-authored items for a specific worksheet).
- A reusable `LiteracyItem` library (reviewed contextual/fused items).

**Runtime generation** means a worksheet item is generated temporarily from `PatternSpec` + `randomSeed` for immediate worksheet output and is not necessarily persisted as a `GeneratedItem` JSON document. Runtime items:

- Must still respect the `PatternSpec` constraints.
- Must still produce a deterministic correct answer.
- Are not required to have permanent JSON storage.
- Are not required to carry `answerStatus` metadata unless promoted to production storage.
- Must not be promoted to `verified` or `sourceBacked` without source evidence or human review.

The deterministic validator (V1–V12) applies to both production-stored items and runtime generated items. The difference is only whether the item is persisted.


## 6. Validation Status Model

### 6.1 Item validation status

| Status | Meaning | Allowed in production storage? |
| --- | --- | --- |
| `draft` | Item has been drafted but not validated. | No |
| `validator_passed` | Item has passed the deterministic validator. | Yes — for rule_based patterns. |
| `human_review_required` | Item requires human review before production. | No |
| `human_reviewed` | Item has passed human review. | Yes |
| `rejected` | Item failed validation or review and should not be used. | No |
| `deprecated` | Item was once production but has been retired. | No (kept for audit only) |

### 6.2 Answer status

| answerStatus | Meaning | Source |
| --- | --- | --- |
| `verified` | Answer has been confirmed by **source evidence** or **human review**. It does not mean ordinary deterministic generator output. | S21B §8 |
| `computed` | Answer was produced by **deterministic generator logic** and passed the deterministic validator. It is validator-derived, not source-derived. | S21C (new) |
| `to_be_verified` | Answer is believed correct but awaits confirmation (visual, human, or source). | S21B §8 |
| `omitted_for_template` | Answer is intentionally omitted; item serves as a format placeholder only. | S21B §8 |
| `not_applicable` | No answer is expected (e.g., open-ended discussion prompt). | S21B §8 |

**Key distinctions:**

- `computed` does **not** mean `sourceBacked`. It does **not** mean source-verified.
- `validator_passed` + `computed` is sufficient for deterministic `rule_based` `GeneratedItem` production storage when no human review is required.
- `verified` is reserved for source-backed answers or human-reviewed answers. Deterministic validation alone does not grant `verified`.
- AI-generated items may use `answerStatus = computed` only after deterministic validator pass. They must never use `verified` or `sourceBacked` unless explicitly confirmed by human review or source evidence.

---

## 7. Validator Requirements

The deterministic validator must check every `GeneratedItem` and `LiteracyItem` before it can be stored for production use.

| Check # | Requirement | Applies to |
| --- | --- | --- |
| V1 | Answer correctness: the declared answer must match the computed correct answer for the given prompt. | All items |
| V2 | Numeric range: values must be within `1` to `10000` inclusive, unless the pattern explicitly allows `0` (e.g., digit arrangement with `0` as a provided digit). | All numeric items |
| V3 | Digit count validity: four-digit numbers must have exactly 4 digits. Leading-zero numbers (e.g., `0123`) are not valid four-digit numbers unless the pattern explicitly allows digit strings with `0` as a position. | Place value, comparison, sequence |
| V4 | Chinese number reading consistency: Chinese wording must follow Taiwan G3A convention (`zh-Hant`). Internal zeroes must follow consecutive-zero-as-single-零 rule (e.g., `5003` → `五千零三`, not `五千零零三`). | Reading/writing patterns |
| V5 | Comparison correctness: the relational operator (`<`, `>`, `=`) must match the numeric comparison. Chinese-reading-vs-numeral comparisons must be normalized before checking. | Comparison patterns |
| V6 | Sequence rule consistency: step size, direction, and blank positions must follow the declared `PatternSpec`. Bounds must stay within `1`–`10000`. | Sequence patterns |
| V7 | Money total consistency: total value computed from denominations must match the expected answer. Exchange/remainder arithmetic must be correct. | Money patterns |
| V8 | Linked pattern IDs exist: every `linkedPatternId` must reference a valid `QuestionPattern` defined in S21B. | Fusion items |
| V9 | SupportStatus compatibility: an item must not claim `v1NumberSenseSupported` if its parent pattern is `v1TextFallbackSupported`. | All items |
| V10 | No unsupported visual dependency: visual items must have an explicit `textFallback` description or remain `to_be_verified` / `omitted_for_template`. | Number-line, money-visual |
| V11 | No future-domain leakage: the item must not introduce fractions, decimals, percentages, geometry, speed, area, volume, probability, algebra, or negative numbers. Scope is G3A U01 number sense within 10000. | All items |
| V12 | No ambiguity: the prompt must have exactly one correct answer. Multiple interpretations with different correct answers are not allowed for production items. | All items |

---

## 8. AI Usage Rules

### 8.1 AI may

| Operation | Conditions |
| --- | --- |
| Draft similar questions from an approved `PatternSpec` | Output tagged as `ai_draft`; must pass validator. |
| Rewrite wording without changing mathematical structure | Output tagged as `ai_rewrite`; parent item must exist; validator confirms no semantic drift. |
| Generate literacy-fusion drafts using approved `linkedPatterns` | Tagged as `ai_literacy_fusion`; `human_review_required` is mandatory. |
| Propose distractors for multiple-choice items | Distractors must be plausibly wrong; validator must confirm exactly one answer is correct and no distractor equals the correct answer. |
| Suggest additional `ExampleItem` candidates from existing patterns | These are drafts only; must not be stored as `sourceBacked` or `verified` without human review. |

### 8.2 AI must not

| Prohibition | Reason |
| --- | --- |
| Mark its own output as `sourceBacked` | Only items directly visible in the source PDF are `sourceBacked` (S21B taxonomy). |
| Mark `answerStatus` as `verified` without source evidence or human review | `verified` requires source evidence or human review (S21C1 §6.2). Deterministic validator alone does not grant `verified`. |
| Create production items directly from OCR | OCR is not an authority in this project (S21B2 policy). |
| Infer visual details not present in approved operator-provided verification notes | Source evidence must be traceable. |
| Mix unrelated future-domain skills | G3A U01 scope is number sense within 10000; fractions, decimals, geometry, etc. are out of scope. |
| Create items outside G3A U01 scope | Scope boundary is the S21B `CurriculumNode`. |
| Store ambiguous or multi-answer word problems as production items | All production items must have one unambiguous correct answer. |
| Bypass the `human_review_required` gate for visual, literacy, or fusion items | These item types require human judgment. |

---

## 9. Tag Fusion Rules

### 9.1 Fusion relation types

| Relation | Meaning | Example |
| --- | --- | --- |
| `sameUnit` | Patterns belong to the same curriculum unit (G3A U01). | All 12 S21B patterns. |
| `sameSkillFamily` | Patterns share a `CanonicalSkill`. | `pv_4digit_decompose` + `pv_4digit_compose` share `place_value`. |
| `prerequisite` | One skill is a prerequisite for another. | Place-value understanding is prerequisite to comparison within 10000. |
| `crossRepresentation` | Patterns use different representations of the same concept. | Numeral-vs-Chinese reading/writing pairs. |
| `textFallbackOnly` | Fusion is allowed only as text-described representations, not full visual. | Money counting + place value (text fallback only). |
| `futureOnly` | Reserved for skills not yet covered in G3A U01. Do not use in v1 generation. | — |

### 9.2 Allowed fusion examples

| Fusion | Relation | Rationale |
| --- | --- | --- |
| Place value decomposition + digit value | `sameUnit`, `sameSkillFamily` | Both are place-value skills; combining them creates richer items. |
| Number reading/writing + zero handling | `sameUnit`, `prerequisite` | Zero handling is a natural sub-skill of number reading. |
| Digit arrangement (max/min) + comparison | `sameUnit`, `crossRepresentation` | After finding max/min from digits, compare them. |
| Money representation (payment) + place value | `sameUnit`, `crossRepresentation` | Money exchange naturally involves place-value reasoning. |
| Sequence (place step) + place value | `sameUnit`, `sameSkillFamily` | Place-value step sequences explicitly use place-value concepts. |
| Between-numbers sequence + comparison | `sameUnit`, `sameSkillFamily` | Filling between-numbers requires understanding ordering. |

### 9.3 Disallowed fusion examples

| Proposed fusion | Reason disallowed |
| --- | --- |
| G3A U01 + fractions | Fractions are future domain; outside G3A U01 scope. |
| G3A U01 + decimals | Decimals are future domain. |
| G3A U01 + circle area | Geometry is outside G3A U01 number-sense scope. |
| G3A U01 + speed/distance/time | Multi-step word problems with rate are outside scope. |
| Visual money/image questions without verified text fallback | `money_4digit_counting` is `to_be_verified`; visual items must go through human review with text fallback. |
| Number-line visual questions promoted to production without verification | `numline_integer_reading` is `omitted_for_template`; text-fallback items require human review. |

---

## 10. JSON Shape Examples

These are **illustrative JSON examples only**. No actual JSON files are created by this task.

### 10.1 PatternSpec example

```json
{
  "patternId": "spec_seq_4digit_place_step",
  "curriculumNodeId": "g3a_u01_numbers_within_10000",
  "linkedQuestionPattern": "seq_4digit_place_step",
  "linkedKnowledgePoint": "kp_g3a_u01_place_sequence",
  "canonicalSkillIds": ["place_value_sequence", "number_ordering"],
  "difficultyTags": ["intermediate", "sequence_step"],
  "questionKind": "sequence",
  "supportStatus": "v1NumberSenseSupported",
  "summary": "Continue a sequence using place-value jumps from a starting number.",
  "constraints": {
    "startingRange": [1000, 9000],
    "allowedSteps": [1, 10, 100, 1000],
    "allowedDirections": ["forward", "backward"],
    "minResult": 1,
    "maxResult": 10000,
    "blankCount": { "min": 1, "max": 4 },
    "stepPerItem": "single"
  },
  "exampleItemRefs": ["ex_g3a_u01_p1_seq_001"],
  "generationMode": "rule_based",
  "provenance": {
    "source": "S21B_G3A_U01_10000Numbers_FormalPatternMapping",
    "extractionConfidence": "high"
  }
}
```

### 10.2 GeneratedItem example

```json
{
  "itemId": "gen_seq_4digit_place_step_002",
  "patternId": "spec_seq_4digit_place_step",
  "curriculumNodeId": "g3a_u01_numbers_within_10000",
  "linkedPatternIds": ["seq_4digit_place_step"],
  "canonicalSkillIds": ["place_value_sequence", "number_ordering"],
  "difficultyTags": ["intermediate", "sequence_step"],
  "questionKind": "sequence",
  "supportStatus": "v1NumberSenseSupported",
  "generationMode": "rule_based",
  "validationStatus": "validator_passed",
  "answerStatus": "computed",
  "prompt": "從 3456 開始，每次加 100，連續寫出接下來的三個數：□、□、□。",
  "answer": { "values": [3556, 3656, 3756], "step": 100 },
  "provenance": {
    "generatedFrom": "spec_seq_4digit_place_step",
    "validatorVersion": "v1.0",
    "generatedAt": "2026-07-01T00:00:00Z"
  }
}
```

### 10.3 LiteracyItem example

```json
{
  "itemId": "lit_fusion_place_money_001",
  "curriculumNodeId": "g3a_u01_numbers_within_10000",
  "linkedPatternIds": ["money_4digit_payment", "pv_4digit_decompose"],
  "canonicalSkillIds": ["money_representation", "number_decomposition"],
  "difficultyTags": ["intermediate", "representation_composition", "place_value_direct"],
  "questionKind": "representation_payment",
  "supportStatus": "v1TextFallbackSupported",
  "generationMode": "ai_literacy_fusion",
  "validationStatus": "human_reviewed",
  "answerStatus": "verified",
  "prompt": "小華存了 3760 元。她全部放在三個撲滿裡：第一個撲滿有 20 張 100 元，第二個撲滿有 35 個 10 元。第三個撲滿裡有多少元？",
  "answer": { "value": 1410, "unit": "元" },
  "provenance": {
    "fusedFromPatterns": ["money_4digit_payment", "pv_4digit_decompose"],
    "reviewedBy": "human",
    "reviewedAt": "2026-07-01T00:00:00Z"
  }
}
```

---

## 11. Production Gate

Before any concrete item can be stored for production use (e.g., in an item bank, worksheet generator input, or QA seed repository), all of the following gates must be satisfied:

| Gate # | Requirement | Status |
| --- | --- | --- |
| G1 | S21B formal mapping exists and S21C policy is approved. | S21B exists; S21C created by this task. |
| G2 | A `PatternSpec` exists for the target `QuestionPattern`. | To be created in future S21D/E tasks. |
| G3 | A deterministic validator exists and has been run on the item. | To be implemented in future S21D/E tasks. |
| G4 | The item has passed the validator (all V1–V12 checks). | Per-item check. |
| G5 | Human review is completed if the item requires it (visual, literacy, fusion, or to_be_verified source). | Per-item check. |
| G6 | The item does not violate source boundary rules (not falsely marked sourceBacked, not OCR-derived as authority). | Policy check. |
| G7 | The item does not leak future-domain skills (fractions, decimals, geometry, speed, etc.). | Scope check. |
| G8 | The item has exactly one unambiguous correct answer. | Ambiguity check. |

Items that fail any gate must not enter production storage. They may remain as drafts or be rejected.

---

## 12. Non-Goals

This task explicitly does **not**:

- Build the item generator.
- Generate item bank JSON files.
- Implement validator code.
- Create worksheets or worksheet templates.
- Run OCR or create OCR scripts.
- Edit source mapping facts in S21A or S21B.
- Convert visual `to_be_verified` or `omitted_for_template` examples into verified production items.
- Modify `src/`, `site/`, `tests/`, `package.json`, `package-lock.json`, schema files, deployment files, or generated worksheet output.
- Modify the source PDF.

---

## 13. Acceptance Criteria

The S21C document must:

- [x] Clearly separate `PatternSpec`, `GeneratedItem`, and `LiteracyItem` with distinct storage rules.
- [x] Define when JSON storage is required and when it is unnecessary (PatternSpec: one per pattern; GeneratedItem: after validation; LiteracyItem: after human review).
- [x] Define validator requirements (V1–V12) and human review gates.
- [x] Define AI allowed and prohibited operations.
- [x] Define tag fusion rules with allowed and disallowed examples.
- [x] Preserve source-boundary discipline from S21B (no OCR authority, ExampleItem ≠ production item).
- [x] Avoid treating ExampleItems as production items.
- [x] Keep G3A U01 scope within number sense / 10000 numbers.
- [x] Include JSON shape examples (illustrative only, no files created).
- [x] Include no generated production data files.

---

## Appendix A: Referenced S21B Patterns Summary

| QuestionPattern ID | QuestionKind | SupportStatus | answerStatus (S21B ExampleItem) |
| --- | --- | --- | --- |
| `pv_4digit_decompose` | `decompose` | `v1NumberSenseSupported` | `verified` |
| `pv_4digit_compose` | `compose` | `v1NumberSenseSupported` | `verified` |
| `rw_4digit_number_to_chinese` | `transcode` | `v1NumberSenseSupported` | `verified` |
| `rw_4digit_chinese_to_number` | `transcode` | `v1NumberSenseSupported` | `verified` |
| `rw_4digit_zero_reading` | `transcode` | `v1NumberSenseSupported` | `verified` |
| `seq_4digit_place_step` | `sequence` | `v1NumberSenseSupported` | `verified` |
| `seq_between_two_numbers` | `sequence` | `v1NumberSenseSupported` | `verified` |
| `cmp_4digit_compare` | `compare` | `v1NumberSenseSupported` | `verified` |
| `perm_4digit_max_min_from_digits` | `optimize_from_digits` | `v1NumberSenseSupported` | `verified` |
| `numline_integer_reading` | `visual_reading` | `v1TextFallbackSupported` | `omitted_for_template` |
| `money_4digit_counting` | `visual_reading` | `v1TextFallbackSupported` | `to_be_verified` |
| `money_4digit_payment` | `representation_payment` | `v1TextFallbackSupported` | `verified` |