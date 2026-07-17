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

- blank segment-count/length response rows;
- bounded proportional equal-square grids;
- blank side-length/area reasoning rows;
- generic worksheet page/grid/card classes retained for global geometry QA.

The renderer never creates more than 81 diagram cells per question.

## Acceptance

```text
source runtime: 3 patterns × 64 seeds = 192 / 192 required
browser bundle: 3 patterns × 64 questions = 192 / 192 required
full Node regression = required
GLM-S05 exact 18-layout matrix = required
GLM-S06 270 HTML/PDF matrix = required
GLM-S07 90 answer-boundary matrix = required
S95/S96G/S96I/S96Q/S96R = required
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_S100_METHOD_LANGUAGE_REASONING_FIXED
GOAL_DISTANCE_TARGET = D1_G5A_U02_S101_PARTITION_GEOMETRY_REPRESENTATION_FIXED
DISTANCE_REDUCED = three P0 application/geometry PatternSpecs gain paired semantic answers and bounded source-like representations
D0_ELIGIBLE = false
NEXT_SHORT_STEP = G5AU02-S102_P0NontrivialCommonFactorSamplingAndWitnessFullFix
```
