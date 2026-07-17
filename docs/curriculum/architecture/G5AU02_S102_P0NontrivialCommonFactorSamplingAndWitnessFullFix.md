# G5AU02-S102 P0 Nontrivial Common-Factor Sampling and Witness FullFix

## Authority

S102 implements pattern orders 16 and 17 from the merged S99 P0 source-method and representation contract.

Source evidence:

- `g5a_u02_5a02a:p2:left-middle` — derive common factors from two complete factor structures;
- `g5a_u02_5a02a1:p1:left-bottom` — enumerate complete common factors;
- `g5a_u02_5a02a1:p1:right-top` — derive the greatest common factor from the full common-factor set.

## Locked scope

```text
ps_g5a_u02_common_factor_enumeration
ps_g5a_u02_greatest_common_factor
```

S103 digit-code generation, S104 integrated closeout, P1/P2 patterns and all other units are unchanged.

## Deterministic nondegenerate sampling

Every generated operand pair must satisfy:

```text
a != b
gcd(a,b) >= 2
gcd(a,b) < min(a,b)
factorSet(a) != factorSet(b)
```

Sampling uses a finite deterministic multiplier-pair registry and a seeded common base. Generic fallback and free-form AI remain forbidden.

## Structured witnesses

### Common-factor enumeration

Display model:

```text
parallel_factor_sets_with_intersection
```

The learner sees the complete factor set of each operand and must write their intersection. The canonical answer remains the complete ascending common-factor list.

### Greatest common factor

Display model:

```text
common_factor_set_with_gcf
```

The learner sees both complete factor sets, writes their intersection, and then derives the maximum member.

Additive answer model:

```text
commonFactorAndGcfAnswer = {
  commonFactors,
  greatestCommonFactor
}
```

The base S84 artifact and S101 overlay remain immutable. S102 is the higher-precedence additive overlay.

## Blocking validation

```text
G5AU02_P0_COMMON_FACTOR_OPERANDS_DEGENERATE
G5AU02_P0_FACTOR_SET_WITNESS_MISSING
G5AU02_P0_COMMON_FACTOR_INTERSECTION_MISMATCH
G5AU02_P0_GCF_OPERANDS_DEGENERATE
G5AU02_P0_GCF_COMMON_SET_MISSING
G5AU02_P0_GCF_NOT_MAXIMUM
```

Canonical answers and witnesses are independently recomputed from the two operands.

## Acceptance

```text
source runtime: 2 patterns × 64 seeds = 128 / 128 required
browser bundle: 2 patterns × 64 questions = 128 / 128 required
full Node regression = required
S97/S100/S101 backward compatibility = required
GLM-S05 exact 18-layout matrix = required
GLM-S06 270 HTML/PDF matrix = required
GLM-S07 90 answer-boundary matrix = required
GLM-S09 270 actual-column geometry matrix = required
S95/S96D/S96G/S96I/S96Q/S96R = required
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_S101_PARTITION_GEOMETRY_REPRESENTATION_FIXED
GOAL_DISTANCE_TARGET = D1_G5A_U02_S102_NONTRIVIAL_COMMON_FACTOR_WITNESS_FIXED
DISTANCE_REDUCED = two P0 common-factor PatternSpecs gain deterministic nondegenerate operands, complete factor-set witnesses and maximum-from-set derivation
D0_ELIGIBLE = false
NEXT_SHORT_STEP = G5AU02-S103_P0SourceDigitCodeReferenceAndGeneratedFamilySeparation
```
