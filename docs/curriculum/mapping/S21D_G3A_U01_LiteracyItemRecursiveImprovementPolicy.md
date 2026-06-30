# S21D G3A U01 LiteracyItem Recursive Improvement Policy

## Document Status

- Task scope: documentation / policy only
- Production impact: no generator code, generated item JSON files, worksheet assets, validator code, or recursive tooling are created by this task
- Purpose: define the lifecycle, gates, statuses, review requirements, and stopping rules for AI-assisted recursive improvement of G3A U01 LiteracyItems
- Reference policy: `S21C_G3A_U01_AIItemGenerationAndStoragePolicy.md` (S21C1 terminology tightening)
- Reference mapping: `S21B_G3A_U01_10000Numbers_FormalPatternMapping.md`

---

## 1. Purpose

S21D is a **policy layer for recursive improvement of LiteracyItems only**. It defines how contextual, word-problem, and fused-skill items within G3A U01 "1萬以內的數／數到1萬" may be iteratively refined by AI and human review, without weakening the source boundaries, answerStatus semantics, validator gates, or production-storage rules established in S21C/S21C1.

This task does **not**:

- Generate production LiteracyItems.
- Create item bank JSON.
- Implement recursive improvement tooling.
- Build the AI rewrite loop, validator, or human review UI.

It defines the governance that future tooling must follow.

---

## 2. Scope

### 2.1 Allowed scope

- Curriculum: G3A U01 "1萬以內的數／數到1萬"
- Domain: number sense within `10000`
- Item types: LiteracyItems that fuse approved S21B/S21C patterns
- Subtypes: contextual word problems, representation-fusion questions (e.g., money + place value), cross-skill scenarios using allowed fusion relations from S21C §9.2

### 2.2 Explicitly excluded

| Exclusion | Reason |
| --- | --- |
| Fractions, decimals, percentages | Future domain; outside G3A U01 scope. |
| Geometry, area, volume | Outside G3A U01 number-sense scope. |
| Speed, rate, time-distance problems | Outside scope. |
| Probability, statistics | Outside scope. |
| Algebra, variables, negative numbers | Outside scope. |
| Unsupported visual-only questions | Must have textFallback or remain gated (S21C V10). |
| OCR-derived production items | OCR is not authority (S21B2 policy). |

---

## 3. Dependency on S21C1

S21D inherits and must not weaken the following S21C1 rules:

| Rule | Source |
| --- | --- |
| `ExampleItem` is source evidence / sample / QA seed, not production inventory. | S21B §8 |
| OCR is not a source authority for verification. | S21B §Source PDF Access Note |
| AI cannot mark its own output as `sourceBacked`. | S21C §8.2 |
| AI cannot mark `answerStatus` as `verified` without source evidence or human review. | S21C1 §6.2 |
| `computed` is validator-derived, not source-derived. | S21C1 §6.2 |
| `verified` requires source evidence or human review. Deterministic validator alone does not grant `verified`. | S21C1 §6.2 |
| Runtime worksheet generation does not require permanent JSON storage. | S21C1 §5.1 |
| LiteracyItems require deterministic validation **plus** human review before production storage. | S21C §5 |
| Visual and textFallback patterns remain gated. | S21C V10, §5 |
| Tag fusion must follow S21C §9 fusion relation rules and allowed/disallowed examples. | S21C §9 |

Any S21D rule that conflicts with these inherited rules is invalid. S21D is an extension, not a replacement.

---

## 4. LiteracyItem Recursive Improvement Lifecycle

### 4.1 Lifecycle states

| State | Meaning | Who sets? |
| --- | --- | --- |
| `candidate_draft` | Initial LiteracyItem draft from AI or human. | AI / human |
| `math_extracted` | Mathematical structure has been extracted from the item. | System extractor |
| `validator_failed` | Item failed one or more deterministic validator checks. | Validator |
| `validator_passed` | Initial draft passed all deterministic validator checks. | Validator |
| `human_review_required` | Item needs human review before proceeding. | System |
| `revision_requested` | Human reviewer requested one or more revisions. | Human reviewer |
| `revised_draft` | AI or human has submitted a revised version. | AI / human |
| `revalidated` | Revised item has passed deterministic validation after revision. | Validator |
| `human_reviewed` | Human reviewer has approved the item. | Human reviewer |
| `production_candidate` | Item is ready for production storage after all gates pass. | System |
| `rejected` | Item is permanently blocked from production. | Validator or human |
| `deprecated` | Item was once production but has been retired. | System / human |

### 4.2 Lifecycle diagram

**Initial validation path:**

```text
candidate_draft
  → math_extracted
    → validator_passed
      → human_review_required
        → human_reviewed
          → production_candidate
        → revision_requested
          → revised_draft
            → math_extracted
              → revalidated
                → human_review_required
                  → human_reviewed
                    → production_candidate
    → validator_failed
      → revision_requested
        → revised_draft
          → math_extracted
            → revalidated OR validator_failed
      → rejected
  → rejected
```

**Key distinctions:**

- `validator_passed` = first successful validation of an initial draft.
- `revalidated` = successful validation after a revision. It is a distinct state.
- `revalidated` is success-only. It must not be used as an intermediate state before failure.
- A failed post-revision validation transitions from `math_extracted` directly to `validator_failed`.
- Both `validator_passed` and `revalidated` are validator-derived; neither grants `verified`.
- LiteracyItems still require human review regardless of whether the item arrived via `validator_passed` or `revalidated`.
- `revalidated` → `production_candidate` is disallowed without human review.
- `candidate_draft` → `production_candidate` is a disallowed direct transition.

---

## 5. Recursive Improvement Loop

One complete improvement cycle consists of:

| Step | Actor | Description |
| --- | --- | --- |
| 1 | AI or human | Produces a candidate `LiteracyItem`. |
| 2 | System | Extracts mathematical structure from the item text. |
| 3 | Validator | Checks deterministic answer correctness and scope (V1–V12, L1–L10). |
| 4 | Human reviewer | Reviews clarity, age-appropriateness, wording, context, and ambiguity against the rubric (§9). |
| 5 | Human reviewer | If issues are found, writes structured revision notes (§10). |
| 6 | AI | Rewrites only the failed aspects per revision notes. Must preserve math unless explicitly allowed to change it. |
| 7 | System | Re-extracts math from the revised item. |
| 8 | Validator | Re-validates the revised item. |
| 9 | Human reviewer | Re-reviews the item. |
| 10 | System | If all gates pass, item may become `production_candidate`. If failure limits are exceeded, item becomes `rejected`. |

The loop terminates when:

- `human_reviewed` + `production_candidate` is reached, OR
- Failure limits are exceeded and the item becomes `rejected`, OR
- A boundary violation is detected and the item becomes immediate `rejected`.

---

## 6. Maximum Iteration Policy

Recursive improvement is not infinite. The following stopping rules apply per item:

| Rule | Limit | Consequence if exceeded |
| --- | --- | --- |
| `maxRevisionRounds` | **3** | Item is `rejected`. |
| `maxValidatorFailures` | **2** | Item is `rejected`. |
| `maxHumanReviewFailures` | **2** | Item is `rejected`. |
| `maxSemanticDriftEvents` | **1** | Item is `rejected`. Semantic drift after a rewrite that was not explicitly requested. |
| Future-domain leakage minor | **First occurrence** | `revision_requested` — must be removed in the next revision. |
| Future-domain leakage minor | **Second occurrence** | `rejected` — repeated or unremoved minor leakage. |
| Future-domain leakage substantive | **Any occurrence** | Immediate `rejected` — no revision under the same `itemId`. |
| Ambiguous answer after revision round 2 | **Any occurrence** | `rejected` — ambiguity must be resolved by round 2. |
| Unsupported visual dependency | **Any occurrence** | `human_review_required` or `rejected` depending on whether a textFallback exists. |
| Source-boundary violation | **Any occurrence** | Immediate `rejected`. |

### 6.1 Future-domain leakage classification

#### A. `future_domain_leakage_minor`

A non-essential wording or background issue that does **not** affect the mathematical structure and can be removed without changing the item's `linkedPatternIds`, answer, operation, unit, or difficulty band.

| Example | Why it is minor |
| --- | --- |
| A decorative phrase mentions a "circle sticker," but no geometry is required to solve. | Circle is cosmetic; no area or perimeter calculation is required. |
| A context word hints at time or shape, but the solution does not depend on it. | Context is decorative; math is unchanged. |
| A single removable word introduces an out-of-scope concept. | It can be removed without affecting the answer. |

**Consequence:** `revision_requested` on first occurrence. It must be removed in the next revision. If it appears again after one revision, the item is `rejected`.

#### B. `future_domain_leakage_substantive`

The item's mathematical structure, answer derivation, operation, or required knowledge depends on a future-domain skill.

| Example | Why it is substantive |
| --- | --- |
| Fractions such as `2/5` in a calculation. | Requires fraction arithmetic outside G3A U01. |
| Decimals such as `3.5 元`. | Requires decimal understanding. |
| Geometry formula or area calculation. | Requires geometry. |
| Speed, rate, or time-distance calculation. | Requires rate reasoning. |
| Percentage. | Requires percentage understanding. |
| Algebraic unknowns beyond fill-in-the-blank arithmetic. | Requires variable manipulation. |
| Negative numbers. | Outside G3A U01 scope. |

**Consequence:** Immediate `rejected`. No recursive repair is allowed under the same `itemId`. The idea may only be resubmitted as a new `candidate_draft` with a new `itemId` if fully redesigned to remove the substantive dependency.

Once an item is `rejected`, it must not re-enter the improvement loop unless it is submitted as a genuinely new `candidate_draft` with a new `itemId`. A rejected item's `itemId` must not be reused.

---

## 7. Math Extraction Requirements

Before validation, each `LiteracyItem` must be decomposed into a structured math model by the extraction system.

### 7.1 Required extracted fields

All 15 fields are required for production-candidate LiteracyItems.

| Field | Description | Example |
| --- | --- | --- |
| `itemId` | Stable identifier for this LiteracyItem. | `lit_fusion_place_money_001` |
| `curriculumNodeId` | Curriculum node. | `g3a_u01_numbers_within_10000` |
| `linkedPatternIds` | S21B QuestionPattern IDs used. | `["money_4digit_payment", "pv_4digit_decompose"]` |
| `canonicalSkillIds` | Canonical skills involved. | `["money_representation", "number_decomposition"]` |
| `questionKind` | Interaction style. | `representation_payment` |
| `supportStatus` | Implementation support level. | `v1TextFallbackSupported` |
| `storyContext` | Brief description of the narrative context. | `Saving money in three piggy banks` |
| `quantities` | All numeric quantities and their units extracted from the text. | `[{ "value": 3760, "unit": "元" }, { "value": 20, "unit": "張100元" }, { "value": 35, "unit": "個10元" }]` |
| `operations` | Mathematical operations required to solve. | `["subtraction", "multiplication"]` |
| `expectedAnswer` | The deterministic correct answer. | `{ "value": 1410, "unit": "元" }` |
| `unit` | Primary unit of the answer. | `元` |
| `hiddenAssumptions` | Any assumptions a G3A student must make. | `[]` or `["100元鈔票面額為100元"]` |
| `answerDerivation` | Step-by-step derivation of the answer. | `3760 - (20×100 + 35×10) = 3760 - 2350 = 1410` |
| `validatorHooks` | Which validator checks apply. | `["V1", "V2", "V7", "V8", "V12", "L1", "L2", "L3", "L6"]` |
| `difficultyTags` | Difficulty tag IDs. | `["intermediate", "representation_composition", "place_value_direct"]` |

### 7.2 Extraction failure rule

If any required field cannot be extracted, for example because the answer derivation is ambiguous, a quantity is missing, or the linked pattern cannot be determined, the item must **not** proceed to the validator. It must return to `candidate_draft` with extraction failure notes, or be `rejected` if the failure is fundamental.

---

## 8. Validator Requirements for LiteracyItems

All S21C validator checks V1–V12 apply to LiteracyItems. In addition, the following LiteracyItem-specific checks apply:

| Check # | Requirement | Applies to |
| --- | --- | --- |
| L1 | **Story context must not change the mathematical answer.** The narrative wrapper may add context but must not alter the computed result. | All LiteracyItems |
| L2 | **All quantities must be explicit or inferable.** A G3A student must be able to identify every number needed. No hidden quantities from general knowledge. | All LiteracyItems |
| L3 | **Exactly one correct answer.** The item must have a single unambiguous answer. Multiple valid interpretations = fail. | All LiteracyItems |
| L4 | **Units must be consistent.** All quantities and the answer must use consistent or clearly converted units. | Money, measurement contexts |
| L5 | **Wording must not require knowledge outside G3A U01.** Vocabulary and context must be accessible to a G3A student. | All LiteracyItems |
| L6 | **linkedPatternIds must match the actual math used.** If the item uses subtraction and place-value decomposition, both patterns must be listed. No unused patterns, no missing patterns. | All LiteracyItems |
| L7 | **No hidden operation may exceed G3A U01 scope.** The item may use only operations appropriate for numbers within 10000. | All LiteracyItems |
| L8 | **Visual dependency must be textFallback-supported or reviewed.** If the item references a diagram, image, or visual, it must either have an explicit textFallback or remain `human_review_required`. | Visual or money-diagram contexts |
| L9 | **Answer derivation must be reproducible.** The step-by-step derivation must yield the same answer every time. | All LiteracyItems |
| L10 | **AI-rewritten wording must preserve the extracted math model.** After an AI rewrite, re-extraction must produce the same math model unless the reviewer explicitly requested a math change. | Revised items |

---

## 9. Human Review Rubric

Every LiteracyItem must pass human review before becoming `production_candidate`. The reviewer evaluates the item against the following categories.

| Category | Description | Possible verdicts |
| --- | --- | --- |
| Mathematical correctness | The answer and derivation are correct. | `pass`, `revise`, `fail` |
| Age appropriateness | The context, vocabulary, and sentence complexity fit a G3A student. | `pass`, `revise` |
| Wording clarity | The prompt is clear, unambiguous, and grammatically correct zh-Hant. | `pass`, `revise` |
| Context realism | The story context is plausible and not distracting. | `pass`, `revise` |
| Answer uniqueness | Only one correct answer exists; no plausible alternative interpretation exists. | `pass`, `fail` |
| Curriculum fit | The item fits G3A U01 scope; no future-domain skills. | `pass`, `fail` |
| Tag accuracy | `difficultyTags` and linked pattern IDs match the item content. | `pass`, `revise` |
| Difficulty appropriateness | The item difficulty is appropriate for its intended use within G3A U01. | `pass`, `revise` |
| Unit consistency | All units are consistent and correctly labeled. | `pass`, `revise` |
| No future-domain leakage | No fractions, decimals, geometry, speed, probability, algebra, or negative numbers. | `pass`, `fail` |
| No unsupported visual dependency | Visual references have textFallback or are documented as gated. | `pass`, `fail` |
| No source-boundary violation | Item is not falsely marked sourceBacked; not OCR-derived as authority. | `pass`, `fail` |

### 9.1 Verdict meanings

| Verdict | Meaning |
| --- | --- |
| `pass` | Category is satisfactory. |
| `revise` | Specific improvements are needed; item can be revised and re-reviewed. |
| `fail` | Category is fundamentally broken. If `fail` occurs in answer uniqueness, curriculum fit, future-domain leakage, unsupported visual dependency, or source-boundary violation, the item is blocked from production. |

### 9.2 Blocking categories

Any `fail` verdict in these categories blocks production immediately:

- Answer uniqueness
- Curriculum fit
- No future-domain leakage
- No unsupported visual dependency
- No source-boundary violation

If any blocking category fails, the item must not become `production_candidate`. It may be `revision_requested` if the failure is fixable, or `rejected` if unfixable.

---

## 10. Revision Note Schema

When a human reviewer requests revisions, they must provide structured revision notes. AI revision must follow these notes.

### 10.1 Schema

```json
{
  "reviewStatus": "revision_requested",
  "failedCategories": ["wording_clarity", "answer_uniqueness"],
  "revisionInstructions": [
    "Make the quantities explicit by adding unit labels to each number.",
    "Do not change linkedPatternIds.",
    "Keep the total within 10000."
  ],
  "mustPreserve": {
    "linkedPatternIds": ["money_4digit_payment", "pv_4digit_decompose"],
    "answer": { "value": 1410, "unit": "元" },
    "operations": ["subtraction", "multiplication"]
  },
  "mayChange": [
    "storyContext",
    "wording"
  ],
  "mustAvoid": [
    "fractions",
    "decimals",
    "geometry",
    "visual-only references",
    "changing the answer",
    "adding new operations"
  ]
}
```

### 10.2 Rules for AI following revision notes

- AI must address every item in `revisionInstructions`.
- AI must not change anything in `mustPreserve`.
- AI may only change fields listed in `mayChange`.
- AI must avoid every item in `mustAvoid`.
- If AI cannot satisfy a revision instruction without violating `mustPreserve` or `mustAvoid`, it must report the conflict and not produce a revision.

---

## 11. Semantic Drift Control

### 11.1 Definition of semantic drift

Semantic drift is any unintended change to the mathematical identity of a LiteracyItem during revision. It is tracked across revision rounds.

### 11.2 Protected fields

Any change to these fields without explicit reviewer permission is semantic drift:

| Field | Example of drift |
| --- | --- |
| `linkedPatternIds` | Changing from `["money_4digit_payment"]` to `["cmp_4digit_compare"]` |
| Required operations | Adding multiplication where only subtraction was present |
| `answer` | Changing the expected numeric answer |
| `unit` | Changing from `元` to `張` |
| Difficulty band | Shifting from `intermediate` to `basic` without intent |
| Scope / `curriculumNodeId` | Moving outside G3A U01 |
| `supportStatus` | Changing from `v1TextFallbackSupported` to `v1NumberSenseSupported` |
| Visual dependency | Adding a visual reference that was not present |

### 11.3 Allowed changes

| Change | Example |
| --- | --- |
| Wording simplification | "小華存了錢" → "小華有 3760 元" |
| Context replacement with same math | Piggy bank → school supplies budget |
| Clearer quantity ordering | Reordering numbers for readability |
| Removal of ambiguity | Adding explicit units to previously ambiguous values |
| Grade-appropriate vocabulary adjustment | Replacing an uncommon word with a common synonym |

### 11.4 Drift detection and consequences

| Drift event | Consequence |
| --- | --- |
| First occurrence | Item returns to `revision_requested` with drift noted. The round does **not** count toward `maxRevisionRounds` if the drift was clearly unintentional. |
| Second occurrence | Item is `rejected`. Drift events exceeding `maxSemanticDriftEvents` (1) trigger rejection. |
| Intentional math change by reviewer | Not counted as drift if the reviewer explicitly authorized it in revision notes. |

### 11.5 Distinction from future-domain leakage

Semantic drift and future-domain leakage are separate concerns:

| Concern | Definition | Detection |
| --- | --- | --- |
| Semantic drift | Unintended change to the item's mathematical identity during revision, such as linked patterns, answer, operations, unit, or scope. | Detected by comparing pre-revision and post-revision math models. |
| Future-domain leakage | Out-of-scope content or skills introduced in the item, such as fractions, decimals, geometry, or speed. | Detected by validator V11 or human review. |

A single revision can trigger both semantic drift and future-domain leakage. When both occur:

- The stricter consequence applies.
- If the leakage is substantive, immediate `rejected` takes precedence over drift handling.
- If the leakage is minor and drift is also present, both must be addressed in the next revision; failure to resolve either = `rejected`.

---

## 12. Status Transition Rules

### 12.1 Allowed transitions

| From | To | Condition |
| --- | --- | --- |
| `candidate_draft` | `math_extracted` | Extraction system succeeds. |
| `math_extracted` | `validator_passed` | All V1–V12 and L1–L10 checks pass on an initial draft. |
| `math_extracted` | `validator_failed` | One or more checks fail. |
| `validator_failed` | `revision_requested` | Human reviewer decides to allow revision. |
| `validator_failed` | `rejected` | Failure limits exceeded, or failure is unfixable. |
| `validator_passed` | `human_review_required` | Automatic; LiteracyItem cannot skip human review. |
| `human_review_required` | `revision_requested` | Human reviewer finds issues. |
| `human_review_required` | `human_reviewed` | Human reviewer approves all categories. |
| `revision_requested` | `revised_draft` | AI or human submits revised item. |
| `revised_draft` | `math_extracted` | Re-extraction succeeds. |
| `math_extracted` (revised item) | `revalidated` | All V1–V12 and L1–L10 checks pass on a revised item. If the item is an initial draft, use `validator_passed` instead. |
| `math_extracted` (revised item) | `validator_failed` | One or more V1–V12 or L1–L10 checks fail on a revised item. |
| `revalidated` | `human_review_required` | Automatic; LiteracyItem cannot skip human review even after revalidation. |
| `human_reviewed` | `production_candidate` | All production gates G1–G8 pass. |
| `production_candidate` | `deprecated` | Item retired for policy, quality, or curriculum reasons. |
| Any non-final state | `rejected` | Boundary violation, unfixable failure, or limit exceeded. |

### 12.2 Disallowed transitions

| Transition | Reason disallowed |
| --- | --- |
| `candidate_draft` → `production_candidate` | Must pass validator and human review. |
| `validator_failed` → `production_candidate` | Must pass validator first. |
| `revision_requested` → `production_candidate` | Must be revised, revalidated, and re-reviewed. |
| `validator_passed` → `production_candidate` | LiteracyItem must also pass human review. |
| `revalidated` → `production_candidate` | LiteracyItem must also pass human review after revalidation. |
| `revised_draft` → `production_candidate` | Must be re-extracted, revalidated, and re-reviewed. |
| `math_extracted` → `production_candidate` | Must pass validator and human review first. |
| `validator_passed` → `verified` | `verified` requires human review or source evidence. Validator alone does not grant `verified`. |
| `revalidated` → `verified` | `verified` requires human review or source evidence. Revalidation restores `computed`, not `verified`. |
| `computed` → `verified` by AI alone | `verified` requires human review or source evidence. |
| `computed` → `sourceBacked` | Only source-visible items are `sourceBacked` under S21B taxonomy. |
| Runtime generated → `verified` without human review/source evidence | `verified` requires external confirmation. |

### 12.3 Revalidation note

- Initial draft success path: `math_extracted` → `validator_passed`.
- Initial draft failure path: `math_extracted` → `validator_failed`.
- Revised item success path: `math_extracted` (revised item) → `revalidated`.
- Revised item failure path: `math_extracted` (revised item) → `validator_failed`.
- `revalidated` is success-only and does not grant `verified`.
- Revalidation restores `computed`, not `verified`.
- After `revalidated`, the item still must transition to `human_review_required` before `human_reviewed` or `production_candidate`.

---

## 13. AnswerStatus Rules for Recursive Improvement

### 13.1 Status assignment rules

| Condition | Allowed answerStatus | Who assigns? |
| --- | --- | --- |
| Draft LiteracyItem, no validator run | `to_be_verified` | AI or human as draft |
| Draft LiteracyItem, validator run and passed | `computed` | Validator |
| Validator run and passed, human review not yet done | `computed` | Validator |
| Validator passed + human review passed | `verified` | Human reviewer after review |
| Item is source-backed and visible in source PDF | `verified` | Human reviewer + source evidence |
| Visual panel item, answer not deterministically extractable | `to_be_verified` or `omitted_for_template` | Human reviewer |
| AI draft without any validation | `to_be_verified` draft only | System default |

### 13.2 Status downgrade rules

| Event | Consequence |
| --- | --- |
| Item is revised and content changes | Prior `computed` is lost; must re-validate. Prior `verified` is lost unless revision is metadata-only. |
| Revision is metadata-only, such as tag fix or typo in notes | Prior `verified` may be retained if reviewer confirms no answer change. |
| Drift detected after revision | `computed` and `verified` are both lost; item returns to `math_extracted` or `revision_requested`. |

### 13.3 AI restrictions

- AI must never assign `verified`.
- AI must never assign `sourceBacked`.
- AI may assign `to_be_verified` as an initial draft status only.

---

## 14. Production Candidate Requirements

A LiteracyItem may become `production_candidate` only when **all** of these conditions are met:

| # | Requirement | Checked by |
| --- | --- | --- |
| 1 | `linkedPatternIds` are valid S21B QuestionPattern IDs. | Validator V8 |
| 2 | Math extraction succeeded with all required fields present. | System |
| 3 | Validator passed: V1–V12 + L1–L10 all green. | Validator |
| 4 | Human review passed — no blocking category failures. | Human reviewer |
| 5 | `answerStatus` is `verified` after human review. | Human reviewer |
| 6 | No future-domain leakage exists. | Validator V11 + human |
| 7 | No unsupported visual dependency exists. | Validator V10, L8 + human |
| 8 | Provenance records all revision rounds. | System |
| 9 | The final item has exactly one unambiguous answer. | Validator V12, L3 + human |
| 10 | The final item respects G3A U01 number sense within 10000. | Validator V2, V11 |

If any condition is not met, the item remains in its current non-final state.

---

## 15. Provenance and Audit Trail

Every LiteracyItem must carry a complete provenance record. Recursive improvement must be auditable. Prior versions must not be silently overwritten.

### 15.1 Required provenance fields

| Field | Description | Example |
| --- | --- | --- |
| `createdBy` | Who created the initial draft. | `ai_draft` or `human:reviewer_name` |
| `generationMode` | The mode used for initial creation. | `ai_literacy_fusion` |
| `sourcePolicyVersion` | The policy version active at creation. | `S21C1` |
| `parentPatternIds` | S21B QuestionPattern IDs fused. | `["money_4digit_payment", "pv_4digit_decompose"]` |
| `revisionRound` | Current revision round number, where 0 = initial. | `2` |
| `priorItemId` | The `itemId` of the previous version, if this is a revision. | `lit_fusion_place_money_001_r1` |
| `reviewerNotes` | Structured revision notes from the most recent review. | JSON per §10 |
| `validatorVersion` | Version identifier of the validator used. | `v1.0` |
| `validatorResult` | Summary of validator pass/fail with check details. | `{ "passed": true, "failedChecks": [] }` |
| `humanReviewer` | Identifier of the human reviewer. | `reviewer_name` |
| `humanReviewResult` | Summary of human review per rubric categories. | `{ "status": "pass", "categories": {} }` |
| `statusHistory` | Ordered list of all status transitions with timestamps. | `[{ "from": "candidate_draft", "to": "math_extracted", "at": "..." }]` |
| `rejectedReason` | Reason for rejection if `rejected`. | `maxValidatorFailures exceeded: L3 ambiguity` |
| `deprecatedReason` | Reason for deprecation if `deprecated`. | `Curriculum mapping update invalidated answer convention` |

### 15.2 Versioning

Each revision round produces a new version of the item. The system must retain all prior versions for audit. The `itemId` may carry a revision suffix such as `_r0`, `_r1`, `_r2`, or the provenance must link prior versions via `priorItemId`.

---

## 16. Rejection and Deprecation Rules

### 16.1 Immediate rejection triggers

The item must be immediately `rejected` when:

| # | Trigger |
| --- | --- |
| R1 | Substantive future-domain leakage, such as fractions, decimals, geometry, speed, probability, algebra, or negative numbers as required skills. Minor leakage is `revision_requested` once; repeated minor leakage or failure to remove it = `rejected` (see §6.1). |
| R2 | No unique answer — prompt is fundamentally ambiguous. |
| R3 | Unsupported visual dependency with no textFallback path. |
| R4 | False claim of `sourceBacked`. |
| R5 | OCR-derived production claim. |
| R6 | Answer cannot be validated, for example because it depends on unknown external data. |
| R7 | `linkedPatternIds` do not match item content and cannot be reconciled. |
| R8 | `maxValidatorFailures` exceeded: 2. |
| R9 | `maxHumanReviewFailures` exceeded: 2. |
| R10 | `maxRevisionRounds` exceeded: 3. |
| R11 | `maxSemanticDriftEvents` exceeded: 1. |

### 16.2 Deprecation triggers

An item that was previously `production_candidate` may be deprecated when:

| # | Trigger |
| --- | --- |
| D1 | A later validator update reveals a previously undetected error. |
| D2 | Curriculum mapping changes, for example an S21B update changes a pattern definition. |
| D3 | Item is found ambiguous after production use. |
| D4 | Tag mismatch is discovered, such as wrong difficulty tag or wrong linked pattern. |
| D5 | Answer convention changed, such as a Chinese reading rule update. |
| D6 | Item is a near-duplicate of a higher-quality item. |

Deprecated items must not be served to new worksheets. They may be retained for audit.

---

## 17. Examples

These are **illustrative examples only**. No actual item JSON files are created.

### 17.1 Example A: Valid recursive improvement

**Round 0 — candidate_draft:**

> 小華有錢，她放了一些在撲滿裡，還剩多少？

- Math extraction: **fails** — quantities are not explicit.
- State: `math_extracted` → `validator_failed` (L2).

**Round 1 — revised_draft with human revision notes applied:**

> 小華存了 3760 元。她把 20 張 100 元和 35 個 10 元放進兩個撲滿。第三個撲滿裡有多少元？

- Math extraction: **succeeds**.
- Validator: **passes** (V1, V2, V7, V8, V12, L1–L10).
- Human review: **revision_requested** — wording could be clearer because "放進兩個撲滿" does not clearly describe all three piggy banks.

**Round 2 — revised_draft:**

> 小華存了 3760 元。她全部放在三個撲滿裡：第一個撲滿有 20 張 100 元，第二個撲滿有 35 個 10 元。第三個撲滿裡有多少元？

- Math extraction: **succeeds** with the same math model.
- Validator: **passes**.
- Human review: **human_reviewed** — all categories pass.
- State: `production_candidate`.

### 17.2 Example B: Rejected — future-domain leakage

**candidate_draft:**

> 小華有 3760 元，她花了 2/5 買書，還剩多少元？

- Math extraction: succeeds but detects fraction operation.
- Validator: **fails** V11 — future-domain leakage, fractions.
- This is a substantive future-domain leakage.
- Immediate `rejected` (R1).
- No revision is allowed under the same `itemId`.

### 17.3 Example C: Semantic drift — rejected

**Round 0 — original human_reviewed item:**

> 小明有 55 個 10 元硬幣，他想換成 100 元鈔票，最多可以換幾張？還剩多少錢？

- Answer: `{ "hundred_bills": 5, "remainder_value": 50 }`

**Round 1 — AI rewrite without human instruction to change answer structure:**

> 小明有 55 個 10 元硬幣，他想換成 100 元鈔票，最多可以換幾張？

- Answer changed to: `5`
- The remainder part was removed.
- Math model changed: `remainder_value` removed.
- **Semantic drift detected** — answer structure changed without reviewer permission.
- `maxSemanticDriftEvents` exceeded.
- Immediate `rejected` (R11).

---

## 18. Non-Goals

This task explicitly does **not**:

- Generate production LiteracyItems.
- Create item bank JSON files.
- Implement the validator or math extraction system.
- Implement the AI rewrite loop.
- Create a human review UI.
- Create worksheets or worksheet templates.
- Inspect PDFs or run OCR.
- Change S21B mapping facts.
- Change S21C/S21C1 terminology or policy rules.
- Promote visual `to_be_verified` or `omitted_for_template` items to verified production items.
- Modify `src/`, `site/`, `tests/`, `package.json`, `package-lock.json`, schema files, deployment files, or generated worksheet output.

---

## 19. Acceptance Criteria

The S21D document must:

- [x] Define a complete recursive-improvement lifecycle with 12 states.
- [x] Preserve S21C1 `verified` / `computed` distinction and all inherited rules.
- [x] Preserve S21C1 production storage / runtime generation distinction.
- [x] Define maximum revision: 3 rounds.
- [x] Define maximum validator failures: 2.
- [x] Define maximum human review failures: 2.
- [x] Define maximum semantic drift events: 1.
- [x] Define math extraction requirements with 15 required extracted fields.
- [x] Define 10 LiteracyItem-specific validator checks (L1–L10) in addition to V1–V12.
- [x] Define a 12-category human review rubric with blocking categories.
- [x] Define a structured revision note schema with `mustPreserve`, `mayChange`, and `mustAvoid`.
- [x] Define semantic drift control with 8 protected fields and 5 allowed change types.
- [x] Define complete status transition table with allowed and disallowed transitions.
- [x] Define answerStatus rules for each lifecycle state and status downgrade rules.
- [x] Define 10 production candidate requirements.
- [x] Define provenance and audit trail with required fields.
- [x] Define 11 immediate rejection triggers and 6 deprecation triggers.
- [x] Include 3 illustrative examples: valid improvement, rejected leakage, rejected drift.
- [x] Create no production item data.
- [x] Modify no code.

---

## Appendix A: Reference — S21C1 Key Rules Inherited

| Rule ID | Rule | Source |
| --- | --- | --- |
| A1 | `verified` = source evidence or human review. Deterministic validator alone does not grant `verified`. | S21C1 §6.2 |
| A2 | `computed` = deterministic generator logic + validator pass. Validator-derived, not source-derived. | S21C1 §6.2 |
| A3 | AI must not mark `verified` without source evidence or human review. | S21C1 §8.2 |
| A4 | AI must not mark `sourceBacked`. | S21C1 §8.2 |
| A5 | LiteracyItems require validator + human review before production. | S21C §5 |
| A6 | Runtime generation does not require permanent JSON storage. | S21C1 §5.1 |
| A7 | Production storage = item bank, benchmark, QA seed, curated worksheet, LiteracyItem library. | S21C1 §5.1 |
| A8 | ExampleItem ≠ production item. | S21B §8 |
| A9 | OCR is not authority. | S21B2 policy |
| A10 | Visual/textFallback patterns remain gated. | S21C V10, §5 |
| A11 | G3A U01 scope = number sense within 10000. | S21B, S21C |
| A12 | Tag fusion follows S21C §9 allowed/disallowed fusion examples. | S21C §9 |