# G4A_U08_8Track_PatternGapMatrix_V1

```text
MILESTONE = G4A_U08_8Track_PatternGapMatrix
MODE = ANALYSIS_ONLY / NO_PRODUCTION_ADMISSION
STATUS = ANALYSIS_PASS_SOURCE_BOUNDARY_HOLDS
SOURCE_ID = g4a_u08_4a08
```

## Authority and denominator lock

1. **Primary curriculum authority**: `docs/curriculum/mapping/S76A_G4A_U08_SourceAuthorityFreeze.md` and `data/curriculum/knowledge/units/g4a_u08_4a08.knowledge-operation.json`. The current canonical inventory is **15 KP / 28 PatternGroups / 33 PatternSpecs (16 numeric, 17 application)**. A previous D0 closeout does not mean that all eight proposed diversity tracks have reusable PatternSpecs.
2. **Operator-provided local ZIP snapshot**: `G4A_U08_整理.zip`, JavaScript `g4a-u08-import-bank.js`: **15 import pattern groups, 1,216 cases = 615 source-copy + 601 parameter-variant**. These import group IDs and candidate cases are NOT identical to canonical PatternGroup or PatternSpec counts. Snapshot date: 2026-10-12.
3. **QA provenance**: ZIP `09_S1_Source_Recovery_and_Supplement_QA.json`, `G4A_U08_candidates.json`. The QA summary retains **1,009 P3 rows paused by operator**, **34 cross-unit routing proposals**, **2 parity-related candidate rows**, zero promoted new KP in this batch. Paused/out-of-scope cases are never used to grant production admission.
4. The ZIP is a **local operator snapshot**, not a verified identical copy of current GitHub `main` runtime. No claim that all 1,216 local cases are production-renderable is made.

## Status notation

- **Q** = cross-cutting quality gate required (not a new PatternSpec).
- **P** = partial evidence or existing forward/comparison task; reusable diversity Pattern not yet proven.
- **G** = proposed capability missing as an evidenced reusable PatternSpec; requires source / semantic / validator preflight.
- **R** = authority boundary conflict or uncertain admissibility; hold, do not implement.
- **—** = not primary for that KP. No absence claim about unrelated capabilities.

Tracks: **T1** QA/duplicates/answer contracts; **T2** calculation-error diagnosis; **T3** target-result parentheses insertion; **T4** inverse missing quantity; **T5** compare algorithms and valid transformations; **T6** structured chart/line representation; **T7** dependent 3–5 subquestion bundle; **T8** parity candidate boundary review.

## 15-KP × eight-track gap matrix

| Canonical KP suffix | Existing source/variant cases | Current formal specs | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | ZIP evidence |
|---|---:|---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| `num_add_group_round` | 5 / 8 | 1 | Q | G | — | — | P | — | — | — | `u08_0060` |
| `num_signed_term_move` | 3 / 8 | 1 | Q | G | — | — | P | — | — | — | `u08_0055` |
| `num_add_sub_left_assoc` | 27 / 8 | 1 | Q | G | — | — | P | — | — | — | `u08_0059` |
| `num_parentheses_first` | 78 / 8 | 2 | Q | P | G | — | P | — | — | — | `u08_0062` |
| `num_repeated_subtract_group` | 2 / 8 | 1 | Q | G | — | — | P | — | — | — | `u08_0057` |
| `num_mul_div_safe_reorder` | 14 / 8 | 1 | Q | G | — | — | P | — | — | — | `u08_0061` |
| `num_mul_div_left_assoc` | 108 / 8 | 1 | Q | G | — | — | P | — | — | — | `u08_0054` |
| `num_repeated_divide_group` | 3 / 8 | 1 | Q | G | — | — | P | — | — | — | `u08_0071` |
| `num_mul_div_before_add_sub` | 108 / 8 | 4 | Q | P | — | — | P | P | — | — | `u08_0053`, `u08_1001` |
| `num_parentheses_change_precedence` | 37 / 8 | 2 | Q | G | G | — | P | — | — | — | `u08_0077` |
| `num_compound_parentheses` | 3 / 8 | 1 | Q | G | G | — | P | — | — | — | `u08_0263` |
| `app_add_sub_sequence` | 38 / 128 | 5 | Q | — | — | P | — | P | P | — | `u08_0006` |
| `app_parentheses_grouping` | 27 / 129 | 3 | Q | R | G | R | P | P | P | — | `u08_0045`, `u08_0052` |
| `app_mul_div_sequence` | 133 / 128 | 5 | Q | — | — | P | — | P | P | — | `u08_1008`, `u08_1019`, `u08_1215` |
| `app_mul_div_before_add_sub` | 29 / 128 | 4 | Q | — | — | P | — | P | P | — | `u08_0051`, `u08_1206` |
| **TOTAL** | **615 / 601** | **33** | 15 Q |  |  |  |  |  |  |  | |

The ZIP's `patternSpecIds` attached to the **15 import groups** are snapshot import labels, not proof that equivalent **33 canonical PatternSpecs** each contain the above proposed cognitive actions.

## Eight-track decisions and next candidate families (NOT production approved)

| Track | Assessment and smallest justified next operation | Proposed primary owner(s) | Gate |
|---|---|---|---|
| T1: QA and dedup | Fix typed answer contract, provenance-sensitive duplicates and missing visual projection metadata **without deleting source rows**. Exact text + answer duplicate-pair collision count in ZIP = 84 additional occurrences (a mechanical audit metric, not 84 confirmed duplicate source questions). `number_with_unit` is assigned to 1,002 cases, of which 136 store string answers and 10 store non-scalar answers; distinguish option / relation / expression / multi-answer contracts. | Shared QA, all 15 KPs | Reconcile source identity, human verified source and renderer/validator formats before any mutation |
| T2: error diagnosis | Candidate `wrong_first_step`, `signed_term_mutation`, `division_grouping_misconception`: require wrong worked step + error localization + corrected AST/result + distractor witness. Existing `u08_1001` asks which part to compute first, while the ZIP contains individual misconception-type examples, but not an evidenced reusable wrong-step family. | `num_mul_div_before_add_sub`, `num_mul_div_left_assoc`, `num_signed_term_move`, `num_parentheses_first`, `num_repeated_divide_group` | No intentionally wrong mathematics admitted as answer; grade-boundary preflight |
| T3: inverse parentheses design | Candidate `insert_parentheses_to_target` and `insert_two_groups_to_target`, rather than another ordinary bracket calculation or equality comparison. Ensure target has a valid unambiguous solution policy; no newly inferred arithmetic operator. | `num_parentheses_change_precedence`, `num_parentheses_first`, `num_compound_parentheses` | Source-compatible AST, answer multiplicity policy, bounded positive integer/intermediate constraints |
| T4: inverse missing quantity | Existing application examples include recovering an earlier balance or quantity; source case `u08_0045` instead asks about a **misread operator**. Do not conflate reversing a known operation with the authority-excluded **unknown-operator inference**. Candidate `recover_initial_amount_from_final` only where source and KP scope support it. | `app_add_sub_sequence`, `app_mul_div_sequence`, `app_mul_div_before_add_sub`; `app_parentheses_grouping` = HOLD | Fixed operator, unique non-negative integer witness, grade-4 source preflight |
| T5: algorithm comparison | Existing expression-comparison cases must be distinguished from `compare_valid_rewrite_with_reason` and `choose_shorter_equivalent_working`. Preserve signed terms; `a-b-c = a-(b+c)`; `a÷b÷c=a÷(b×c)`; no grade-5 distributive-law objective. | `num_add_group_round`, `num_signed_term_move`, `num_mul_div_safe_reorder`, `num_repeated_subtract_group`, `num_repeated_divide_group` | Equivalent original/transformed AST, rationale witness, explicit invalid counterexamples |
| T6: representation | ZIP has only **3 cases with nonempty `scenes`** and **2 with structured `table`**, although some other source cases mention diagrams/tables in prose. Candidate `state_change_tape_diagram`, `price_quantity_table_to_expression`, `dependent_table_totals`, with two-column print QA. | 4 application KPs; operation-order markings remain numeric-specific | Complete structured scene/table data and source-backed role/units, render + PDF/print verification |
| T7: dependent bundle | ZIP includes **38 cases with nonempty `subquestions`** and **6 with nonempty `dependencies`**, not 38 proven linear dependency graphs. Candidate `shared_stem_3_to_5_step_dependency_bundle` with coherent final task. | 4 application KPs | Dependency DAG, each answer witness, source sibling identity, approved complete-page projection |
| T8: parity | **2 source-recovery KP candidate rows**, one from a four-upper paper and one from a **four-lower** paper. Neither establishes G4A-U08 curriculum authority by itself. | `kp_candidate_g4a_u08_odd_even_operation_parity_reasoning` only | Source/unit attribution and KP prerequisite graph review; **NO KP creation** |

### Quality and source-governance holds

- Case `u08_1216` includes fractions and decimal quantities in its local prompt; the G4A-U08 authority disallows admission of such objectives without independent supported domain policy. Hold for source/scope review, not automatic production admission.
- `u08_0052` includes an inverse sum/difference harvest table; assess whether it imports authority-excluded inverse-average / higher-grade inference before turning it into a reusable generator.
- The local case records contain a table in only 2 rows and `scenes` in only 3 rows; references to original pictures in text do not establish that ZIP has assets sufficient for printing. No unverified image should be reconstructed and called source-backed.
- QA P3 remains paused; this matrix **does not** restart the 1,009-row queue, certify source PDFs, change classification or admit any new question.

## Acceptance and handoff

```text
MATRIX_KP_ROWS = 15
MATRIX_TRACKS = 8
EXISTING_CANONICAL_PATTERN_SPECS = 33
LOCAL_ZIP_SOURCE_CASES = 615
LOCAL_ZIP_VARIANT_CASES = 601
NEW_KP = 0
NEW_PATTERN_SPEC = 0
GENERATOR_VALIDATOR_RENDERER_CHANGES = 0
QUESTION_ADMISSIONS = 0
NEXT_SHORTEST_STEP = G4A_U08_T1_AnswerContractAndProvenanceDedup_Preflight
STOP_REASON = NEXT_STEP_OUTSIDE_APPROVED_SCOPE
REQUIRED_OPERATOR_ACTION = Approve specific T1 implementation scope after matrix review
```

Distance classification applies only to this **eight-track supplement branch** and does not downgrade the existing D0 worksheet route: `GOAL_DISTANCE_BEFORE = D3`, `GOAL_DISTANCE_AFTER = D3`, `DISTANCE_REDUCED = 0 distance-scale levels` (15-KP evidence-backed gap inventory and blockers are now explicit; no FormalMapping/PatternSpec/Validator contract was materialized). Public runtime remains unchanged. 
