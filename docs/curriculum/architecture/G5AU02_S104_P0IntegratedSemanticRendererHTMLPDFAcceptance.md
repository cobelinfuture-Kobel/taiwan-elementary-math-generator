# G5AU02-S104 P0 Integrated Semantic Renderer HTML/PDF Acceptance

## Authority

This milestone implements the final P0 integration gate defined by:

```text
G5AU02-S99_P0SourceMethodAndRepresentationFullFixContract
G5AU02-S100_P0MethodWitnessLanguageAndReasoningFullFix
G5AU02-S101_P0PartitionAndGeometryRepresentationFullFix
G5AU02-S102_P0NontrivialCommonFactorSamplingAndWitnessFullFix
G5AU02-S103_P0SourceDigitCodeReferenceAndGeneratedFamilySeparation
G5AU02_PreS104_PublicWorksheetSemanticProjectionFullFix_And_Regeneration
G5AU02_PreS104_WorkedSolutionLeakageAndResponseSpaceFullFix
```

## Locked P0 pattern set

```text
1  ps_g5a_u02_factor_relation_equivalence
2  ps_g5a_u02_factor_enumeration_trial_division
4  ps_g5a_u02_factor_list_from_pairs
8  ps_g5a_u02_factor_statement_judgement
9  ps_g5a_u02_equal_partition_all_segment_counts
11 ps_g5a_u02_problem_type_classification
13 ps_g5a_u02_complete_factor_list_statement_evaluation
16 ps_g5a_u02_common_factor_enumeration
17 ps_g5a_u02_greatest_common_factor
20 ps_g5a_u02_rectangle_square_side_lengths
21 ps_g5a_u02_square_tile_area_possibilities
22 ps_g5a_u02_multi_constraint_digit_code
```

No P1/P2 pattern is modified or accepted by this milestone.

## Integrated path under acceptance

```text
canonical generator
→ blocking validator
→ browser bundle parity
→ public worksheet projection
→ shared semantic renderer
→ question/answer boundary
→ HTML
→ print CSS
→ PDF
```

## Matrix A: item integration

```text
12 patterns × 64 deterministic seeds = 768 scenarios
required pass count = 768 / 768
```

Each scenario must prove:

- canonical source runtime and committed browser bundle are structurally identical;
- generation and blocking validation succeed;
- the required `G5AU02QuestionDisplayModel.kind` is present;
- public projection preserves the structured display model;
- answer-key projection is nonempty;
- shared semantic renderer is selected;
- no internal PatternSpec, FormalMapping, PatternGroup or KnowledgePoint ID is learner-visible;
- default digit-code generation does not repeat source answer 1725.

## Matrix B: actual 18-layout HTML/PDF acceptance

```text
12 patterns × 18 approved layouts = 216 scenarios
required pass count = 216 / 216
```

Approved layouts:

```text
3×1 3×2 3×3 3×4 3×5
2×1 2×2 2×3 2×4 2×5 2×6
1×1 1×2 1×3 1×4 1×5 1×6 1×7
```

The runner groups the 18 layouts for one pattern into one 18-page PDF. Every page is still inspected independently. Acceptance uses:

- actual card X-coordinate clusters;
- computed CSS grid column count;
- exact card count;
- DOM card/page overflow count;
- pairwise card overlap detection;
- PDF page count;
- nonblank PDF text readback;
- PDF text bounding-box containment.

Metadata alone is not accepted as column evidence.

## Matrix C: answer boundary

```text
12 patterns × [3×5, 2×6, 1×7] × [answers off, answers on]
= 72 scenarios
required pass count = 72 / 72
```

Blocking rules:

- answer-off HTML/PDF contains no answer section;
- answer-on HTML/PDF contains the expected answer pages;
- question pages contain no answer nodes;
- answer pages use the controlled one-column answer profile;
- worked arithmetic remains answer-key-only;
- question-page response scaffolds remain available;
- DOM/PDF overflow, overlap, clipping and blank pages remain zero.

## Browser bundle rule

The workflow rebuilds the browser bundle from canonical source with the production esbuild command and performs a byte-for-byte comparison with the committed bundle before running either matrix job.

## Frozen boundaries

```text
P1/P2 source-method and representation gaps remain open
other units remain unchanged
free-form AI remains forbidden
generic fallback remains forbidden
global layout architecture is not redesigned
source 1725 remains reference-only
```

## Completion semantics

A pass establishes:

```text
D1_G5A_U02_S104_P0_INTEGRATED_ACCEPTANCE_COMPLETE
```

It does not establish all-22 semantic D0 because P1/P2 gaps remain.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_PRE_S104_QUESTION_ANSWER_BOUNDARY_ACCEPTED
GOAL_DISTANCE_TARGET = D1_G5A_U02_S104_P0_INTEGRATED_ACCEPTANCE_COMPLETE
D0_ELIGIBLE = false
NEXT_SHORTEST_STEP = define the next P1/P2 source-parity milestone without modifying it in S104
```
