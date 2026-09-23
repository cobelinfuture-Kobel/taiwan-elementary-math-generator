# G5AU02-S101 P0 Partition and Geometry Representation FullFix

## Authority

S101 implements pattern orders 9, 20 and 21 from the merged S99 P0 contract.

Source evidence:

- `g5a_u02_5a02a:p1:left-bottom` — segment count and length-per-segment paired roles;
- `g5a_u02_5a02a1:p1:left-lower-middle` — rectangle partitioned into equal squares;
- `g5a_u02_5a02a1:p2:left-top` — square side length to tile area reasoning chain.

## Locked scope

```text
ps_g5a_u02_equal_partition_all_segment_counts
ps_g5a_u02_rectangle_square_side_lengths
ps_g5a_u02_square_tile_area_possibilities
```

S102 common-factor sampling, S103 digit-code generation, P1/P2 patterns and other units are unchanged.

## Runtime FullFix

### Partition pairs

The canonical item stores every positive divisor as a segment count and pairs it with the exact integer length per segment.

```text
segmentCount × lengthPerSegment = totalLength
```

The additive `partitionPairListAnswer` preserves the two semantic roles and the length unit.

### Rectangle-square diagram

The item stores all common-factor side lengths and a bounded proportional diagram scale. The preview uses the greatest common-factor side length, so the grid is exact and contains at most 81 cells. The learner-visible note states that the diagram is one valid partition, not the only candidate.

### Tile side-area chain

Every common-factor side length is paired with its squared area.

```text
sideLength → sideLength × sideLength → tileArea
```

The additive `tileSideAreaPairListAnswer` preserves side and area units.

## Blocking validation

S101 implements all eight S99 blocking codes:

```text
G5AU02_P0_PARTITION_PAIR_INCOMPLETE
G5AU02_P0_PARTITION_PAIR_PRODUCT_INVALID
G5AU02_P0_PARTITION_UNIT_MISSING
G5AU02_P0_RECTANGLE_DIAGRAM_DIMENSION_MISMATCH
G5AU02_P0_RECTANGLE_SIDE_SET_MISMATCH
G5AU02_P0_TILE_DIAGRAM_DIMENSION_MISMATCH
G5AU02_P0_TILE_SIDE_AREA_PAIR_INCOMPLETE
G5AU02_P0_TILE_AREA_NOT_SIDE_SQUARED
```

Canonical answers are independently recomputed. Generic fallback and free-form AI remain forbidden.

## Public representation

The exact-layout renderer consumes the structured question display model and emits:

- a role-labelled compact grid for segment-count/length pairs;
- bounded proportional equal-square diagrams;
- a role-labelled compact grid for side-length/area reasoning pairs;
- generic worksheet page/grid/card classes retained for global geometry QA.

The renderer never creates more than 81 diagram cells per question. The pair grid preserves every structured pair while using two visual columns at high-density layouts.

## Authority precedence

The historical S84 materialization is not rewritten. S101 applies the two additive answer models through:

```text
S84 base materialization
→ S99 additive answer-model contract
→ S101 runtime overlay
```

The overlay changes only pattern orders 9 and 21 and their two PatternGroup answer-model declarations.

## Acceptance

```text
source runtime: 3 patterns × 64 seeds = 192 / 192 PASS
browser bundle: 3 patterns × 64 questions = 192 / 192 PASS
full Node regression = 1595 / 1595 PASS
S97 backward compatibility = 120 / 120 PASS
S100 source and bundle = 384 / 384 PASS
GLM-S05 exact 18-layout matrix = PASS
GLM-S06 270 HTML/PDF matrix = 270 / 270 PASS
GLM-S07 90 answer-boundary matrix = 90 / 90 PASS
GLM-S09 actual column geometry = 270 / 270 PASS
S95/S96D/S96G/S96I/S96Q/S96R = PASS
```

The initial GLM-S06 run found one `G5A-U02:3×5` page-container overflow. No card, prompt, response node or PDF bounding box overflowed. The public pair response representation was compacted from eight vertical rows to a two-column role-labelled grid. The final 270-scenario run passed with zero render findings.

## Merge closeout

```text
PR_NUMBER = 248
MERGE_SHA = c3ace42280424d4cd2657dea696cd373c4817adb
STATUS = PASS_CI_SYNCED_AND_MERGED
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_S100_METHOD_LANGUAGE_REASONING_FIXED
GOAL_DISTANCE_AFTER = D1_G5A_U02_S101_PARTITION_GEOMETRY_REPRESENTATION_FIXED
DISTANCE_REDUCED = three P0 application/geometry PatternSpecs gain paired semantic answers, bounded source-like diagrams and exact-layout-safe response representations
D0_ELIGIBLE = false
NEXT_SHORT_STEP = G5AU02-S102_P0NontrivialCommonFactorSamplingAndWitnessFullFix
NEXT_STEP_REQUIRES_IMPLEMENTATION_APPROVAL = true
```
