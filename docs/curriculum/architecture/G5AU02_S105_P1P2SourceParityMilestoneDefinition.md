# G5AU02-S105 P1/P2 Source-Parity Milestone Definition

## Status

```text
STATUS = DESIGNED_PENDING_CI
TASK = G5AU02-S105_P1P2SourceParityMilestoneDefinition
IMPLEMENTATION_ALLOWED = false
```

## Authority

S105 consumes the remaining non-P0 rows from:

```text
G5AU02-S98_All22SourceMethodAndRepresentationParityAudit
```

and treats the merged P0 program as immutable upstream authority:

```text
G5AU02-S99_P0SourceMethodAndRepresentationFullFixContract
G5AU02-S100_P0MethodWitnessLanguageAndReasoningFullFix
G5AU02-S101_P0PartitionAndGeometryRepresentationFullFix
G5AU02-S102_P0NontrivialCommonFactorSamplingAndWitnessFullFix
G5AU02-S103_P0SourceDigitCodeReferenceAndGeneratedFamilySeparation
G5AU02-S104_P0IntegratedSemanticRendererHTMLPDFAcceptance
```

S104 is already `PASS_CI_SYNCED_AND_MERGED`. S105 does not reopen or reinterpret any accepted P0 behavior.

## Locked scope

```text
contract
architecture document
focused contract tests
CI workflow
pending marker
```

Forbidden in S105:

```text
generator changes
validator implementation
question-display implementation
renderer implementation
browser bundle regeneration
P0 behavior changes
P2 regression-only behavior changes
cross-unit changes
GCTX changes
free-form AI
generic fallback
runtime web search
```

## Remaining pattern inventory

S98 partitions the ten remaining patterns as:

```text
P1 = 6
P2 = 4
```

Seven patterns require bounded runtime repair:

| Order | Priority | PatternSpec | Current state | Required representation |
|---:|:---:|---|---|---|
| 3 | P1 | `ps_g5a_u02_factor_pair_enumeration` | plain prompt | `factor_pair_search_stop_boundary` |
| 5 | P1 | `ps_g5a_u02_factor_order_and_symmetry` | plain prompt | `u_shaped_factor_symmetry_record` |
| 6 | P1 | `ps_g5a_u02_missing_factor_reconstruction` | `masked_factor_sequence` | `masked_factor_table_with_pair_cues` |
| 7 | P1 | `ps_g5a_u02_divisor_candidate_selection` | `candidate_selection` | `candidate_circle_selection_row` |
| 12 | P1 | `ps_g5a_u02_complete_factor_list_unknown_values` | `symbolic_complete_factor_sequence` | `symbolic_complete_factor_relation_table` |
| 15 | P1 | `ps_g5a_u02_common_factor_concept_identification` | `candidate_selection` | `marked_common_factor_row` |
| 14 | P2 | `ps_g5a_u02_remainder_transfer` | plain numeric prompt | `remainder_transfer_story_witness` |

Three P2 patterns already have source parity and are regression-only:

```text
10 ps_g5a_u02_equal_partition_range_constrained_recipients
18 ps_g5a_u02_maximum_equal_grouping
19 ps_g5a_u02_possible_equal_packaging_counts
```

Their runtime and learner-facing behavior must not be changed merely to make all ten rows look structurally uniform.

## Current-state readback

Current main has prompt-completeness display models for orders 6, 7, 12 and 15. Only order 12 currently receives a dedicated renderer representation. Orders 3, 5 and 14 remain plain prompts.

S105 records that current state so future implementation cannot claim a missing representation is already complete or silently replace a current model without migration tests.

## Repair program

### S106 — factor-pair, symmetry and masked-table FullFix

Patterns:

```text
3, 5, 6
```

Required outcomes:

- deterministic factor-pair search rows;
- explicit square-root crossing or equivalent stop boundary;
- ascending outer-to-inner symmetry links;
- correct square-number midpoint policy;
- structured masked factor table;
- visible pair cues;
- one unique completion;
- answer values isolated from student response slots.

### S107 — selection, symbolic relation and common-factor marking FullFix

Patterns:

```text
7, 12, 15
```

Required outcomes:

- one markable circle or equivalent affordance per candidate;
- canonical selection recomputed from divisibility;
- Traditional Chinese public symbols retained;
- symmetric pair relations and symbol equations made learner-observable;
- unique symbolic solution;
- complete common-factor marking;
- smallest and greatest common-factor roles derived from the intersection.

### S108 — controlled remainder-transfer context FullFix

Pattern:

```text
14
```

Required outcomes:

- finite controlled source-like scenario families;
- explicit total, divisor, distribution and remainder roles;
- existing divisor-multiple arithmetic witness preserved;
- no free-form context generation;
- no change to canonical mathematics.

### S109 — P2 regression-only source-parity lock

Patterns:

```text
10, 18, 19
```

This milestone adds focused source-parity and recomputation tests only. Runtime mutation is forbidden.

### S110 — all-22 integrated acceptance and D0 closeout

S110 re-runs the complete unit through:

```text
canonical generator
→ blocking validator
→ browser bundle
→ public projection
→ semantic renderer
→ answer key
→ actual HTML geometry
→ PDF
→ browser and print
```

D0 is not available until S110 passes.

## Required display-model contracts

```text
factor_pair_search_stop_boundary
u_shaped_factor_symmetry_record
masked_factor_table_with_pair_cues
candidate_circle_selection_row
symbolic_complete_factor_relation_table
marked_common_factor_row
remainder_transfer_story_witness
```

Each model must own complete source-method evidence internally while keeping solved values out of learner-visible response areas.

## Validation policy

Every runtime-repair pattern receives deterministic blocking codes owned by its priority namespace:

```text
G5AU02_P1_*
G5AU02_P2_*
```

Validators must independently recompute:

- factor-pair products and stop boundary;
- ordered symmetry links and midpoint policy;
- masked-table completion count;
- candidate divisibility classification;
- symbolic pair equations and solution count;
- common-factor intersection and min/max roles;
- remainder-transfer arithmetic witness and context-role closure.

No validator may infer correctness from prompt wording alone.

## Acceptance matrices

### Remaining ten patterns

```text
focused generation    10 × 64 = 640 / 640
actual layouts        10 × 18 = 180 / 180
answer boundary       10 × 3 × 2 = 60 / 60
```

The ten-pattern matrix contains:

```text
runtime repair = 7
regression-only = 3
```

### Final all-22 S110 gate

```text
item integration      22 × 64 = 1408 / 1408
actual layouts        22 × 18 = 396 / 396
answer boundary       22 × 3 × 2 = 132 / 132
```

Actual layout acceptance requires real card X-coordinate clusters, computed grid columns and rows, exact card counts, zero DOM overflow, zero overlap, nonblank PDFs and PDF bounding-box containment. Metadata alone is not geometry evidence.

## Blocking boundaries

S110 cannot pass when any of the following remains:

```text
missing source method or representation
incorrect factor-pair stop boundary
incorrect symmetry or midpoint relation
nonunique masked or symbolic solution
candidate or common-factor marking mismatch
remainder-transfer context-role mismatch
regression-only P2 mutation
P0 regression
learner-visible answer leakage
DOM overflow, overlap or clipping
blank or out-of-bounds PDF page
generic fallback, free-form AI or runtime web search
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_S104_P0_INTEGRATED_ACCEPTANCE_COMPLETE
GOAL_DISTANCE_AFTER  = D1_G5A_U02_P1_P2_SOURCE_PARITY_PROGRAM_LOCKED_PENDING_CI
DISTANCE_REDUCED     = remaining six P1 gaps, one P2 repair gap and three P2 regression-only patterns are partitioned into bounded implementation and all-22 acceptance milestones
REMAINING_BLOCKERS   = [S105 CI and merge, S106, S107, S108, S109, S110]
D0_ELIGIBLE          = false
NEXT_SHORTEST_STEP   = G5AU02-S106_P1FactorPairSymmetryAndMaskedTableFullFix
NEXT_STEP_REQUIRES_IMPLEMENTATION_APPROVAL = true
```
