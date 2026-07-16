# G5AU02-S97 Source Parity Prompt Completeness and Semantic FullFix

## Trigger

A direct comparison of the generated `G5a_U02_01.pdf` against the source packets `5a02a` and `5a02a1` found that 32 of 120 generated questions did not expose enough information for a learner to answer them.

The arithmetic answer runtime was generally correct. The blocking defect was information loss between canonical generated item data and the public worksheet prompt.

## Locked scope

This milestone repairs exactly six blocking PatternSpecs:

1. `ps_g5a_u02_missing_factor_reconstruction`
2. `ps_g5a_u02_divisor_candidate_selection`
3. `ps_g5a_u02_complete_factor_list_unknown_values`
4. `ps_g5a_u02_complete_factor_list_statement_evaluation`
5. `ps_g5a_u02_common_factor_concept_identification`
6. `ps_g5a_u02_multi_constraint_digit_code`

No other unit, KnowledgePoint, answer formula or arithmetic validator is changed.

## Root cause

The hidden canonical item retained factor sequences, candidate sets, statement sets and source predicates in `item.data`, but the public question record retained only `item.prompt`. The renderer and global layout projection therefore received vague instructions without the data required to solve the question.

## FullFix architecture

```text
canonical generated item
  -> buildG5AU02QuestionDisplayModel(item)
  -> validateG5AU02QuestionDisplayModel(item, model, visiblePrompt)
  -> public questionItems.questionDisplayModel
  -> complete visible prompt text
  -> global layout projection preserves the structured model
  -> shared renderer receives a self-contained question
```

The public runtime deterministically regenerates each canonical item with the same seed used by the hidden worksheet allocator. This avoids copying answer data into the student question record and preserves the existing canonical generator and validator authority.

## Source-backed password conditions

The four-digit source example no longer displays hidden positional answers such as `千位為1`. The visible conditions preserve the source reasoning family:

- the third digit differs from the first and is a common factor of 6 and 8;
- 70 is a common multiple of the second and fourth digits;
- the first digit is a common factor of 22 and 33 and also of 45 and 60;
- the complete four-digit number is a multiple of both 3 and 5;
- all four digits are distinct.

The source-backed answer remains `1725`.

## Blocking validation

For the six PatternSpecs, generation is blocked when any of the following occurs:

- the structured display model is absent;
- a factor sequence or blank is absent;
- a candidate set is not visible;
- an unknown symbol or target-number witness is absent;
- a statement set is not visible;
- the source password conditions are incomplete;
- the serialized learner prompt does not contain every required visible datum.

## Acceptance matrix

```text
6 blocking PatternSpecs
x 20 deterministic questions per PatternSpec
= 120 visible-information scenarios
```

Every scenario must satisfy:

- question and answer counts are exact;
- `questionDisplayModel` exists;
- `promptCompletenessStatus = visible_unique_solution_data_complete`;
- all candidate values, factor-table values, statements or source conditions are visible;
- no answer, structured answer or answer text leaks into the student question record;
- page records retain the same prompt and model as `questionItems`;
- the generated browser bundle passes the same semantic audit;
- full Node regression passes.

## Compatibility recovery

Two integration defects were closed during acceptance:

- three-factor targets could carry duplicate legacy unknown keys; the semantic display boundary now normalizes them without changing the canonical answer;
- S96I, S96Q and S96R still counted only the legacy G5A-U02 DOM after GLM-S09 moved public exact-layout previews to the shared renderer. Their browser authorities now accept both legal renderer DOM families and retain structured failure diagnostics.

## Accepted evidence

```text
PR = 244
MERGE_SHA = 45dbb996fd64f83595fe4115712fd767b622a00c
S97_SOURCE_VISIBLE_INFORMATION = 120 / 120 PASS
S97_BUNDLED_VISIBLE_INFORMATION = 120 / 120 PASS
FULL_NODE_REGRESSION = 1575 / 1575 PASS
GLM_S05_15_BY_18_EXACT_LAYOUT = PASS
GLM_S06_HTML_PDF = 270 / 270 PASS
GLM_S07_ANSWER_BOUNDARY = 90 / 90 PASS
S95_PRODUCTION_STRESS = PASS
S96G_DYNAMIC_HTML_PDF = PASS
S96I_LIVE_BROWSER = PASS
S96Q_PUBLIC_CONTROL_DOM = PASS
S96R_24_CONTROL_COMBINATIONS = PASS
```

## Explicitly deferred

The following are real semantic-quality gaps but are outside this six-pattern blocking milestone:

- broader method and visual representation parity for all 22 PatternSpecs;
- nontrivial `a != b` generation policy for public common-factor questions;
- replacement of the fixed source password example with a separate generated unique-code family;
- allocation diversity beyond canonical round-robin;
- specialized graphical factor-table, U-pair and geometry renderers.

These remain blockers for a later all-22 semantic D0 closeout.

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_PROMPT_COMPLETENESS_BLOCKED
GOAL_DISTANCE_AFTER = D1_G5A_U02_SIX_BLOCKING_PATTERNS_CLOSED
DISTANCE_REDUCED = six learner-visible information blockers closed and validated through source, bundle, browser, HTML and PDF paths
D0_ELIGIBLE = false
NEXT_SHORT_STEP = G5AU02-S98_All22SourceMethodAndRepresentationParityAudit
```
