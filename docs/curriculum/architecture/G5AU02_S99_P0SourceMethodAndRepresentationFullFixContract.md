# G5AU02-S99 P0 Source Method and Representation FullFix Contract

## Purpose

S98 classified twelve PatternSpecs as P0 because the current public behavior remains answerable but does not yet preserve a source method, mathematical language role, structured representation, nontrivial sampling rule or generated-family boundary.

S99 freezes the implementation contract before any runtime change. It prevents the P0 repair from expanding into an open-ended rewrite of all 22 PatternSpecs.

## Fixed P0 scope

The P0 program contains exactly these twelve canonical PatternSpecs:

```text
1  factor relation equivalence
2  trial-division factor enumeration
4  factor list from completed pairs
8  factor/multiple statement judgment
9  ribbon equal-partition count/length pairs
11 factor/multiple/common-factor/common-multiple problem classification
13 complete-factor-list statement reasoning
16 common-factor enumeration
17 greatest common factor
20 rectangle cut into equal squares
21 square-tile side/area possibilities
22 multi-constraint four-digit code
```

PatternSpec, KnowledgePoint and source packet IDs remain stable. P1 and P2 behavior is frozen during the P0 implementation program.

## Global invariants

- deterministic generation only;
- canonical answers must be independently recomputed by blocking validators;
- all required data and representations must be learner-visible;
- no answer leakage into student records;
- no generic fallback;
- no free-form AI;
- Traditional Chinese output;
- no cross-unit change;
- S99 itself is contract, documentation, test and marker only.

## FullFix tracks

### S100 — Method witnesses, language and reasoning

Patterns: `1, 2, 4, 8, 11, 13`

Required outcomes:

- factor judgment exposes multiplication and division evidence;
- trial division becomes an actual row model with divisor, quotient, remainder and exactness;
- factor-list-from-pairs displays the pairs and the pair-to-list transformation;
- four divisibility grammar directions are controlled and semantically validated;
- problem-type classification uses finite source-like quantity scenarios rather than dictionary definitions;
- factor-list statement sets include true/false diversity and nontrivial inference.

### S101 — Partition and geometry representations

Patterns: `9, 20, 21`

Required outcomes:

- ribbon questions answer paired segment count and length per segment;
- rectangle questions render a bounded proportional equal-square partition model;
- tile questions expose side-length-to-area pairs and a tiled-rectangle representation;
- three additive answer models are admitted only where the source target requires structured pairs.

### S102 — Nontrivial common-factor sampling and witnesses

Patterns: `16, 17`

Required deterministic sampling constraints:

```text
a != b
gcd(a,b) >= 2
gcd(a,b) < min(a,b)
factorSet(a) != factorSet(b)
```

Common-factor enumeration must display both factor sets and their intersection. GCF tasks must expose the complete common-factor set and identify its maximum.

### S103 — Source code reference and generated family separation

Pattern: `22`

Two profiles are required within the stable PatternSpec:

- `source_1725_reference`: exact source example, reference-only allocation;
- `generated_unique_code_v1`: deterministic production regeneration using finite controlled clues and an exact-one-solution solver.

Removing a required generated clue must not leave the same unique solution. This prevents the generated family from publishing redundant conditions while preserving the original source example.

### S104 — Integrated acceptance

All twelve P0 patterns pass together through:

- canonical generation and validator paths;
- browser bundle;
- public worksheet projection;
- shared exact-layout renderer;
- answer-key rendering;
- HTML/PDF output;
- public browser controls and print path.

## New display-model authority

The contract admits twelve bounded model kinds:

```text
factor_relation_dual_witness
trial_division_table
factor_pairs_to_ordered_list
controlled_divisibility_statement
partition_count_length_pairs
number_theory_problem_type_scenario
factor_list_reasoning_statement_set
parallel_factor_sets_with_intersection
common_factor_set_with_gcf
rectangle_square_partition_diagram
square_tile_side_area_chain
unique_digit_code_constraints
```

These are semantic data models. Renderers may choose accessible HTML/CSS presentations, but they may not infer missing arithmetic or semantic roles from prompt text.

## Additive answer models

Exactly three additive models are approved:

- `partitionPairListAnswer`;
- `commonFactorAndGcfAnswer`;
- `tileSideAreaPairListAnswer`.

Existing answer models remain valid for non-P0 and backward-compatibility consumers. No unrelated answer schema may be added in S100–S104.

## Blocking validator contract

Each P0 row owns named `G5AU02_P0_*` blocking codes. Required categories include:

- source witness absent or arithmetically inconsistent;
- controlled grammar or quantity role invalid;
- trial-division rows incomplete;
- factor-pair/list transformation invalid;
- partition pairs incomplete or wrong product;
- statement set trivial or truth pattern invalid;
- common-factor operands degenerate;
- factor-set intersection or GCF maximum mismatch;
- diagram dimensions inconsistent with the mathematical model;
- tile area not equal to side squared;
- digit-code profile invalid, clue set insufficient or solution nonunique;
- source 1725 profile incorrectly used as default regeneration.

Validation must operate on structured fields, not parse rendered Chinese text.

## Acceptance matrices

### Deterministic item matrix

```text
12 patterns × 64 seeds = 768 scenarios
required: 768 / 768 PASS
```

### Full approved-layout matrix

```text
12 patterns × 18 layouts = 216 scenarios
required: 216 / 216 PASS
```

### Answer-boundary matrix

```text
12 patterns × (3×5, 2×6, 1×7) × answer off/on
= 72 scenarios
required: 72 / 72 PASS
```

Blocking findings include missing source method, missing representation, incomplete visible information, equal-operand degeneracy, answer mismatch, nonunique code, overflow, overlap, blank PDF page, clipping, fallback or free-form AI.

## Non-goals

S99 does not:

- implement runtime changes;
- repair the six P1 rows;
- claim all-22 semantic D0;
- change other units;
- introduce an AI authoring path;
- redesign the global layout system.

Even after P0 completes, P1 source-method and representation gaps remain, so all-22 semantic D0 stays unavailable.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_ALL22_METHOD_REPRESENTATION_GAPS_CLASSIFIED
GOAL_DISTANCE_TARGET = D1_G5A_U02_P0_FULLFIX_CONTRACT_LOCKED
DISTANCE_REDUCED = twelve P0 gaps become five bounded implementation milestones with exact schemas, validators and acceptance matrices
D0_ELIGIBLE = false
NEXT_SHORT_STEP = G5AU02-S100_P0MethodWitnessLanguageAndReasoningFullFix
```
